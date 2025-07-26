<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\VNPayService;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class VNPayController extends Controller
{
    protected $vnpayService;

    public function __construct(VNPayService $vnpayService)
    {
        $this->vnpayService = $vnpayService;
    }

    /**
     * Tạo URL thanh toán VNPay
     */
    public function createPayment(Request $request)
    {
        $request->validate([
            'order_id' => 'required|exists:orders,id',
            'amount' => 'required|numeric|min:0',
        ]);

        $order = Order::findOrFail($request->order_id);

        // Kiểm tra đơn hàng đã thanh toán chưa
        if ($order->is_paid) {
            return response()->json([
                'message' => 'Đơn hàng đã được thanh toán'
            ], 400);
        }

        // Tạo thông tin thanh toán
        $orderInfo = "Thanh toan don hang #" . $order->id;

        // Tạo URL thanh toán VNPay
        $paymentUrl = $this->vnpayService->createPaymentUrl(
            $order->id,
            $order->total_amount,
            $orderInfo
        );

        // Tạo record payment với status pending
        Payment::create([
            'order_id' => $order->id,
            'method' => 'VNPay',
            'status' => 'pending',
            'amount' => $order->total_amount,
        ]);

        return response()->json([
            'payment_url' => $paymentUrl,
            'order_id' => $order->id,
            'amount' => $order->total_amount,
        ], 200);
    }

    /**
     * Xử lý callback từ VNPay
     */
    public function callback(Request $request)
    {
        try {
            // Xác thực callback
            if (!$this->vnpayService->verifyCallback($request)) {
                Log::error('VNPay callback verification failed', $request->all());
                return response()->json(['message' => 'Invalid callback'], 400);
            }

            // Xử lý kết quả thanh toán
            $result = $this->vnpayService->processPaymentResult($request);

            if ($result['success']) {
                // Thanh toán thành công
                $order = Order::find($result['order_id']);

                if (!$order) {
                    Log::error('Order not found', ['order_id' => $result['order_id']]);
                    return response()->json(['message' => 'Order not found'], 404);
                }

                // Cập nhật payment
                $payment = Payment::where('order_id', $order->id)
                    ->where('method', 'VNPay')
                    ->where('status', 'pending')
                    ->first();

                if ($payment) {
                    $payment->update([
                        'status' => 'completed',
                        'paid_at' => now(),
                    ]);
                }

                // Cập nhật đơn hàng
                $order->update([
                    'is_paid' => true,
                    'status' => 'paid'
                ]);

                Log::info('VNPay payment successful', [
                    'order_id' => $order->id,
                    'amount' => $result['amount'],
                    'bank_code' => $result['bank_code']
                ]);

                return response()->json([
                    'message' => 'Thanh toán thành công',
                    'order_id' => $order->id,
                    'amount' => $result['amount']
                ], 200);
            } else {
                // Thanh toán thất bại
                Log::warning('VNPay payment failed', [
                    'order_id' => $result['order_id'],
                    'response_code' => $result['response_code']
                ]);

                return response()->json([
                    'message' => 'Thanh toán thất bại',
                    'response_code' => $result['response_code']
                ], 400);
            }
        } catch (\Exception $e) {
            Log::error('VNPay callback error', [
                'error' => $e->getMessage(),
                'request' => $request->all()
            ]);

            return response()->json([
                'message' => 'Có lỗi xảy ra khi xử lý thanh toán'
            ], 500);
        }
    }

    /**
     * Xử lý IPN (Instant Payment Notification)
     */
    public function ipn(Request $request)
    {
        try {
            // Xác thực IPN
            if (!$this->vnpayService->verifyCallback($request)) {
                Log::error('VNPay IPN verification failed', $request->all());
                return response()->json(['message' => 'Invalid IPN'], 400);
            }

            // Xử lý kết quả thanh toán
            $result = $this->vnpayService->processPaymentResult($request);

            if ($result['success']) {
                $order = Order::find($result['order_id']);

                if ($order && !$order->is_paid) {
                    // Cập nhật payment
                    $payment = Payment::where('order_id', $order->id)
                        ->where('method', 'VNPay')
                        ->first();

                    if ($payment) {
                        $payment->update([
                            'status' => 'completed',
                            'paid_at' => now(),
                        ]);
                    }

                    // Cập nhật đơn hàng
                    $order->update([
                        'is_paid' => true,
                        'status' => 'paid'
                    ]);

                    Log::info('VNPay IPN payment successful', [
                        'order_id' => $order->id,
                        'amount' => $result['amount']
                    ]);
                }
            }

            return response()->json(['message' => 'IPN processed'], 200);
        } catch (\Exception $e) {
            Log::error('VNPay IPN error', [
                'error' => $e->getMessage(),
                'request' => $request->all()
            ]);

            return response()->json(['message' => 'IPN error'], 500);
        }
    }
}
