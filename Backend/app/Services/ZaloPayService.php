<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class ZaloPayService
{
    public function createOrder($order)
    {
        $config = config('zalopay');
        $app_trans_id = date('ymd') . "_" . $order->id;
        $params = [
            "app_id" => $config['app_id'],
            "app_trans_id" => $app_trans_id,
            "app_user" => "user_" . $order->user_id,
            "app_time" => round(microtime(true) * 1000),
            "amount" => $order->total,
            "item" => json_encode([]),
            "description" => "Thanh toán đơn hàng #" . $order->id,
            "bank_code" => "zalopayapp",
            "callback_url" => $config['callback_url'],
        ];

        $data = $params["app_id"] . "|" . $params["app_trans_id"] . "|" . $params["app_user"] . "|" . $params["amount"] . "|" . $params["app_time"] . "|" . $params["item"];
        $params["mac"] = hash_hmac("sha256", $data, $config['key1']);

        $response = Http::post($config['endpoint'], $params);

        return $response->json();
    }

    public function verifyCallback($data)
    {
        $config = config('zalopay');
        $mac = hash_hmac("sha256", $data['data'], $config['key2']);
        return $mac === $data['mac'];
    }
}
