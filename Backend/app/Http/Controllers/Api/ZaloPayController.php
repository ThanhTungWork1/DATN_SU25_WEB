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
        $order = Order::findOrFail($request->order_id);
        $result = $this->zaloPayService->createOrder($order);

        if (isset($result['order_url'])) {
            return response()->json(['pay_url' => $result['order_url']]);
        }
        return response()->json(['error' => $result], 400);
    }

    public function callback(Request $request)
    {
        $data = $request->all();
        if ($this->zaloPayService->verifyCallback($data)) {
            // TODO: Cập nhật trạng thái đơn hàng tại đây
            return response()->json(['return_code' => 1, 'return_message' => 'success']);
        }
        return response()->json(['return_code' => 0, 'return_message' => 'invalid signature']);
    }
}
