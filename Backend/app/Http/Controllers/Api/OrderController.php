<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;

class OrderController extends Controller
{
    public function index()
    {
        $orders = Order::with('user', 'product')->get();
        return response()->json([
            'status' => 'success',
            'data' => $orders
        ], 200);
    }

    public function show($id)
    {
        $order = Order::with('user', 'product')->find($id);
        if ($order) {
            return response()->json([
                'status' => 'success',
                'data' => $order
            ], 200);
        }
        return response()->json([
            'status' => 'error',
            'message' => 'Order not found'
        ], 404);
    }

    public function add(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'product_id' => 'required|exists:products,id',
            'total' => 'required|numeric',
        ]);

        $order = Order::create($request->only(['user_id', 'product_id', 'total']));
        return response()->json([
            'status' => 'success',
            'message' => 'Order added',
            'data' => $order
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $order = Order::find($id);
        if ($order) {
            $request->validate([
                'user_id' => 'exists:users,id',
                'product_id' => 'exists:products,id',
                'total' => 'numeric',
            ]);

            $order->update($request->only(['user_id', 'product_id', 'total']));
            return response()->json([
                'status' => 'success',
                'message' => 'Order updated',
                'data' => $order
            ], 200);
        }
        return response()->json([
            'status' => 'error',
            'message' => 'Order not found'
        ], 404);
    }

    public function destroy($id)
    {
        $order = Order::find($id);
        if ($order) {
            $order->delete();
            return response()->json([
                'status' => 'success',
                'message' => 'Order deleted'
            ], 200);
        }
        return response()->json([
            'status' => 'error',
            'message' => 'Order not found'
        ], 404);
    }
}
