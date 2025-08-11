<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\Payment;
use App\Services\ZaloPayService;
use Illuminate\Support\Facades\Log;

class ZaloPayController extends Controller
{
    protected $zaloPayService;

    public function __construct(ZaloPayService $zaloPayService)
    {
        $this->zaloPayService = $zaloPayService;
    }

    public function createOrder(Request $request)
    {
        try {
            $order = Order::with('voucher')->findOrFail($request->order_id);

            // Tính giảm giá từ voucher nếu có
            $discount = 0;
            if ($order->voucher) {
                $discount = $order->voucher->calculateDiscount($order->total_amount);
            }

            // Tổng tiền thanh toán cho ZaloPay
            $amount = (int) round($order->total_amount + $order->shipping_fee - $discount);

            // Tạo payment record trong database trước
            $payment = Payment::create([
                'order_id' => $order->id,
                'method' => 'zalopay',
                'amount' => $amount,
                'status' => 'pending',
                'created_at' => now(),
            ]);

            // Gửi sang ZaloPay
            $result = $this->zaloPayService->createOrder($order, $amount);

            if (isset($result['order_url'])) {
                // Cập nhật transaction_id từ ZaloPay response
                if (isset($result['app_trans_id'])) {
                    $payment->update(['transaction_id' => $result['app_trans_id']]);
                }

                return response()->json([
                    'success' => true,
                    'pay_url' => $result['order_url'],
                    'order_token' => $result['zp_trans_token'] ?? null,
                    'app_trans_id' => $result['app_trans_id'] ?? null,
                    'payment_id' => $payment->id,
                    'amount' => $amount,
                    'order_id' => $order->id
                ]);
            }

            // Nếu tạo ZaloPay order thất bại, xóa payment record
            $payment->delete();
            return response()->json(['error' => 'Không thể tạo đơn thanh toán ZaloPay', 'details' => $result], 400);

        } catch (\Exception $e) {
            Log::error('ZaloPay createOrder error: ' . $e->getMessage());
            return response()->json(['error' => 'Lỗi hệ thống', 'message' => $e->getMessage()], 500);
        }
    }

    public function callback(Request $request)
    {
        try {
            $data = $request->all();
            Log::info('ZaloPay callback received:', $data);

            if ($this->zaloPayService->verifyCallback($data)) {
                $callbackData = json_decode($data['data'], true);
                $app_trans_id = $callbackData['app_trans_id']; // ví dụ: 250804_123456
                $orderId = explode('_', $app_trans_id)[1]; // 123456 là ID order

                // Tìm payment record theo transaction_id
                $payment = Payment::where('transaction_id', $app_trans_id)->first();
                if ($payment) {
                    // Cập nhật payment status
                    $payment->update([
                        'status' => 'completed',
                        'paid_at' => now(),
                    ]);

                    // Cập nhật order status
                    $order = Order::find($payment->order_id);
                    if ($order) {
                        $order->update(['status' => 'paid']);
                    }

                    Log::info("ZaloPay payment completed for order: {$payment->order_id}");
                }

                return response()->json([
                    'return_code' => 1,
                    'return_message' => 'success'
                ]);
            }

            Log::warning('ZaloPay callback signature verification failed');
            return response()->json([
                'return_code' => 0,
                'return_message' => 'invalid signature'
            ]);

        } catch (\Exception $e) {
            Log::error('ZaloPay callback error: ' . $e->getMessage());
            return response()->json([
                'return_code' => 0,
                'return_message' => 'error'
            ]);
        }
    }

    public function checkStatus($order_id)
    {
        try {
            $payment = Payment::where('order_id', $order_id)
                             ->where('method', 'zalopay')
                             ->latest()
                             ->first();

            if (!$payment) {
                return response()->json(['error' => 'Payment not found'], 404);
            }

            return response()->json([
                'success' => true,
                'payment_id' => $payment->id,
                'order_id' => $payment->order_id,
                'status' => $payment->status,
                'amount' => $payment->amount,
                'transaction_id' => $payment->transaction_id,
                'paid_at' => $payment->paid_at,
                'created_at' => $payment->created_at,
            ]);

        } catch (\Exception $e) {
            Log::error('ZaloPay checkStatus error: ' . $e->getMessage());
            return response()->json(['error' => 'Lỗi hệ thống'], 500);
        }
    }
}
