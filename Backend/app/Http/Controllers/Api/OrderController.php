<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Services\OrderService;
use Illuminate\Http\Request;

class OrderController extends Controller
{

    public function __construct(
        protected OrderService $orderService
    ) {}

    public function index()
    {

        return Order::with('items.variant.product')->paginate();
    }
    public function add(Request $request)
    {
        return $this->store($request);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'user_id' => 'required|exists:users,id',
            'status' => 'required|string',
            'is_paid' => 'required|boolean',
            'total_amount' => 'required|numeric',
            'shipping_fee' => 'required|numeric',
            'items' => 'required|array',
            'items.*.variant_id' => 'required|exists:product_variants,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric'
        ]);

        // Kiểm tra tồn kho cho từng sản phẩm
        foreach ($data['items'] as $item) {
            $variant = \App\Models\ProductVariant::find($item['variant_id']);
            if (!$variant) {
                return response()->json(['message' => 'Không tìm thấy biến thể sản phẩm!'], 404);
            }
            if ($variant->stock < $item['quantity']) {
                return response()->json([
                    'message' => 'Sản phẩm ' . ($variant->product->name ?? '') . ' (màu: ' . ($variant->color->name ?? '') . ', size: ' . ($variant->size->name ?? '') . ') không đủ tồn kho!'
                ], 422);
            }
        }

        // Tạo đơn hàng
        $order = Order::create([
            'user_id' => $data['user_id'],
            'status' => $data['status'],
            'is_paid' => $data['is_paid'],
            'total_amount' => $data['total_amount'],
            'shipping_fee' => $data['shipping_fee']
        ]);

        foreach ($data['items'] as $item) {
            // Trừ tồn kho
            $variant = \App\Models\ProductVariant::find($item['variant_id']);
            $variant->stock -= $item['quantity'];
            $variant->save();

            OrderItem::create([
                'order_id' => $order->id,
                'variant_id' => $item['variant_id'],
                'quantity' => $item['quantity'],
                'price' => $item['price']
            ]);
        }

        return response()->json($order->load('items.variant.product'), 201);
    }

    public function show($id)
    {
        return Order::with('items.variant.product')->findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $order = Order::findOrFail($id);
        $order->update($request->only(['status', 'is_paid']));
        return $order->load('items.variant.product');
    }

    public function destroy($id)
    {
        return Order::destroy($id);
    }
}
