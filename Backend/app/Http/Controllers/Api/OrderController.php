<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Services\OrderService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Enums\OrderStatus;

class OrderController extends Controller
{
    public function __construct(
        protected OrderService $orderService
    ) {
    }

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
            'status' => 'required|string|in:' . implode(',', OrderStatus::all()),
            'is_paid' => 'required|boolean',
            'total_amount' => 'required|numeric',
            'shipping_fee' => 'required|numeric',
            'sold_number' => 'nullable|numeric',
            'items' => 'required|array',
            'items.*.variant_id' => 'required|exists:product_variants,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric'
        ]);

        // Kiểm tra tồn kho
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
            'shipping_fee' => $data['shipping_fee'],
            'sold_number' => $data['sold_number'] ?? null,
        ]);

        foreach ($data['items'] as $item) {
            // Trừ tồn kho nếu ngay lập tức xác nhận đơn
            $variant = \App\Models\ProductVariant::find($item['variant_id']);
            if ($data['status'] === OrderStatus::CONFIRMED) {
                $variant->stock -= $item['quantity'];
                $variant->save();
            }

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

    public function updateStatus(Request $request, $id)
    {
        $order = Order::with('items.variant')->findOrFail($id);

        $oldStatus = $order->status;
        $newStatus = $request->input('status');

        if (!in_array($newStatus, OrderStatus::all())) {
            return response()->json(['message' => 'Trạng thái không hợp lệ'], 400);
        }

        DB::transaction(function () use ($order, $oldStatus, $newStatus) {
            // Từ pending → confirmed: trừ kho
            if ($oldStatus === OrderStatus::PENDING && $newStatus === OrderStatus::CONFIRMED) {
                foreach ($order->items as $item) {
                    $item->variant->decrement('stock', $item->quantity);
                }
            }

            // Từ confirmed → canceled: cộng lại kho
            if ($oldStatus === OrderStatus::CONFIRMED && $newStatus === OrderStatus::CANCELED) {
                foreach ($order->items as $item) {
                    $item->variant->increment('stock', $item->quantity);
                }
            }

            // Cập nhật trạng thái đơn hàng
            $order->update(['status' => $newStatus]);
        });

        return response()->json(['message' => 'Cập nhật trạng thái thành công']);
    }
}
