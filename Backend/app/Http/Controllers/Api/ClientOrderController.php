<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\ProductVariant;
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

            return response()->json([
                'status' => 'success',
                'message' => 'Lấy chi tiết đơn hàng thành công',
                'data' => $order
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
        try {
            $user = Auth::user();

            // Validate
            $validator = Validator::make($request->all(), [
                'shipping_address' => 'required|string|max:500',
                'shipping_phone' => 'required|string|max:20',
                'shipping_name' => 'required|string|max:255',
                'note' => 'nullable|string|max:1000',
                'items' => 'required|array|min:1',
                'items.*.variant_id' => 'required|exists:product_variants,id',
                'items.*.quantity' => 'required|integer|min:1',
                'items.*.price' => 'required|numeric|min:0'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Dữ liệu không hợp lệ',
                    'errors' => $validator->errors()
                ], 422);
            }

            $data = $validator->validated();


            $total_amount = 0;
            foreach ($data['items'] as $item) {
                $total_amount += $item['price'] * $item['quantity'];
            }


            $shipping_fee = 30000;


            foreach ($data['items'] as $item) {
                $variant = ProductVariant::with('product', 'color', 'size')->find($item['variant_id']);

                if (!$variant) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Không tìm thấy biến thể sản phẩm!'
                    ], 404);
                }

                if ($variant->stock < $item['quantity']) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Sản phẩm ' . $variant->product->name . ' (màu: ' . $variant->color->name . ', size: ' . $variant->size->name . ') không đủ tồn kho! Còn lại: ' . $variant->stock
                    ], 422);
                }
            }

            // Use transaction
            DB::beginTransaction();

            try {
                // Tạo đơn hàng
                $order = Order::create([
                    'user_id' => $user->id,
                    'status' => 'pending',
                    'is_paid' => false,
                    'total_amount' => $total_amount,
                    'shipping_fee' => $shipping_fee,
                    'shipping_address' => $data['shipping_address'],
                    'shipping_phone' => $data['shipping_phone'],
                    'shipping_name' => $data['shipping_name'],
                    'note' => $data['note'] ?? null
                ]);

                // Chuẩn bị mảng dữ liệu cho createMany và trừ tồn kho
                $orderItems = [];
                foreach ($data['items'] as $item) {
                    $variant = ProductVariant::find($item['variant_id']);
                    // Trừ tồn kho
                    $variant->stock -= $item['quantity'];
                    $variant->save();
                    // Thêm vào mảng orderItems
                    $orderItems[] = [
                        'variant_id' => $item['variant_id'],
                        'quantity' => $item['quantity'],
                        'price' => $item['price']
                    ];
                }
                // Tạo nhiều order item cùng lúc
                $order->items()->createMany($orderItems);

                DB::commit();

                // Load lại order với relationships
                $order->load(['items.variant.product', 'items.variant.color', 'items.variant.size']);

                return response()->json([
                    'status' => 'success',
                    'message' => 'Đặt hàng thành công!',
                    'data' => $order
                ], 201);
            } catch (\Exception $e) {
                DB::rollback();
                throw $e;
            }
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Có lỗi xảy ra khi tạo đơn hàng: ' . $e->getMessage()
            ], 500);
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
