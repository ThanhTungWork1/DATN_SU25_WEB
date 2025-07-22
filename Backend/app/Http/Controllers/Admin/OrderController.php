<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB; // THÊM: Import DB để dùng transaction
use Illuminate\Validation\Rule; // THÊM: Import Rule để validation status

class OrderController extends Controller
{
    /**
     * Lấy danh sách đơn hàng, có phân trang và sắp xếp.
     */
    public function index()
    {
        // CẢI TIẾN: Sắp xếp đơn hàng mới nhất lên đầu và phân trang
        // Giúp trang admin không bị chậm khi có nhiều đơn hàng.
        return Order::with('items')->latest()->paginate(15);
    }

    /**
     * Tạo đơn hàng mới (không thay đổi logic, chỉ đảm bảo validation đầy đủ).
     */
    public function store(Request $request)
    {
        // CẢI TIẾN: Bọc trong transaction để đảm bảo toàn vẹn dữ liệu
        // Nếu tạo OrderItem lỗi, toàn bộ đơn hàng sẽ được hủy bỏ.
        DB::transaction(function () use ($request) {
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
                'items.*.product_id' => 'required|exists:products,id',
                'items.*.quantity' => 'required|integer|min:1'
            ]);

            $order = Order::create($data);

            foreach ($data['items'] as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity']
                ]);
            }
            return $order->load('items');
        });
    }

    /**
     * Hiển thị chi tiết một đơn hàng.
     */
    public function show($id)
    {
        // Logic này đã tốt, không cần thay đổi.
        return Order::with('items')->findOrFail($id);
    }

    /**
     * Cập nhật một đơn hàng.
     */
    public function update(Request $request, $id)
    {
        $order = Order::findOrFail($id);

        // CẢI TIẾN: Validate chặt chẽ hơn
        $validatedData = $request->validate([
            'status' => ['sometimes', 'required', Rule::in(['pending', 'confirmed', 'processing', 'shipping', 'delivered', 'cancelled', 'completed'])],
            'is_paid' => 'sometimes|required|boolean',
            'notes' => 'nullable|string',
        ]);

        $order->update($validatedData);

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
        $order->delete(); // Xóa các order items liên quan sẽ được tự động xử lý bởi onDelete('cascade') trong migration

        // CẢI TIẾN: Trả về một thông báo JSON chuẩn
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
