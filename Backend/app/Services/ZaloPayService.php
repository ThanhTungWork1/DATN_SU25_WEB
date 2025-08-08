<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ZaloPayService
{
    protected $app_id;
    protected $key1;
    protected $key2;
    protected $endpoint;

    public function __construct()
    {
        $this->app_id = env('ZALOPAY_APP_ID');
        $this->key1 = env('ZALOPAY_KEY1');
        $this->key2 = env('ZALOPAY_KEY2');
        $this->endpoint = env('ZALOPAY_SANDBOX_URL', 'https://sb-openapi.zalopay.vn/v2/create');
    }

    public function createOrder($order, $amount)
    {
        $embed_data = json_encode(["redirecturl" => "http://localhost:3000/payment-success"]);
        $items = json_encode([]); // Nếu có sản phẩm, truyền vào đây

        $app_trans_id = date("ymd") . "_" . $order->id;
        $app_time = round(microtime(true) * 1000);
        $description = "Thanh toán đơn hàng #" . $order->id;

        if ($amount <= 0) {
            return ['error' => 'Số tiền không hợp lệ'];
        }

        $data = [
            "app_id" => (int) $this->app_id,
            "app_trans_id" => $app_trans_id,
            "app_user" => "user_" . $order->user_id,
            "app_time" => (int) $app_time,
            "amount" => (int) $amount,
            "item" => $items,
            "embed_data" => $embed_data,
            "description" => $description,
            "bank_code" => "zalopayapp",
            "callback_url" => url('/api/payments/zalopay/callback'),
        ];

        $data_string = "{$data['app_id']}|{$data['app_trans_id']}|{$data['app_user']}|{$data['amount']}|{$data['app_time']}|{$data['embed_data']}|{$data['item']}";
        $data['mac'] = hash_hmac('sha256', $data_string, $this->key1);

        // Log dữ liệu gửi đi để debug
        Log::info('ZaloPay request data', $data);

        $response = Http::post($this->endpoint, $data);

        // Log response để debug
        Log::info('ZaloPay response', $response->json());

        return $response->json();
    }

    public function verifyCallback($data)
    {
        $mac = hash_hmac("sha256", $data['data'], $this->key2);
        return $mac === $data['mac'];
    }
}