<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Payment;
use App\Models\Order;

class PaymentController extends Controller
{
    // GET /api/payments/{order_id}
    public function show($order_id)
    {
        $payment = Payment::where('order_id', $order_id)->first();

        if (!$payment) {
            return response()->json(['message' => 'No payment found for this order'], 404);
        }

        return response()->json($payment, 200);
    }

    // POST /api/payments
    public function store(Request $request)
    {
        $request->validate([
            'order_id' => 'required|exists:orders,id',
            'method' => 'required|string|max:50',
            'amount' => 'required|numeric|min:0',
        ]);

        $order = Order::find($request->order_id);
        if ($order->is_paid) {
            return response()->json(['message' => 'Order already paid'], 400);
        }

        $payment = Payment::create([
            'order_id' => $request->order_id,
            'method' => $request->method,
            'status' => 'completed',
            'amount' => $request->amount,
            'paid_at' => now(),
        ]);

        // Cập nhật đơn hàng
        $order->is_paid = 1;
        $order->save();

        return response()->json([
            'message' => 'Payment successful',
            'payment' => $payment,
        ], 201);
    }
}
