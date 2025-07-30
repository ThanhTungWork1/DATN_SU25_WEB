<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class OrderController extends Controller
{
    /**
     * Lấy danh sách đơn hàng, có phân trang và tìm kiếm.
     */
    public function index(Request $request)
    {
        $query = Order::query();

        if ($request->has('search') && $request->input('search') != '') {
            $searchTerm = $request->input('search');

            $query->where(function ($q) use ($searchTerm) {
                $q->where('id', 'like', '%' . $searchTerm . '%')
                  ->orWhere('customer_name', 'like', '%' . $searchTerm . '%');
            });
        }

        return $query->with('items')->latest()->paginate(15);
    }

    /**
     * Tạo đơn hàng mới.
     */
    public function store(Request $request)
    {
        return DB::transaction(function () use ($request) {
            $data = $request->validate([
                'user_id' => 'required|exists:users,id',
                'status' => 'required|string',
                'is_paid' => 'required|boolean',
                'total_amount' => 'required|numeric',
                'shipping_fee' => 'required|numeric',
                'discount_amount' => 'required|numeric',
                'final_amount' => 'required|numeric',
                'customer_name' => 'required|string',
                'customer_email' => 'required|email',
                'customer_phone' => 'required|string',
                'shipping_address' => 'required|string',
                'payment_method' => 'required|string',
                'notes' => 'nullable|string',
                'items' => 'required|array',
                'items.*.variant_id' => 'required|exists:product_variants,id',
                'items.*.quantity' => 'required|integer|min:1',
            ]);

            $order = Order::create($data);

            // Tạo các sản phẩm trong đơn hàng (order items)
            foreach ($data['items'] as $item) {
                $variant = ProductVariant::with(['product', 'color', 'size'])->find($item['variant_id']);
                if ($variant) {
                    OrderItem::create([
                        'order_id' => $order->id,
                        'variant_id' => $variant->id,
                        'quantity' => $item['quantity'],
                        'price' => $variant->price, // Lấy giá từ biến thể để đảm bảo chính xác
                        // Lưu lại thông tin "snapshot"
                        'product_name' => $variant->product->name,
                        'variant_color_name' => $variant->color->name,
                        'variant_size_name' => $variant->size->name,
                        'variant_sku' => $variant->sku,
                        'variant_image' => $variant->image,
                    ]);
                }
            }
            return $order->load('items');
        });
    }

    /**
     * Hiển thị chi tiết một đơn hàng.
     */
    public function show($id)
    {
        return Order::with('items')->findOrFail($id);
    }

    /**
     * Cập nhật một đơn hàng.
     */
    public function update(Request $request, $id)
    {
        $order = Order::findOrFail($id);

        $validatedData = $request->validate([
            'status' => ['sometimes', 'required', Rule::in(['pending_confirmation', 'confirmed', 'processing', 'shipping', 'delivered', 'completed', 'cancelled'])],
            'is_paid' => 'sometimes|required|boolean',
            'notes' => 'nullable|string',
        ]);

        // Kịch bản 1: Cập nhật trạng thái đơn hàng
        if (isset($validatedData['status'])) {
            if (in_array($validatedData['status'], ['delivered', 'completed'])) {
                $validatedData['is_paid'] = true;
            }
        }

        // Kịch bản 2: Cập nhật trạng thái thanh toán
        if (isset($validatedData['is_paid'])) {
            if ($validatedData['is_paid'] === true || $validatedData['is_paid'] == 1) {
                if ($order->status === 'delivered') {
                    $validatedData['status'] = 'completed';
                }
                if ($order->status === 'pending_confirmation') {
                    $validatedData['status'] = 'confirmed';
                }
            }
        }

        $order->update($validatedData);
        $order->refresh();

        return response()->json([
            'message' => 'Cập nhật đơn hàng thành công!',
            'data' => $order
        ]);
    }

    /**
     * Xóa một đơn hàng.
     */
    public function destroy($id)
    {
        $order = Order::findOrFail($id);
        $order->delete();
        return response()->json(['message' => 'Xóa đơn hàng thành công!']);
    }

    /**
     * Lấy tất cả đơn hàng của một người dùng cụ thể.
     */
    public function getOrdersByUser($userId)
    {
        $orders = Order::where('user_id', $userId)
                       ->with('items')
                       ->latest()
                       ->get();

        if ($orders->isEmpty()) {
            return response()->json(['message' => 'Không tìm thấy đơn hàng nào cho người dùng này.'], 404);
        }

        return response()->json($orders);
    }
}
