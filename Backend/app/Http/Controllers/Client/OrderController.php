<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;

class OrderController extends Controller
{
    // Lấy đơn hàng của user hiện tại
    public function index(Request $request)
    {
        $user = $request->user();
        $orders = Order::with('product')
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'product_name' => optional($order->product)->name,
                    'product_image' => optional($order->product)->image,
                    'total' => $order->total,
                    'shipping_address' => $order->shipping_address,
                    'phone' => $order->phone,
                    'note' => $order->note,
                    'status' => $order->status,
                    'created_at' => $order->created_at,
                    'updated_at' => $order->updated_at
                ];
            });

        return Response::json([
            'data' => $orders,
            'message' => 'Success',
            'status_code' => 200
        ], 200);
    }

    // Lấy chi tiết đơn hàng
    public function show(Request $request, $orderId)
    {
        $user = $request->user();
        $order = Order::with('product')
            ->where('id', $orderId)
            ->where('user_id', $user->id)
            ->first();

        if (!$order) {
            return Response::json([
                'message' => 'Đơn hàng không tồn tại',
                'status_code' => 404
            ], 404);
        }

        return Response::json([
            'data' => [
                'id' => $order->id,
                'product_name' => optional($order->product)->name,
                'product_image' => optional($order->product)->image,
                'total' => $order->total,
                'shipping_address' => $order->shipping_address,
                'phone' => $order->phone,
                'note' => $order->note,
                'status' => $order->status,
                'created_at' => $order->created_at,
                'updated_at' => $order->updated_at
            ],
            'message' => 'Success',
            'status_code' => 200
        ], 200);
    }

    // Tạo đơn hàng từ giỏ hàng
    public function store(Request $request)
    {
        $request->validate([
            'shipping_address' => 'required|string|max:500',
            'phone' => 'required|string|max:20',
            'note' => 'nullable|string|max:1000'
        ]);

        $user = $request->user();
        $cart = session()->get("cart_{$user->id}", []);

        if (empty($cart)) {
            return Response::json([
                'message' => 'Giỏ hàng trống',
                'status_code' => 400
            ], 400);
        }

        $total = 0;
        $orderItems = [];

        foreach ($cart as $productId => $quantity) {
            $product = Product::where('status', 1)->find($productId);
            if ($product) {
                $price = $product->discount ? $product->price * (1 - $product->discount / 100) : $product->price;
                $subtotal = $price * $quantity;
                $total += $subtotal;

                $orderItems[] = [
                    'product_id' => $productId,
                    'product_name' => $product->name,
                    'quantity' => $quantity,
                    'price' => $price,
                    'subtotal' => $subtotal
                ];
            }
        }

        if (empty($orderItems)) {
            return Response::json([
                'message' => 'Không có sản phẩm hợp lệ trong giỏ hàng',
                'status_code' => 400
            ], 400);
        }

        // Tạo đơn hàng
        $order = Order::create([
            'user_id' => $user->id,
            'product_id' => array_keys($cart)[0], // Lấy product_id đầu tiên
            'total' => $total,
            'shipping_address' => $request->shipping_address,
            'phone' => $request->phone,
            'note' => $request->note,
            'status' => 'pending'
        ]);

        // Xóa giỏ hàng sau khi tạo đơn hàng
        session()->forget("cart_{$user->id}");

        return Response::json([
            'data' => [
                'order' => [
                    'id' => $order->id,
                    'total' => $order->total,
                    'shipping_address' => $order->shipping_address,
                    'phone' => $order->phone,
                    'note' => $order->note,
                    'status' => $order->status,
                    'created_at' => $order->created_at
                ],
                'items' => $orderItems
            ],
            'message' => 'Đặt hàng thành công',
            'status_code' => 201
        ], 201);
    }

    // Hủy đơn hàng
    public function cancel(Request $request, $orderId)
    {
        $user = $request->user();
        $order = Order::where('id', $orderId)
            ->where('user_id', $user->id)
            ->first();

        if (!$order) {
            return Response::json([
                'message' => 'Đơn hàng không tồn tại',
                'status_code' => 404
            ], 404);
        }

        // Chỉ cho phép hủy đơn hàng khi đang pending
        if ($order->status !== 'pending') {
            return Response::json([
                'message' => 'Không thể hủy đơn hàng này',
                'status_code' => 400
            ], 400);
        }

        $order->update(['status' => 'cancelled']);

        return Response::json([
            'data' => [
                'id' => $order->id,
                'status' => $order->status,
                'updated_at' => $order->updated_at
            ],
            'message' => 'Hủy đơn hàng thành công',
            'status_code' => 200
        ], 200);
    }
}
