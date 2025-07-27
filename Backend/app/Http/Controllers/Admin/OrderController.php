<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class OrderController extends Controller
{
    /**
     * Lấy danh sách đơn hàng, có phân trang và sắp xếp.
     */
    public function index()
    {
        return Order::with('items')->latest()->paginate(15);
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

        // =================================================================
        // LOGIC TỰ ĐỘNG CẬP NHẬT TRẠNG THÁI
        // =================================================================

        // Kịch bản 1: Admin thay đổi "Trạng thái Đơn hàng"
        if (isset($validatedData['status'])) {
            // Nếu admin chuyển trạng thái thành "đã giao" hoặc "hoàn thành",
            // hệ thống sẽ tự động coi như đơn hàng này đã được thanh toán.
            if (in_array($validatedData['status'], ['delivered', 'completed'])) {
                $validatedData['is_paid'] = true;
            }
        }

        // Kịch bản 2: Admin thay đổi "Trạng thái Thanh toán"
        if (isset($validatedData['is_paid'])) {
            // Nếu admin chuyển trạng thái thành "Đã thanh toán"
            if ($validatedData['is_paid'] === true) {

                // VÀ đơn hàng hiện tại đang ở trạng thái "Đã giao hàng",
                // thì tự động chuyển trạng thái đơn hàng thành "Đã hoàn thành".
                // (Áp dụng cho trường hợp thu tiền COD thành công).
                if ($order->status === 'delivered') {
                    $validatedData['status'] = 'completed';
                }

                // VÀ đơn hàng hiện tại đang ở trạng thái "Chờ xác nhận",
                // thì tự động chuyển trạng thái đơn hàng thành "Đã xác nhận".
                // (Áp dụng cho trường hợp khách thanh toán trước).
                if ($order->status === 'pending_confirmation') {
                    $validatedData['status'] = 'confirmed';
                }
            }
        }
        // =================================================================

        // Cập nhật đơn hàng với dữ liệu đã được xử lý logic
        $order->update($validatedData);

        // Tải lại model từ database để đảm bảo dữ liệu trả về là mới nhất
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