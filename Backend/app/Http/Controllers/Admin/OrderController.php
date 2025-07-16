<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index()
    {
        return Order::with('items')->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'user_id' => 'required|exists:users,id',
            'status' => 'required|string',
            'is_paid' => 'required|boolean',
            'total_amount' => 'required|numeric',
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
    }

    public function show($id)
    {
        return Order::with('items')->findOrFail($id);
    }

   public function update(Request $request, $id)
    {
        $order = Order::findOrFail($id);

        $request->validate([
            // Các trường này là 'sometimes' vì bạn có thể chỉ gửi status hoặc is_paid
            'customer_name' => 'sometimes|required|string|max:255',
            'customer_email' => 'sometimes|required|email|max:255',
            'customer_phone' => 'sometimes|required|string|max:20',
            'shipping_address' => 'sometimes|required|string|max:500',
            'total_amount' => 'sometimes|required|numeric|min:0',
            'shipping_fee' => 'sometimes|required|numeric|min:0',
            'discount_amount' => 'sometimes|required|numeric|min:0',
            'final_amount' => 'sometimes|required|numeric|min:0',

            // QUAN TRỌNG: Validation cho status và is_paid
            'status' => 'sometimes|required|in:pending,confirmed,processing,shipping,delivered,cancelled,completed', // Đảm bảo khớp với các giá trị bạn dùng
            'is_paid' => 'sometimes|required|boolean', // Đảm bảo là boolean

            'notes' => 'nullable|string',
        ]);

        $order->update($request->all()); // Cập nhật các trường được gửi đến

        return response()->json([
            'message' => 'Order updated successfully',
            'data' => $order
        ]);
    }
    public function destroy($id)
    {
        return Order::destroy($id);
    }
}
