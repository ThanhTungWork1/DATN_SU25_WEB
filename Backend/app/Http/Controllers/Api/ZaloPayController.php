<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\Payment;
use App\Services\ZaloPayService;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class ZaloPayController extends Controller
{
    protected $zaloPayService;

    public function __construct(ZaloPayService $zaloPayService)
    {
        $this->zaloPayService = $zaloPayService;
    }

    /**
     * Create a ZaloPay order and return the payment URL / token info.
     */
    public function createOrder(Request $request)
    {
        // Validate request first
        $validator = Validator::make($request->all(), [
            'order_id' => 'required|integer|exists:orders,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Dữ liệu không hợp lệ',
                'details' => $validator->errors()
            ], 422);
        }

        try {
            $order = Order::with('voucher')->findOrFail($request->order_id);

            // Không cho tạo thanh toán nếu order đã paid hoặc canceled
            if ($order->status === 'paid') {
                return response()->json(['error' => 'Đơn hàng đã được thanh toán'], 400);
            }
            if ($order->status === 'cancelled') {
                return response()->json(['error' => 'Đơn hàng đã bị hủy'], 400);
            }

            // Tính giảm giá từ voucher nếu có (bảo vệ try/catch riêng nếu voucher logic ném lỗi)
            $discount = 0;
            if ($order->voucher) {
                try {
                    $discount = $order->voucher->calculateDiscount($order->total_amount);
                } catch (\Exception $e) {
                    Log::warning('Voucher calculation error: ' . $e->getMessage(), [
                        'order_id' => $order->id
                    ]);
                    $discount = 0;
                }
            }

            // Tổng tiền thanh toán cho ZaloPay
            $amount = (int) round($order->total_amount + ($order->shipping_fee ?? 0) - $discount);

            if ($amount <= 0) {
                return response()->json(['error' => 'Số tiền thanh toán không hợp lệ'], 400);
            }

            // Tạo payment record trong database trước (trạng thái pending)
            $payment = Payment::create([
                'order_id' => $order->id,
                'method' => 'zalopay',
                'amount' => $amount,
                'status' => 'pending',
                'payment_method' => 'zalopay',
                'gateway_response' => null
            ]);

            // Gọi service ZaloPay để tạo order (service trả về mảng kết quả)
            $result = $this->zaloPayService->createOrder($order, $amount);

            if (isset($result['order_url'])) {
                // Cập nhật transaction_id hoặc token nếu có
                $updateData = [];
                if (isset($result['app_trans_id'])) {
                    $updateData['transaction_id'] = $result['app_trans_id'];
                }
                if (isset($result['zp_trans_token'])) {
                    $updateData['gateway_response'] = array_merge($result, $payment->gateway_response ?? []);
                }
                if (!empty($updateData)) {
                    $payment->update($updateData);
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

            // Nếu tạo ZaloPay order thất bại, xóa payment record và trả lỗi
            $payment->delete();
            Log::error('ZaloPay createOrder failed', ['result' => $result, 'order_id' => $order->id]);
            return response()->json(['error' => 'Không thể tạo đơn thanh toán ZaloPay', 'details' => $result], 400);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            Log::error('Order not found: ' . $request->order_id);
            return response()->json(['error' => 'Không tìm thấy đơn hàng'], 404);
        } catch (\Exception $e) {
            Log::error('ZaloPay createOrder error: ' . $e->getMessage(), [
                'order_id' => $request->order_id ?? null,
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['error' => 'Lỗi hệ thống', 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Callback endpoint that ZaloPay calls to notify payment result.
     */
    public function callback(Request $request)
    {
        try {
            $data = $request->all();
            Log::info('ZaloPay callback received:', $data);

            if (! $this->zaloPayService->verifyCallback($data)) {
                Log::warning('ZaloPay callback signature verification failed', $data);
                return response()->json([
                    'return_code' => 0,
                    'return_message' => 'invalid signature'
                ], 400);
            }

            $callbackData = json_decode($data['data'] ?? null, true);
            Log::info('ZaloPay callback decoded:', ['callback' => $callbackData]);

            if (!$callbackData || !isset($callbackData['app_trans_id'])) {
                Log::error('Invalid callback data structure', $callbackData);
                return response()->json([
                    'return_code' => 0,
                    'return_message' => 'invalid callback data'
                ], 400);
            }

            $app_trans_id = $callbackData['app_trans_id'];
            // Giả sử app_trans_id định dạng: {prefix}_{orderId}
            $parts = explode('_', $app_trans_id);
            $orderId = isset($parts[1]) ? $parts[1] : null;

            if (!$orderId || !is_numeric($orderId)) {
                Log::error('Invalid order ID from callback', ['app_trans_id' => $app_trans_id]);
                return response()->json([
                    'return_code' => 0,
                    'return_message' => 'invalid order id'
                ], 400);
            }

            // Cập nhật order nếu tồn tại
            $order = Order::find($orderId);
            if ($order) {
                $order->update([
                    'status' => 'paid',
                    'is_paid' => true
                ]);
            }

            // Cập nhật payment (theo order_id + method zalopay hoặc transaction_id nếu có)
            $payment = null;
            if (isset($callbackData['trans_id'])) {
                $payment = Payment::where('transaction_id', $callbackData['trans_id'])->first();
            }

            if (!$payment) {
                $payment = Payment::where('order_id', $orderId)
                    ->where('method', 'zalopay')
                    ->latest()
                    ->first();
            }

            if ($payment) {
                $payment->update([
                    'status' => 'completed',
                    'paid_at' => now(),
                    'transaction_id' => $callbackData['trans_id'] ?? ($payment->transaction_id ?? null),
                    'bank_code' => $callbackData['bank_code'] ?? ($payment->bank_code ?? null),
                    'gateway_response' => $callbackData
                ]);
                Log::info("ZaloPay payment updated for order {$orderId}", ['payment_id' => $payment->id]);
            } else {
                Log::warning('Payment record not found for callback', ['order_id' => $orderId, 'app_trans_id' => $app_trans_id]);
            }

            return response()->json([
                'return_code' => 1,
                'return_message' => 'success'
            ]);
        } catch (\Exception $e) {
            Log::error('ZaloPay callback error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'return_code' => 0,
                'return_message' => 'internal error'
            ], 500);
        }
    }

    /**
     * Check latest payment status for an order (used by frontend to poll status).
     */
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
            Log::error('ZaloPay checkStatus error: ' . $e->getMessage(), [
                'order_id' => $order_id,
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['error' => 'Lỗi hệ thống'], 500);
        }
    }
}
