<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response as ResponseFacade;
use App\Models\Payment;
use App\Models\Order;

class PaymentController extends Controller
{
    // GET /api/payments/{order_id}
    public function show($order_id)
    {
        $payment = Payment::where('order_id', $order_id)->first();

        if (!$payment) {
            return ResponseFacade::json(['message' => 'No payment found for this order'], 404);
        }

        return ResponseFacade::json($payment, 200);
    }

    // POST /api/payments
    public function store(Request $request)
    {
        $request->validate([
            'order_id' => 'required|exists:orders,id',
            'method' => 'required|string|max:50',
            'amount' => 'required|numeric|min:0',
            'transaction_id' => 'nullable|string',
            'bank_code' => 'nullable|string',
        ]);

        $order = Order::find($request->input('order_id'));
        if ($order->is_paid) {
            return ResponseFacade::json(['message' => 'Order already paid'], 400);
        }

        // Xử lý thanh toán theo phương thức
        $status = 'pending';
        $paid_at = null;

        if ($request->method === 'COD') {
            // COD - chờ xác nhận
            $status = 'pending';
        } elseif (in_array($request->method, ['Chuyển khoản ngân hàng', 'Ví điện tử (Momo/ZaloPay)'])) {
            // Thanh toán online - chờ xác nhận từ ngân hàng
            $status = 'pending';
        }

        $payment = Payment::create([
            'order_id' => $request->input('order_id'),
            'method' => $request->input('method'),
            'status' => $status,
            'amount' => $request->input('amount'),
            'transaction_id' => $request->input('transaction_id'),
            'bank_code' => $request->input('bank_code'),
            'paid_at' => $paid_at,
        ]);

        // Nếu thanh toán thành công ngay (hiếm khi xảy ra, trừ test)
        if ($status === 'completed') {
            $order->is_paid = 1;
            $order->status = 'confirmed';
            $order->save();
        }

        return ResponseFacade::json([
            'message' => 'Payment created successfully',
            'payment' => $payment,
            'order' => $order,
        ], 201);
    }

    // Webhook để nhận thông báo từ ngân hàng
    public function webhook(Request $request)
    {
        try {
            \Log::info('Payment webhook received:', $request->all());

            $transactionId = $request->input('transaction_id') ?? $request->input('transId');
            $amount = $request->input('amount');
            $status = $request->input('status') ?? $request->input('resultCode');
            $orderId = $request->input('order_id') ?? $request->input('orderId');

            if (!$transactionId || !$orderId) {
                return response()->json(['message' => 'Invalid webhook data'], 400);
            }

            $payment = Payment::where('transaction_id', $transactionId)
                ->orWhere('order_id', $orderId)
                ->first();

            if (!$payment) {
                return response()->json(['message' => 'Payment not found'], 404);
            }

            if ($status == '0' || $status == 'success' || $status == 'PAID') {
                $payment->status = 'completed';
                $payment->paid_at = now();
                $payment->save();

                $order = $payment->order;
                $order->is_paid = 1;
                $order->status = 'confirmed';
                $order->save();

                return response()->json(['message' => 'Payment confirmed'], 200);
            } else {
                $payment->status = 'failed';
                $payment->save();

                return response()->json(['message' => 'Payment failed'], 200);
            }
        } catch (\Exception $e) {
            \Log::error('Payment webhook error:', ['error' => $e->getMessage()]);
            return response()->json(['message' => 'Webhook processing failed'], 500);
        }
    }

    // Kiểm tra trạng thái thanh toán
    public function checkStatus($orderId)
    {
        try {
            $order = Order::with('payments')->find($orderId);

            if (!$order) {
                return response()->json(['message' => 'Order not found'], 404);
            }

            $latestPayment = $order->payments()->latest()->first();

            return response()->json([
                'order_id' => $order->id,
                'is_paid' => $order->is_paid,
                'order_status' => $order->status,
                'payment_status' => $latestPayment ? $latestPayment->status : 'no_payment',
                'payment_method' => $latestPayment ? $latestPayment->method : null,
                'paid_at' => $latestPayment ? $latestPayment->paid_at : null,
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error checking payment status'], 500);
        }
    }
}
