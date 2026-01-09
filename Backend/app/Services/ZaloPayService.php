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
        try {
            // Kiểm tra cấu hình
            if (empty($this->app_id) || empty($this->key1) || empty($this->key2)) {
                Log::error('ZaloPay configuration missing', [
                    'app_id' => !empty($this->app_id),
                    'key1' => !empty($this->key1),
                    'key2' => !empty($this->key2)
                ]);
                return ['error' => 'Cấu hình ZaloPay không đầy đủ. Vui lòng kiểm tra file .env'];
            }

            // Kiểm tra dữ liệu đầu vào
            if (!$order || !$order->id || !$order->user_id) {
                Log::error('Invalid order data for ZaloPay');
                return ['error' => 'Dữ liệu đơn hàng không hợp lệ'];
            }

            if ($amount <= 0) {
                Log::error('Invalid amount for ZaloPay', ['amount' => $amount]);
                return ['error' => 'Số tiền thanh toán không hợp lệ'];
            }

            $embed_data = json_encode(["redirecturl" => env('FRONTEND_URL', 'http://localhost:3000') . "/payment-success"]);
            $items = json_encode([]);

            $app_trans_id = date("ymd") . "_" . $order->id;
            $app_time = round(microtime(true) * 1000);
            $description = "Thanh toán đơn hàng #" . ($order->order_code ?? $order->id);

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
            Log::info('ZaloPay request data', [
                'app_id' => $data['app_id'],
                'app_trans_id' => $data['app_trans_id'],
                'amount' => $data['amount'],
                'endpoint' => $this->endpoint
            ]);

            $response = Http::timeout(30)->post($this->endpoint, $data);

            if ($response->successful()) {
                $result = $response->json();
                Log::info('ZaloPay response', $result);
                
                // Kiểm tra response có hợp lệ không
                if (isset($result['return_code']) && $result['return_code'] === 1) {
                    if (isset($result['order_url'])) {
                        return $result;
                    } else {
                        Log::error('ZaloPay response missing order_url', $result);
                        return ['error' => 'ZaloPay không trả về URL thanh toán'];
                    }
                } else {
                    $errorMsg = $result['return_message'] ?? 'Không xác định được lỗi';
                    Log::error('ZaloPay API error', $result);
                    return ['error' => 'Lỗi từ ZaloPay: ' . $errorMsg];
                }
            } else {
                Log::error('ZaloPay HTTP error', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                    'endpoint' => $this->endpoint
                ]);
                
                if ($response->status() === 404) {
                    return ['error' => 'Không thể kết nối với ZaloPay. Vui lòng kiểm tra endpoint'];
                } elseif ($response->status() === 500) {
                    return ['error' => 'Lỗi server ZaloPay. Vui lòng thử lại sau'];
                } else {
                    return ['error' => 'Không thể kết nối với ZaloPay (HTTP ' . $response->status() . ')'];
                }
            }
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            Log::error('ZaloPay connection timeout', ['error' => $e->getMessage()]);
            return ['error' => 'Kết nối ZaloPay bị timeout. Vui lòng thử lại'];
        } catch (\Exception $e) {
            Log::error('ZaloPay createOrder exception: ' . $e->getMessage(), [
                'order_id' => $order->id ?? 'unknown',
                'amount' => $amount,
                'trace' => $e->getTraceAsString()
            ]);
            return ['error' => 'Có lỗi xảy ra: ' . $e->getMessage()];
        }
    }

    public function verifyCallback($data)
    {
        try {
            if (!isset($data['data']) || !isset($data['mac'])) {
                Log::warning('ZaloPay callback missing required fields', $data);
                return false;
            }

            if (empty($this->key2)) {
                Log::error('ZaloPay key2 is empty for callback verification');
                return false;
            }

            $mac = hash_hmac("sha256", $data['data'], $this->key2);
            $isValid = hash_equals($mac, $data['mac']);
            
            Log::info('ZaloPay callback verification', [
                'calculated_mac' => $mac,
                'received_mac' => $data['mac'],
                'is_valid' => $isValid
            ]);
            
            return $isValid;
        } catch (\Exception $e) {
            Log::error('ZaloPay verifyCallback exception: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return false;
        }
    }
}