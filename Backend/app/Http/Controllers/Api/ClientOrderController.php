<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Validator;

class ClientOrderController extends Controller
{
    /**
     * Sinh mã đơn hàng dạng ORD-YYYYMMDD-XXXX
     */
    private static function generateOrderCode(): string
    {
        $date = now()->format('Ymd');
        $rand = str_pad((string)random_int(0, 9999), 4, '0', STR_PAD_LEFT);
        return "ORD-{$date}-{$rand}";
    }

    /**
     * Lấy danh sách đơn hàng của user hiện tại
     */
    public function index(Request $request)
    {
        try {
            $user = Auth::user();

            $query = Order::where('user_id', $user->id)
                ->with(['items.variant.product', 'items.variant.color', 'items.variant.size'])
                ->orderBy('created_at', 'desc');

            // Lọc theo trạng thái nếu có
            if ($request->has('status') && $request->status !== '') {
                $query->where('status', $request->status);
            }

            if ($request->has('date_from')) {
                $query->whereDate('created_at', '>=', $request->date_from);
            }
            if ($request->has('date_to')) {
                $query->whereDate('created_at', '<=', $request->date_to);
            }

            $orders = $query->paginate(10);

            $customer = $user;
            $ordersData = collect($orders->items())->map(function ($order) use ($customer) {
                return [
                    'id' => $order->id,
                    'customer_name' => $customer->name,
                    'customer_email' => $customer->email,
                    'customer_phone' => $customer->phone,
                    'shipping_address' => $order->shipping_address,
                    'payment_method' => $order->payment_method,
                    'discount_amount' => $order->discount_amount,
                    'total_amount' => $order->total_amount,
                    'shipping_fee' => $order->shipping_fee,
                    'status' => $order->status,
                    'is_paid' => $order->is_paid,
                    'note' => $order->note,
                    'created_at' => $order->created_at,
                    'items' => $order->items,
                ];
            });

            return response()->json([
                'status' => 'success',
                'message' => 'Lấy danh sách đơn hàng thành công',
                'data' => $ordersData,
                'pagination' => [
                    'current_page' => $orders->currentPage(),
                    'last_page' => $orders->lastPage(),
                    'per_page' => $orders->perPage(),
                    'total' => $orders->total()
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Có lỗi xảy ra: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Lấy chi tiết đơn hàng
     */
    public function show($id)
    {
        try {
            $user = Auth::user();

            $order = Order::where('user_id', $user->id)
                ->where('id', $id)
                ->with(['items.variant.product', 'items.variant.color', 'items.variant.size'])
                ->first();

            if (!$order) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Không tìm thấy đơn hàng'
                ], 404);
            }

            // Lấy thông tin user
            $customer = $user;

            // Trả về đúng format FE yêu cầu
            $orderData = [
                'id' => $order->id,
                'customer_name' => $customer->name,
                'customer_email' => $customer->email,
                'customer_phone' => $customer->phone,
                'shipping_address' => $order->shipping_address,
                'payment_method' => $order->payment_method,
                'discount_amount' => $order->discount_amount,
                'total_amount' => $order->total_amount,
                'shipping_fee' => $order->shipping_fee,
                'status' => $order->status,
                'is_paid' => $order->is_paid,
                'note' => $order->note,
                'created_at' => $order->created_at,
                'items' => $order->items,
            ];

            return response()->json([
                'status' => 'success',
                'message' => 'Lấy chi tiết đơn hàng thành công',
                'data' => $orderData
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Có lỗi xảy ra: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Tạo đơn hàng mới
     */
    public function store(Request $request)
    {
        try {
            $user = Auth::user();
            if (!$user) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Vui lòng đăng nhập để đặt hàng.'
                ], 401);
            }

            // Validate dữ liệu đầu vào
            $validator = Validator::make($request->all(), [
                'shipping_address' => 'required|string|max:500',
                'shipping_phone'   => 'required|string|max:20',
                'shipping_name'    => 'required|string|max:255',
                'note'             => 'nullable|string|max:1000',
                'payment_method'   => 'required|string|max:100',
                'discount_amount'  => 'nullable|numeric|min:0',
                'items'            => 'required|array|min:1',
                'items.*.variant_id' => 'required|exists:product_variants,id',
                'items.*.quantity'   => 'required|integer|min:1',
            ]);

            if ($validator->fails()) {
                Log::warning('ClientOrderController@store validation failed', [
                    'errors' => $validator->errors()->toArray(),
                ]);
                return response()->json([
                    'status' => 'error',
                    'message' => 'Dữ liệu không hợp lệ',
                    'errors' => $validator->errors()
                ], 422);
            }

            $data = $validator->validated();
            Log::info('ClientOrderController@store validated', ['data' => $data]);

            // Tính tổng tiền và kiểm tra giá
            $total_amount = 0;
            foreach ($data['items'] as $item) {
                $variant = ProductVariant::with(['product', 'color', 'size'])->find($item['variant_id']);
                if (!$variant) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Không tìm thấy biến thể sản phẩm!'
                    ], 404);
                }

                // Bỏ kiểm tra giá từ request; giá sẽ luôn lấy theo DB để đảm bảo chính xác

                if ($variant->stock < $item['quantity']) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Sản phẩm ' . optional($variant->product)->name .
                            ' (màu: ' . optional($variant->color)->name .
                            ', size: ' . optional($variant->size)->name .
                            ') không đủ tồn kho! Còn lại: ' . $variant->stock
                    ], 422);
                }

                $total_amount += $variant->price * $item['quantity'];
            }

            // Chỉ cộng phí ship 1 lần
            $shipping_fee = $total_amount > 0 ? 30000 : 0;
            $discount = (float)($data['discount_amount'] ?? 0);
            $final_amount = max(0, $total_amount + $shipping_fee - $discount);

            Log::info('ClientOrderController@store price calculation', [
                'total_amount' => $total_amount,
                'shipping_fee' => $shipping_fee,
                'discount' => $discount,
                'final_amount' => $final_amount,
            ]);

            DB::beginTransaction();

            // Chuẩn bị dữ liệu tạo đơn hàng
            $orderData = [
                'user_id' => $user->id,
                'status' => 'pending',
                'is_paid' => false,
                'total_amount' => $total_amount,
                'shipping_fee' => $shipping_fee,
                'discount_amount' => $discount,
                'shipping_address' => $data['shipping_address'],
                'shipping_phone' => $data['shipping_phone'],
                'shipping_name' => $data['shipping_name'],
                'note' => $data['note'] ?? null,
                'payment_method' => $data['payment_method'],
            ];

            // Chỉ thêm các cột nếu tồn tại trong schema
            if (Schema::hasColumn('orders', 'final_amount')) {
                $orderData['final_amount'] = $final_amount;
            }
            if (Schema::hasColumn('orders', 'order_code')) {
                $orderData['order_code'] = self::generateOrderCode();
            }
            if (Schema::hasColumn('orders', 'customer_name')) {
                $orderData['customer_name'] = $data['shipping_name'];
            }
            if (Schema::hasColumn('orders', 'customer_email')) {
                $orderData['customer_email'] = $user->email;
            }
            if (Schema::hasColumn('orders', 'customer_phone')) {
                $orderData['customer_phone'] = $data['shipping_phone'];
            }

            // Tạo đơn hàng
            $order = Order::create($orderData);
            Log::info('ClientOrderController@store order created', ['order_id' => $order->id]);

            $orderItems = [];
            foreach ($data['items'] as $item) {
                $variant = ProductVariant::with(['product', 'color', 'size'])->find($item['variant_id']);

                // Không fail nếu thiếu quan hệ; dùng optional() để snapshot an toàn

                // Validate giá biến thể: không được null/invalid
                if ($variant === null || $variant->price === null || $variant->price === '' || !is_numeric($variant->price)) {
                    Log::warning('ClientOrderController@store variant price invalid', [
                        'variant_id' => $item['variant_id'],
                        'price' => $variant->price ?? null,
                    ]);
                    DB::rollBack();
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Giá sản phẩm tạm thời không khả dụng cho biến thể ' . $item['variant_id']
                    ], 422);
                }

                // Trừ tồn kho
                $variant->decrement('stock', $item['quantity']);

                // Chuẩn bị dữ liệu order item
                $orderItem = [
                    'variant_id' => $item['variant_id'],
                    'quantity' => $item['quantity'],
                    'price' => (float) $variant->price,
                ];

                // Chỉ thêm các cột nếu tồn tại trong schema (và đảm bảo không-null)
                if (Schema::hasColumn('order_items', 'product_name')) {
                    $orderItem['product_name'] = optional($variant->product)->name ?? 'Sản phẩm không xác định';
                }
                if (Schema::hasColumn('order_items', 'variant_color_name')) {
                    $orderItem['variant_color_name'] = optional($variant->color)->name ?? 'Không có';
                }
                if (Schema::hasColumn('order_items', 'variant_size_name')) {
                    $orderItem['variant_size_name'] = optional($variant->size)->name ?? 'Không có';
                }

                $orderItems[] = $orderItem;
            }

            $order->items()->createMany($orderItems);
            Log::info('ClientOrderController@store order items created', ['count' => count($orderItems)]);

            DB::commit();

            return response()->json([
                'status' => 'success',
                'message' => 'Đặt hàng thành công!',
                'data' => $order->load(['items.variant.product', 'items.variant.color', 'items.variant.size'])
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('ClientOrderController@store failed', [
                'exception' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json([
                'status' => 'error',
                'message' => 'Có lỗi xảy ra khi tạo đơn hàng: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cập nhật đơn hàng
     */
    public function update(Request $request, $id)
    {
        try {
            $user = Auth::user();

            $order = Order::where('user_id', $user->id)
                ->where('id', $id)
                ->with('items')
                ->first();

            if (!$order) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Không tìm thấy đơn hàng'
                ], 404);
            }

            // Chỉ cho phép hủy đơn hàng ở trạng thái pending hoặc processing
            if (!in_array($order->status, ['pending', 'processing'])) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Không thể hủy đơn hàng ở trạng thái này'
                ], 422);
            }

            $validator = Validator::make($request->all(), [
                'status' => 'required|in:cancelled'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Dữ liệu không hợp lệ',
                    'errors' => $validator->errors()
                ], 422);
            }

            DB::beginTransaction();

            try {
                $order->update(['status' => $request->status]);

                // Hoàn trả tồn kho nếu hủy đơn
                if ($request->status === 'cancelled') {
                    foreach ($order->items as $item) {
                        $variant = ProductVariant::find($item->variant_id);
                        $variant->stock += $item->quantity;
                        $variant->save();
                    }
                }

                DB::commit();

                $order->load(['items.variant.product', 'items.variant.color', 'items.variant.size']);

                return response()->json([
                    'status' => 'success',
                    'message' => 'Cập nhật đơn hàng thành công',
                    'data' => $order
                ]);
            } catch (\Exception $e) {
                DB::rollback();
                throw $e;
            }
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Có lỗi xảy ra khi cập nhật đơn hàng: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Hủy đơn hàng
     */
    public function destroy($id)
    {
        try {
            $user = Auth::user();

            $order = Order::where('user_id', $user->id)
                ->where('id', $id)
                ->with('items')
                ->first();

            if (!$order) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Không tìm thấy đơn hàng'
                ], 404);
            }

            // Chỉ cho phép hủy đơn hàng ở trạng thái pending hoặc processing
            if (!in_array($order->status, ['pending', 'processing'])) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Không thể hủy đơn hàng ở trạng thái này'
                ], 422);
            }

            DB::beginTransaction();

            try {
                // Hoàn trả tồn kho
                foreach ($order->items as $item) {
                    $variant = ProductVariant::find($item->variant_id);
                    $variant->stock += $item->quantity;
                    $variant->save();
                }

                // Xóa order items trước
                $order->items()->delete();

                // Xóa order
                $order->delete();

                DB::commit();

                return response()->json([
                    'status' => 'success',
                    'message' => 'Hủy đơn hàng thành công'
                ]);
            } catch (\Exception $e) {
                DB::rollback();
                throw $e;
            }
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Có lỗi xảy ra khi hủy đơn hàng: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Lấy thống kê đơn hàng của user
     */
    public function statistics()
    {
        try {
            $user = Auth::user();

            $statistics = [
                'total_orders' => Order::where('user_id', $user->id)->count(),
                'pending_orders' => Order::where('user_id', $user->id)->where('status', 'pending')->count(),
                'processing_orders' => Order::where('user_id', $user->id)->where('status', 'processing')->count(),
                'shipped_orders' => Order::where('user_id', $user->id)->where('status', 'shipped')->count(),
                'delivered_orders' => Order::where('user_id', $user->id)->where('status', 'delivered')->count(),
                'cancelled_orders' => Order::where('user_id', $user->id)->where('status', 'cancelled')->count(),
            ];

            return response()->json([
                'status' => 'success',
                'message' => 'Lấy thống kê thành công',
                'data' => $statistics
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Có lỗi xảy ra: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Lấy đơn hàng theo trạng thái
     */
    public function getByStatus($status)
    {
        try {
            $user = Auth::user();

            $validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

            if (!in_array($status, $validStatuses)) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Trạng thái không hợp lệ'
                ], 422);
            }

            $orders = Order::where('user_id', $user->id)
                ->where('status', $status)
                ->with(['items.variant.product', 'items.variant.color', 'items.variant.size'])
                ->orderBy('created_at', 'desc')
                ->paginate(10);

            return response()->json([
                'status' => 'success',
                'message' => 'Lấy đơn hàng theo trạng thái thành công',
                'data' => $orders->items(),
                'pagination' => [
                    'current_page' => $orders->currentPage(),
                    'last_page' => $orders->lastPage(),
                    'per_page' => $orders->perPage(),
                    'total' => $orders->total()
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Có lỗi xảy ra: ' . $e->getMessage()
            ], 500);
        }
    }
}