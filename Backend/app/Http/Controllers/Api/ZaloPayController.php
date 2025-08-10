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

    public function createOrder(Request $request)
    {
        try {
            // Validate request
            $validator = Validator::make($request->all(), [
                'order_id' => 'required|integer|exists:orders,id'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'error' => 'Dữ liệu không hợp lệ',
                    'details' => $validator->errors()
                ], 422);
            }

            $order = Order::with('voucher')->findOrFail($request->order_id);

            // Kiểm tra order có hợp lệ không
            if ($order->status === 'paid') {
                return response()->json(['error' => 'Đơn hàng đã được thanh toán'], 400);
            }

            if ($order->status === 'cancelled') {
                return response()->json(['error' => 'Đơn hàng đã bị hủy'], 400);
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

            // Tổng tiền thanh toán cho ZaloPay
            $amount = (int) round($order->total_amount + $order->shipping_fee - $discount);

            // Kiểm tra số tiền
            if ($amount <= 0) {
                return response()->json(['error' => 'Số tiền thanh toán không hợp lệ'], 400);
            }

            // Gửi sang ZaloPay
            $result = $this->zaloPayService->createOrder($order, $amount);

            // Kiểm tra kết quả từ ZaloPay
            if (isset($result['error'])) {
                Log::error('ZaloPay error:', $result);
                return response()->json(['error' => $result['error']], 400);
            }

            if (isset($result['order_url'])) {
                try {
                    // Tạo payment record
                    Payment::create([
                        'order_id' => $order->id,
                        'method' => 'zalopay',
                        'status' => 'pending',
                        'amount' => $amount,
                        'payment_method' => 'zalopay',
                        'gateway_response' => $result
                    ]);

                    // Cập nhật order
                    $order->update([
                        'payment_method' => 'zalopay',
                        'discount_amount' => $discount,
                        'final_amount' => $amount
                    ]);

                    Log::info("ZaloPay order created successfully", [
                        'order_id' => $order->id,
                        'amount' => $amount,
                        'pay_url' => $result['order_url']
                    ]);

                    return response()->json([
                        'success' => true,
                        'pay_url' => $result['order_url'],
                        'order_id' => $order->id,
                        'amount' => $amount
                    ]);
                } catch (\Exception $e) {
                    Log::error('Payment record creation error: ' . $e->getMessage());
                    return response()->json(['error' => 'Không thể tạo payment record'], 500);
                }
            }
            
            // Nếu không có order_url
            Log::error('ZaloPay response missing order_url:', $result);
            return response()->json(['error' => 'Không thể tạo URL thanh toán'], 400);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            Log::error('Order not found: ' . $request->order_id);
            return response()->json(['error' => 'Không tìm thấy đơn hàng'], 404);
        } catch (\Exception $e) {
            Log::error('ZaloPay createOrder error: ' . $e->getMessage(), [
                'order_id' => $request->order_id,
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['error' => 'Có lỗi xảy ra khi tạo đơn hàng'], 500);
        }
    }

    public function callback(Request $request)
    {
        try {
            $data = $request->all();
            Log::info('ZaloPay callback data:', $data);

            if ($this->zaloPayService->verifyCallback($data)) {
                $callbackData = json_decode($data['data'], true);
                Log::info('ZaloPay callback decoded:', $callbackData);

                if (!$callbackData || !isset($callbackData['app_trans_id'])) {
                    Log::error('Invalid callback data structure');
                    return response()->json([
                        'return_code' => 0,
                        'return_message' => 'invalid callback data'
                    ], 400);
                }

                $app_trans_id = $callbackData['app_trans_id'];
                $orderId = explode('_', $app_trans_id)[1];

                if (!$orderId || !is_numeric($orderId)) {
                    Log::error('Invalid order ID from callback:', ['app_trans_id' => $app_trans_id]);
                    return response()->json([
                        'return_code' => 0,
                        'return_message' => 'invalid order id'
                    ], 400);
                }

                $order = Order::find($orderId);
                if ($order) {
                    // Cập nhật order
                    $order->update([
                        'status' => 'paid',
                        'is_paid' => true
                    ]);

                    // Cập nhật payment
                    $payment = Payment::where('order_id', $orderId)
                        ->where('method', 'zalopay')
                        ->first();
                    
                    if ($payment) {
                        $payment->update([
                            'status' => 'completed',
                            'paid_at' => now(),
                            'transaction_id' => $callbackData['trans_id'] ?? null,
                            'bank_code' => $callbackData['bank_code'] ?? null,
                            'gateway_response' => $callbackData
                        ]);
                    }

                    Log::info("Order {$orderId} payment completed successfully");
                }

                return response()->json([
                    'return_code' => 1,
                    'return_message' => 'success'
                ]);
            }

            Log::warning('ZaloPay callback verification failed');
            return response()->json([
                'return_code' => 0,
                'return_message' => 'invalid signature'
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
}
