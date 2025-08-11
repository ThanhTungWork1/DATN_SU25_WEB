<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\VNPayService;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

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
        try {
            // Validate request
            $validator = Validator::make($request->all(), [
                'order_id' => 'required|integer|exists:orders,id',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'error' => 'Dữ liệu không hợp lệ',
                    'details' => $validator->errors()
                ], 422);
            }

            $order = Order::with('voucher')->findOrFail($request->order_id);

            // Kiểm tra đơn hàng có hợp lệ không
            if ($order->status === 'paid') {
                return response()->json([
                    'error' => 'Đơn hàng đã được thanh toán'
                ], 400);
            }

            if ($order->status === 'cancelled') {
                return response()->json([
                    'error' => 'Đơn hàng đã bị hủy'
                ], 400);
            }

            // Tính giảm giá từ voucher nếu có
            $discount = 0;
            if ($order->voucher) {
                try {
                    $discount = $order->voucher->calculateDiscount($order->total_amount);
                } catch (\Exception $e) {
                    Log::warning('Voucher calculation error: ' . $e->getMessage());
                    $discount = 0;
                }
            }

            // Tổng tiền thanh toán từ order
            $amount = (int) round($order->total_amount + $order->shipping_fee - $discount);

            // Tạo mã giao dịch duy nhất
            $transactionId = 'VNPAY_' . time() . '_' . $order->id . '_' . rand(1000, 9999);
            
            // Tạo thông tin thanh toán
            $orderInfo = "Thanh toan don hang #" . ($order->order_code ?? $order->id);

            // Tạo URL thanh toán VNPay với mã giao dịch duy nhất
            $result = $this->vnpayService->createPaymentUrl(
                $transactionId,
                $amount,
                $orderInfo
            );

            if (isset($result['error'])) {
                Log::error('VNPay createPayment error:', $result);
                return response()->json(['error' => $result['error']], 400);
            }

            if (isset($result['payment_url'])) {
                try {
                    // Tạo record payment với status pending
                    Payment::create([
                        'order_id' => $order->id,
                        'method' => 'vnpay',
                        'status' => 'pending',
                        'amount' => $amount,
                        'payment_method' => 'vnpay',
                        'transaction_id' => $transactionId,
                        'gateway_response' => $result
                    ]);

                    // Cập nhật order
                    $order->update([
                        'payment_method' => 'vnpay',
                        'discount_amount' => $discount,
                        'final_amount' => $amount
                    ]);

                    Log::info('VNPay payment created successfully', [
                        'order_id' => $order->id,
                        'transaction_id' => $transactionId,
                        'amount' => $amount,
                        'payment_url' => $result['payment_url']
                    ]);

                    return response()->json([
                        'success' => true,
                        'payment_url' => $result['payment_url'],
                        'order_id' => $order->id,
                        'transaction_id' => $transactionId,
                        'amount' => $amount,
                        'discount' => $discount,
                        'order_total' => $order->total_amount,
                        'shipping_fee' => $order->shipping_fee
                    ], 200);

                } catch (\Exception $e) {
                    Log::error('Payment record creation error: ' . $e->getMessage());
                    return response()->json(['error' => 'Không thể tạo payment record'], 500);
                }
            }

            return response()->json(['error' => 'Không thể tạo URL thanh toán'], 400);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            Log::error('Order not found: ' . $request->order_id);
            return response()->json(['error' => 'Không tìm thấy đơn hàng'], 404);
        } catch (\Exception $e) {
            Log::error('VNPay createPayment error: ' . $e->getMessage(), [
                'order_id' => $request->order_id,
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['error' => 'Có lỗi xảy ra khi tạo thanh toán'], 500);
        }
    }

    /**
     * Xử lý callback từ VNPay
     */
    public function callback(Request $request)
    {
        try {
            Log::info('VNPay callback received', $request->all());

            // Xác thực callback
            if (!$this->vnpayService->verifyCallback($request)) {
                Log::error('VNPay callback verification failed', $request->all());
                return response()->json(['error' => 'Callback verification failed'], 400);
            }

            // Xử lý kết quả thanh toán
            $result = $this->vnpayService->processPaymentResult($request);

            if (isset($result['error'])) {
                Log::error('VNPay processPaymentResult error:', $result);
                return response()->json(['error' => $result['error']], 400);
            }

            if ($result['success']) {
                // Thanh toán thành công
                $order = Order::find($result['order_id']);

                if (!$order) {
                    Log::error('Order not found', ['order_id' => $result['order_id']]);
                    return response()->json(['error' => 'Order not found'], 404);
                }

                // Cập nhật payment
                $payment = Payment::where('order_id', $order->id)
                    ->where('method', 'vnpay')
                    ->where('status', 'pending')
                    ->first();

                if ($payment) {
                    $payment->update([
                        'status' => 'completed',
                        'paid_at' => now(),
                        'transaction_id' => $result['transaction_no'] ?? null,
                        'bank_code' => $result['bank_code'] ?? null,
                        'gateway_response' => $result
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
                    'bank_code' => $result['bank_code'],
                    'transaction_no' => $result['transaction_no']
                ]);

                // Redirect về frontend với thông tin thanh toán
                $frontendUrl = config('vnpay.frontend_url', 'http://localhost:3000');
                $redirectUrl = $frontendUrl . '/payment/success?' . http_build_query([
                    'order_id' => $order->id,
                    'amount' => $result['amount'],
                    'status' => 'success',
                    'transaction_no' => $result['transaction_no'] ?? '',
                    'bank_code' => $result['bank_code'] ?? ''
                ]);
                
                return redirect()->away($redirectUrl);
            } else {
                // Thanh toán thất bại
                Log::warning('VNPay payment failed', [
                    'order_id' => $result['order_id'],
                    'response_code' => $result['response_code'],
                    'message' => $result['message']
                ]);

                // Cập nhật payment status nếu có
                $payment = Payment::where('order_id', $result['order_id'])
                    ->where('method', 'vnpay')
                    ->where('status', 'pending')
                    ->first();

                if ($payment) {
                    $payment->update([
                        'status' => 'failed',
                        'gateway_response' => $result
                    ]);
                }

                // Redirect về frontend với thông tin lỗi
                $frontendUrl = config('vnpay.frontend_url', 'http://localhost:3000');
                $redirectUrl = $frontendUrl . '/payment/failed?' . http_build_query([
                    'order_id' => $result['order_id'],
                    'status' => 'failed',
                    'message' => $result['message'],
                    'response_code' => $result['response_code']
                ]);
                
                return redirect()->away($redirectUrl);
            }
        } catch (\Exception $e) {
            Log::error('VNPay callback error', [
                'error' => $e->getMessage(),
                'request' => $request->all(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'error' => 'Có lỗi xảy ra khi xử lý thanh toán'
            ], 500);
        }
    }

    /**
     * Xử lý IPN (Instant Payment Notification)
     */
    public function ipn(Request $request)
    {
        try {
            Log::info('VNPay IPN received', $request->all());

            // Xác thực IPN
            if (!$this->vnpayService->verifyCallback($request)) {
                Log::error('VNPay IPN verification failed', $request->all());
                return response()->json(['error' => 'IPN verification failed'], 400);
            }

            // Xử lý kết quả thanh toán
            $result = $this->vnpayService->processPaymentResult($request);

            if (isset($result['error'])) {
                Log::error('VNPay IPN processPaymentResult error:', $result);
                return response()->json(['error' => $result['error']], 400);
            }

            if ($result['success']) {
                $order = Order::find($result['order_id']);

                if ($order && !$order->is_paid) {
                    // Cập nhật payment
                    $payment = Payment::where('order_id', $order->id)
                        ->where('method', 'vnpay')
                        ->first();

                    if ($payment) {
                        $payment->update([
                            'status' => 'completed',
                            'paid_at' => now(),
                            'transaction_id' => $result['transaction_no'] ?? null,
                            'bank_code' => $result['bank_code'] ?? null,
                            'gateway_response' => $result
                        ]);
                    }

                    // Cập nhật đơn hàng
                    $order->update([
                        'is_paid' => true,
                        'status' => 'paid'
                    ]);

                    Log::info('VNPay IPN payment successful', [
                        'order_id' => $order->id,
                        'amount' => $result['amount'],
                        'transaction_no' => $result['transaction_no']
                    ]);
                }
            }

            return response()->json(['success' => true, 'message' => 'IPN processed'], 200);
        } catch (\Exception $e) {
            Log::error('VNPay IPN error', [
                'error' => $e->getMessage(),
                'request' => $request->all(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json(['error' => 'IPN error'], 500);
        }
    }

    /**
     * Kiểm tra trạng thái giao dịch
     */
    public function checkStatus(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'transaction_no' => 'required|string'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'error' => 'Transaction number is required'
                ], 422);
            }

            $result = $this->vnpayService->checkTransactionStatus($request->transaction_no);

            if (isset($result['error'])) {
                return response()->json(['error' => $result['error']], 400);
            }

            return response()->json($result);

        } catch (\Exception $e) {
            Log::error('VNPay checkStatus error: ' . $e->getMessage());
            return response()->json(['error' => 'Có lỗi xảy ra khi kiểm tra trạng thái'], 500);
        }
    }
}
