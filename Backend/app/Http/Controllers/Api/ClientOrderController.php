<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\ProductVariant;
use App\Models\Voucher;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class ClientOrderController extends Controller
{
    /**
     * Lấy danh sách đơn hàng của user hiện tại
     */
    public function index(Request $request)
    {
        try {
            $user = Auth::user();

            $query = Order::where('user_id', $user->id)
                ->with(['items.variant.product', 'items.variant.color', 'items.variant.size', 'refund_request'])
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

            return response()->json([
                'status' => 'success',
                'message' => 'Lấy danh sách đơn hàng thành công',
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


        public function store(Request $request)
    {
        Log::info('Bắt đầu xử lý đơn hàng mới.', ['request_data' => $request->all()]);

        // Log chi tiết các giá trị tiền tệ để debug
        Log::info('Giá trị tiền tệ nhận được:', [
            'total_amount_from_items' => collect($request->input('items', []))->sum(function($item) {
                $variant = \App\Models\ProductVariant::find($item['variant_id']);
                if (!$variant) return 0;
                $price = $variant->sale_price > 0 ? $variant->sale_price : $variant->price;
                return $price * $item['quantity'];
            }),
            'discount_amount_received' => $request->input('discount_amount'),
        ]);

        $validator = Validator::make($request->all(), [
            'shipping_address' => 'required|string|max:500',
            'shipping_phone' => 'required|string|max:20',
            'shipping_name' => 'required|string|max:255',
            'customer_name' => 'required|string|max:255',
            'customer_phone' => 'required|string|max:20',
            'note' => 'nullable|string|max:1000',
            'payment_method' => 'required|string|max:100',
            'voucher_code' => 'nullable|string|exists:vouchers,code',
            'items' => 'required|array|min:1',
            'items.*.variant_id' => 'required|exists:product_variants,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'message' => 'Dữ liệu không hợp lệ', 'errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        $user = Auth::user();

        DB::beginTransaction();

        try {
            $total_amount = 0;
            $total_quantity = 0;
            $orderItemsData = [];

            foreach ($data['items'] as $item) {
                $variant = ProductVariant::with(['product', 'color', 'size'])->find($item['variant_id']);

                if (!$variant) {
                    throw new \Exception('Không tìm thấy biến thể sản phẩm với ID: ' . $item['variant_id']);
                }
                if ($variant->stock < $item['quantity']) {
                    throw new \Exception('Sản phẩm ' . $variant->product->name . ' không đủ tồn kho.');
                }

                // Logic lấy giá an toàn: Ưu tiên giá từ request -> giá sale -> giá gốc -> giá sản phẩm cha
                $price = $item['price'] ?? ($variant->sale_price > 0 ? $variant->sale_price : $variant->price) ?? $variant->product->price;

                if (is_null($price)) {
                    // Nếu không thể xác định giá, ném ra lỗi rõ ràng
                    throw new \Exception('Không thể xác định giá cho sản phẩm: ' . $variant->product->name);
                }

                $total_amount += $price * $item['quantity'];
                $total_quantity += $item['quantity'];

                $orderItemsData[] = [
                    'variant_id' => $item['variant_id'],
                    'quantity' => $item['quantity'],
                    'price' => $price, // Snapshot giá tại thời điểm đặt hàng
                    'product_name' => $variant->product->name,
                    'variant_color_name' => $variant->color->name ?? null,
                    'variant_size_name' => $variant->size->name ?? null,
                    // Lưu URL ảnh để hiển thị lại trong lịch sử đơn hàng
                    'image_url' => $variant->image_url ?? $variant->product->image_url ?? null
                ];
            }

            // === Xử lý Voucher an toàn ở Backend ===
            $discount_amount = 0;
            $voucher_id = null;
            $voucher_code = $data['voucher_code'] ?? null;

            if ($voucher_code) {
                $voucher = Voucher::where('code', $voucher_code)->first();

                if (!$voucher) {
                    throw new \Exception('Mã giảm giá không hợp lệ.');
                }

                // Kiểm tra các điều kiện của voucher
                if (!$voucher->status || $voucher->start_date > now() || $voucher->end_date < now()) {
                    throw new \Exception('Mã giảm giá không hoạt động hoặc đã hết hạn.');
                }
                if ($voucher->used_count >= $voucher->quantity) {
                    throw new \Exception('Mã giảm giá đã hết lượt sử dụng.');
                }
                if ($total_amount < $voucher->min_order_amount) {
                    throw new \Exception('Đơn hàng chưa đạt giá trị tối thiểu để áp dụng mã giảm giá.');
                }

                // Tính toán số tiền giảm giá
                if ($voucher->discount_type === 'fixed') {
                    $discount_amount = $voucher->value;
                } elseif ($voucher->discount_type === 'percentage') {
                    $calculated_discount = ($total_amount * $voucher->value) / 100;
                    $discount_amount = isset($voucher->max_value) ? min($calculated_discount, $voucher->max_value) : $calculated_discount;
                }
                $voucher_id = $voucher->id;
            }

            $shipping_fee = $total_amount >= 500000 ? 0 : 30000;
            $final_amount = $total_amount + $shipping_fee - $discount_amount;

            $order = Order::create([
                'voucher_id' => $voucher_id, // Thêm voucher_id vào đơn hàng
                'user_id' => $user->id,
                'order_code' => 'ORD-' . strtoupper(uniqid()),
                'total_quantity' => $total_quantity,
                'total_amount' => $total_amount,
                'shipping_fee' => $shipping_fee,
                'discount_amount' => $discount_amount,
                'final_amount' => $final_amount,
                'shipping_address' => $data['shipping_address'],
                'shipping_phone' => $data['shipping_phone'],
                'shipping_name' => $data['shipping_name'],
                'customer_name' => $data['customer_name'],
                'customer_phone' => $data['customer_phone'],
                'customer_email' => $user->email,
                'note' => $data['note'] ?? null,
                'payment_method' => $data['payment_method'],
                'status' => $data['payment_method'] === 'VNPay' ? 'waiting_for_payment' : 'pending',
                'is_paid' => false,
            ]);

            $order->items()->createMany($orderItemsData);

            // Update stock and sold count
            foreach ($data['items'] as $item) {
                $variant = ProductVariant::find($item['variant_id']);
                $variant->stock -= $item['quantity'];
                $variant->product->sold += $item['quantity'];
                $variant->save();
                $variant->product->save();
            }

            DB::commit();

            // Tải lại các mối quan hệ cần thiết để trả về cho client, bao gồm cả ảnh
            $order->load(['items.variant' => function ($query) {
                $query->with(['product', 'color', 'size']);
            }]);

            // Đảm bảo dữ liệu trả về nhất quán với frontend
            $order->total_amount = (int)$order->total_amount;
            $order->final_amount = (int)$order->final_amount;
            $order->shipping_fee = (int)$order->shipping_fee;
            $order->discount_amount = (int)$order->discount_amount;
            foreach ($order->items as $item) {
                $item->price = (int)$item->price;
            }

            // Cập nhật lượt sử dụng voucher sau khi đơn hàng thành công
            if (isset($voucher) && $voucher) {
                $voucher->increment('used_count');
            }

            return response()->json(['status' => 'success', 'message' => 'Đặt hàng thành công!', 'data' => $order], 201);
        } catch (\Exception $e) {
            DB::rollback();
            Log::error('Lỗi khi tạo đơn hàng: ' . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

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
                // Cập nhật trạng thái đơn hàng
                $order->status = 'cancelled';
                $order->save();

                // Hoàn trả tồn kho
                foreach ($order->items as $item) {
                    $variant = ProductVariant::find($item->variant_id);
                    if ($variant) {
                        $variant->stock += $item->quantity;
                        $variant->save();
                    }
                }

                DB::commit();

                // Trả về đơn hàng đã được cập nhật
                $order->load(['items.variant.product', 'items.variant.color', 'items.variant.size']);

                return response()->json([
                    'status' => 'success',
                    'message' => 'Hủy đơn hàng thành công',
                    'data' => $order
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

            $validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'completed', 'cancelled'];

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
