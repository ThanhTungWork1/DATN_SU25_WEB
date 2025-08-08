<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use App\Services\ZaloPayService;

class ZaloPayController extends Controller
{
    protected $zaloPayService;

    public function __construct(ZaloPayService $zaloPayService)
    {
        $this->zaloPayService = $zaloPayService;
    }

    public function createOrder(Request $request)
    {
        $order = Order::with('voucher')->findOrFail($request->order_id); // load cả voucher nếu có

        // Tính giảm giá từ voucher nếu có
        $discount = 0;
        if ($order->voucher) {
            $discount = $order->voucher->calculateDiscount($order->total_amount);
        }

        // Tổng tiền thanh toán cho ZaloPay
        $amount = (int) round($order->total_amount + $order->shipping_fee - $discount);


        // Gửi sang ZaloPay
        $result = $this->zaloPayService->createOrder($order, $amount);

        if (isset($result['order_url'])) {
            return response()->json(['pay_url' => $result['order_url']]);
        }
        return response()->json(['error' => $result], 400);
    }

    public function callback(Request $request)
    {
        $data = $request->all();

        if ($this->zaloPayService->verifyCallback($data)) {
            $callbackData = json_decode($data['data'], true);

            $app_trans_id = $callbackData['app_trans_id']; // ví dụ: 250804_123456
            $orderId = explode('_', $app_trans_id)[1]; // 123456 là ID bạn tạo bên createOrder()

            $order = Order::find($orderId);
            if ($order) {
                $order->status = 'paid'; // Hoặc số tương ứng
                $order->save();
            }

            return response()->json([
                'return_code' => 1,
                'return_message' => 'success'
            ]);
        }

        return response()->json([
            'return_code' => 0,
            'return_message' => 'invalid signature'
        ]);
    }
}
