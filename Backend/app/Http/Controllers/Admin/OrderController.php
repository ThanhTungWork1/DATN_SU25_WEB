<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class OrderController extends Controller
{
    /**
     * Get paginated list of orders with search functionality
     */
    public function index(Request $request)
    {
        try {
            \Log::info('🔍 [BACKEND DEBUG] Admin orders index called');
            \Log::info('🔍 [BACKEND DEBUG] Request parameters:', $request->all());
            
            $query = Order::with(['items.variant.product', 'items.variant.color', 'items.variant.size']);

            // Search functionality
            if ($request->has('search') && $request->input('search') != '') {
                $searchTerm = $request->input('search');

                $query->where(function ($q) use ($searchTerm) {
                    $q->where('id', 'like', '%' . $searchTerm . '%')
                      ->orWhere('shipping_name', 'like', '%' . $searchTerm . '%')
                      ->orWhere('shipping_phone', 'like', '%' . $searchTerm . '%')
                      ->orWhere('shipping_address', 'like', '%' . $searchTerm . '%');
                });
            }

            // Status filter
            if ($request->has('status') && $request->input('status') != '') {
                $query->where('status', $request->input('status'));
            }

            // Date range filter
            if ($request->has('date_from')) {
                $query->whereDate('created_at', '>=', $request->input('date_from'));
            }
            if ($request->has('date_to')) {
                $query->whereDate('created_at', '<=', $request->input('date_to'));
            }

            $orders = $query->latest()->paginate(15);
            
            \Log::info('🔍 [BACKEND DEBUG] Orders found:', ['count' => $orders->count()]);
            
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
            \Log::error('❌ [BACKEND ERROR] Orders index failed:', ['error' => $e->getMessage()]);
            return response()->json([
                'status' => 'error',
                'message' => 'Có lỗi xảy ra khi lấy danh sách đơn hàng: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create a new order
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'user_id' => 'required|exists:users,id',
                'status' => 'required|in:pending,processing,shipped,delivered,cancelled',
                'is_paid' => 'boolean',
                'total_amount' => 'required|numeric|min:0',
                'shipping_fee' => 'numeric|min:0',
                'discount_amount' => 'numeric|min:0',
                'shipping_name' => 'required|string|max:255',
                'shipping_phone' => 'required|string|max:20',
                'shipping_address' => 'required|string|max:500',
                'payment_method' => 'required|string|max:50',
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

            // Calculate final amount
            $finalAmount = $data['total_amount'] + ($data['shipping_fee'] ?? 0) - ($data['discount_amount'] ?? 0);

            return DB::transaction(function () use ($data, $finalAmount) {
                // Create order
                $order = Order::create([
                    'user_id' => $data['user_id'],
                    'status' => $data['status'],
                    'is_paid' => $data['is_paid'] ?? false,
                    'total_amount' => $data['total_amount'],
                    'shipping_fee' => $data['shipping_fee'] ?? 0,
                    'discount_amount' => $data['discount_amount'] ?? 0,
                    'final_amount' => $finalAmount,
                    'shipping_name' => $data['shipping_name'],
                    'shipping_phone' => $data['shipping_phone'],
                    'shipping_address' => $data['shipping_address'],
                    'payment_method' => $data['payment_method'],
                    'note' => $data['note'] ?? null
                ]);

                // Create order items
                foreach ($data['items'] as $item) {
                    $variant = ProductVariant::with(['product', 'color', 'size'])->find($item['variant_id']);
                    
                    if (!$variant) {
                        throw new \Exception('Không tìm thấy biến thể sản phẩm');
                    }

                    OrderItem::create([
                        'order_id' => $order->id,
                        'variant_id' => $variant->id,
                        'quantity' => $item['quantity'],
                        'price' => $item['price'],
                        'product_name' => $variant->product->name,
                        'variant_color_name' => $variant->color->name,
                        'variant_size_name' => $variant->size->name,
                        'variant_sku' => $variant->sku,
                        'variant_image' => $variant->image,
                    ]);

                    // Update stock
                    $variant->decrement('stock', $item['quantity']);
                }

                return response()->json([
                    'status' => 'success',
                    'message' => 'Tạo đơn hàng thành công',
                    'data' => $order->load(['items.variant.product', 'items.variant.color', 'items.variant.size'])
                ], 201);
            });
        } catch (\Exception $e) {
            \Log::error('❌ [BACKEND ERROR] Order creation failed:', ['error' => $e->getMessage()]);
            return response()->json([
                'status' => 'error',
                'message' => 'Có lỗi xảy ra khi tạo đơn hàng: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified order
     */
    public function show($id)
    {
        try {
            $order = Order::with(['items.variant.product', 'items.variant.color', 'items.variant.size'])
                          ->findOrFail($id);

            return response()->json([
                'status' => 'success',
                'message' => 'Lấy chi tiết đơn hàng thành công',
                'data' => $order
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Không tìm thấy đơn hàng'
            ], 404);
        }
    }

    /**
     * Update the specified order
     */
    public function update(Request $request, $id)
    {
        try {
            $order = Order::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'status' => ['sometimes', 'required', Rule::in(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])],
                'is_paid' => 'sometimes|boolean',
                'note' => 'nullable|string|max:1000',
                'shipping_name' => 'sometimes|string|max:255',
                'shipping_phone' => 'sometimes|string|max:20',
                'shipping_address' => 'sometimes|string|max:500',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Dữ liệu không hợp lệ',
                    'errors' => $validator->errors()
                ], 422);
            }

            $validatedData = $validator->validated();

            // Auto-update payment status based on order status
            if (isset($validatedData['status'])) {
                if (in_array($validatedData['status'], ['delivered', 'completed'])) {
                    $validatedData['is_paid'] = true;
                }
            }

            // Auto-update order status based on payment status
            if (isset($validatedData['is_paid']) && $validatedData['is_paid'] === true) {
                if ($order->status === 'delivered') {
                    $validatedData['status'] = 'completed';
                } elseif ($order->status === 'pending') {
                    $validatedData['status'] = 'processing';
                }
            }

            $order->update($validatedData);
            $order->refresh();

            return response()->json([
                'status' => 'success',
                'message' => 'Cập nhật đơn hàng thành công',
                'data' => $order->load(['items.variant.product', 'items.variant.color', 'items.variant.size'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Có lỗi xảy ra khi cập nhật đơn hàng: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified order
     */
    public function destroy($id)
    {
        try {
            return DB::transaction(function () use ($id) {
                $order = Order::with('items')->findOrFail($id);

                // Restore stock for cancelled orders
                foreach ($order->items as $item) {
                    if ($item->variant) {
                        $item->variant->increment('stock', $item->quantity);
                    }
                }

                // Delete order items first
                $order->items()->delete();
                
                // Delete order
                $order->delete();

                return response()->json([
                    'status' => 'success',
                    'message' => 'Xóa đơn hàng thành công'
                ]);
            });
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Có lỗi xảy ra khi xóa đơn hàng: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get orders by user ID
     */
    public function getOrdersByUser($userId)
    {
        try {
            $user = User::findOrFail($userId);
            
            $orders = Order::where('user_id', $userId)
                           ->with(['items.variant.product', 'items.variant.color', 'items.variant.size'])
                           ->latest()
                           ->get();

            return response()->json([
                'status' => 'success',
                'message' => 'Lấy đơn hàng của người dùng thành công',
                'data' => $orders
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Không tìm thấy người dùng hoặc đơn hàng'
            ], 404);
        }
    }
}
