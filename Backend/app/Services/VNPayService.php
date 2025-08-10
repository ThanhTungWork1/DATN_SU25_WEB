<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class VNPayService
{
    private $tmnCode;
    private $hashSecret;
    private $url;
    private $returnUrl;
    private $ipnUrl;
    private $environment;
    private $frontendUrl;

    public function __construct()
    {
        $this->tmnCode = config('vnpay.tmn_code');
        $this->hashSecret = config('vnpay.hash_secret');
        $this->url = config('vnpay.url');
        $this->returnUrl = config('vnpay.return_url');
        $this->ipnUrl = config('vnpay.ipn_url');
        $this->environment = config('vnpay.environment');
        $this->frontendUrl = config('vnpay.frontend_url');
    }

    /**
     * Kiểm tra cấu hình VNPay
     */
    public function checkConfiguration()
    {
        if (empty($this->tmnCode) || empty($this->hashSecret)) {
            Log::error('VNPay configuration missing', [
                'tmn_code' => !empty($this->tmnCode),
                'hash_secret' => !empty($this->hashSecret),
                'environment' => $this->environment
            ]);
            return false;
        }
        return true;
    }

    /**
     * Tạo URL thanh toán VNPay
     */
    public function createPaymentUrl($transactionId, $amount, $orderInfo = 'Thanh toan don hang')
    {
        try {
            // Kiểm tra cấu hình
            if (!$this->checkConfiguration()) {
                return ['error' => 'Cấu hình VNPay không đầy đủ. Vui lòng kiểm tra file .env'];
            }

            // Kiểm tra dữ liệu đầu vào
            if (empty($transactionId)) {
                Log::error('Invalid VNPay payment data', ['transaction_id' => $transactionId]);
                return ['error' => 'Transaction ID không hợp lệ'];
            }

            $vnpUrl = $this->url;
            $vnpReturnUrl = $this->returnUrl;
            $vnpTmnCode = $this->tmnCode;
            $vnpHashSecret = $this->hashSecret;

            $vnpTxnRef = $transactionId;
            $vnpOrderInfo = $orderInfo;
            $vnpOrderType = 'billpayment';
            $vnpAmount = $amount * 100; // VNPay yêu cầu số tiền * 100
            $vnpLocale = 'vn';
            $vnpCurrCode = 'VND';
            $vnpIpAddr = request()->ip();
            $vnpCreateDate = date('YmdHis');

            $inputData = array(
                "vnp_Version" => "2.1.0",
                "vnp_TmnCode" => $vnpTmnCode,
                "vnp_Amount" => $vnpAmount,
                "vnp_Command" => "pay",
                "vnp_CreateDate" => $vnpCreateDate,
                "vnp_CurrCode" => $vnpCurrCode,
                "vnp_IpAddr" => $vnpIpAddr,
                "vnp_Locale" => $vnpLocale,
                "vnp_OrderInfo" => $vnpOrderInfo,
                "vnp_OrderType" => $vnpOrderType,
                "vnp_ReturnUrl" => $vnpReturnUrl,
                "vnp_TxnRef" => $vnpTxnRef,
            );

            ksort($inputData);
            $query = "";
            $i = 0;
            $hashdata = "";
            foreach ($inputData as $key => $value) {
                if ($i == 1) {
                    $hashdata .= '&' . urlencode($key) . "=" . urlencode($value);
                } else {
                    $hashdata .= urlencode($key) . "=" . urlencode($value);
                    $i = 1;
                }
                $query .= urlencode($key) . "=" . urlencode($value) . '&';
            }

            $vnpUrl = $vnpUrl . "?" . $query;
            if (isset($vnpHashSecret)) {
                $vnpSecureHash = hash_hmac('sha512', $hashdata, $vnpHashSecret);
                $vnpUrl .= 'vnp_SecureHash=' . $vnpSecureHash;
            }

            // Log thông tin thanh toán (không log sensitive data)
            Log::info('VNPay payment URL created', [
                'transaction_id' => $transactionId,
                'amount' => $amount,
                'environment' => $this->environment,
                'ip_address' => $vnpIpAddr
            ]);

            return ['success' => true, 'payment_url' => $vnpUrl];

        } catch (\Exception $e) {
            Log::error('VNPay createPaymentUrl error: ' . $e->getMessage(), [
                'transaction_id' => $transactionId,
                'amount' => $amount,
                'trace' => $e->getTraceAsString()
            ]);
            return ['error' => 'Có lỗi xảy ra khi tạo URL thanh toán: ' . $e->getMessage()];
        }
    }

    /**
     * Xác thực callback từ VNPay
     */
    public function verifyCallback($request)
    {
        try {
            if (!$this->checkConfiguration()) {
                Log::error('VNPay configuration missing for callback verification');
                return false;
            }

            $vnpSecureHash = $request->get('vnp_SecureHash');
            if (empty($vnpSecureHash)) {
                Log::warning('VNPay callback missing SecureHash');
                return false;
            }

            $inputData = array();
            foreach ($request->all() as $key => $value) {
                if (substr($key, 0, 4) == "vnp_") {
                    $inputData[$key] = $value;
                }
            }
            unset($inputData['vnp_SecureHash']);
            ksort($inputData);
            $hashData = "";
            $i = 0;
            foreach ($inputData as $key => $value) {
                if ($i == 1) {
                    $hashData = $hashData . '&' . urlencode($key) . "=" . urlencode($value);
                } else {
                    $hashData = urlencode($key) . "=" . urlencode($value);
                    $i = 1;
                }
            }

            $secureHash = hash_hmac('sha512', $hashData, $this->hashSecret);
            $isValid = hash_equals($secureHash, $vnpSecureHash);

            Log::info('VNPay callback verification', [
                'calculated_hash' => $secureHash,
                'received_hash' => $vnpSecureHash,
                'is_valid' => $isValid,
                'callback_data' => $inputData
            ]);

            return $isValid;

        } catch (\Exception $e) {
            Log::error('VNPay verifyCallback error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return false;
        }
    }

    /**
     * Xử lý kết quả thanh toán
     */
    public function processPaymentResult($request)
    {
        try {
            $vnpResponseCode = $request->get('vnp_ResponseCode');
            $vnpTxnRef = $request->get('vnp_TxnRef');
            $vnpAmount = $request->get('vnp_Amount') / 100; // Chia lại cho 100
            $vnpOrderInfo = $request->get('vnp_OrderInfo');
            $vnpBankCode = $request->get('vnp_BankCode');
            $vnpPayDate = $request->get('vnp_PayDate');
            $vnpTransactionNo = $request->get('vnp_TransactionNo');

            $result = [
                'success' => $vnpResponseCode == '00',
                'order_id' => $vnpTxnRef,
                'amount' => $vnpAmount,
                'order_info' => $vnpOrderInfo,
                'bank_code' => $vnpBankCode,
                'pay_date' => $vnpPayDate,
                'response_code' => $vnpResponseCode,
                'transaction_no' => $vnpTransactionNo,
                'message' => $this->getResponseMessage($vnpResponseCode)
            ];

            Log::info('VNPay payment result processed', $result);

            return $result;

        } catch (\Exception $e) {
            Log::error('VNPay processPaymentResult error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            return [
                'success' => false,
                'error' => 'Có lỗi xảy ra khi xử lý kết quả thanh toán'
            ];
        }
    }

    /**
     * Lấy thông báo tương ứng với response code
     */
    private function getResponseMessage($responseCode)
    {
        $messages = [
            '00' => 'Giao dịch thành công',
            '07' => 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường)',
            '09' => 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking',
            '65' => 'Giao dịch không thành công do: Tài khoản của khách hàng không đủ số dư',
            '75' => 'Ngân hàng thanh toán đang bảo trì',
            '79' => 'Giao dịch không thành công do: NHKH nhập sai mật khẩu thanh toán quá số lần quy định',
            '85' => 'Giao dịch không thành công do: Tài khoản khách hàng không đủ số dư',
            '97' => 'Giao dịch không thành công do: Không đúng thông tin',
            '99' => 'Các lỗi khác (lỗi còn lại, không có trong danh sách mã lỗi đã liệt kê)'
        ];

        return $messages[$responseCode] ?? 'Mã lỗi không xác định';
    }

    /**
     * Kiểm tra trạng thái giao dịch
     */
    public function checkTransactionStatus($transactionNo)
    {
        try {
            if (!$this->checkConfiguration()) {
                return ['error' => 'Cấu hình VNPay không đầy đủ'];
            }

            // VNPay query transaction API
            $vnpUrl = str_replace('vpcpay.html', 'vpcquerydr.html', $this->url);
            
            $inputData = array(
                "vnp_Version" => "2.1.0",
                "vnp_Command" => "querydr",
                "vnp_TmnCode" => $this->tmnCode,
                "vnp_TxnRef" => $transactionNo,
                "vnp_OrderInfo" => "Kiem tra trang thai giao dich",
                "vnp_TransDate" => date('YmdHis'),
                "vnp_IpAddr" => request()->ip(),
            );

            ksort($inputData);
            $query = "";
            $i = 0;
            $hashdata = "";
            foreach ($inputData as $key => $value) {
                if ($i == 1) {
                    $hashdata .= '&' . urlencode($key) . "=" . urlencode($value);
                } else {
                    $hashdata .= urlencode($key) . "=" . urlencode($value);
                    $i = 1;
                }
                $query .= urlencode($key) . "=" . urlencode($value) . '&';
            }

            $vnpUrl = $vnpUrl . "?" . $query;
            $vnpSecureHash = hash_hmac('sha512', $hashdata, $this->hashSecret);
            $vnpUrl .= 'vnp_SecureHash=' . $vnpSecureHash;

            $response = Http::timeout(30)->get($vnpUrl);
            
            if ($response->successful()) {
                $result = $response->json();
                Log::info('VNPay transaction status check', $result);
                return $result;
            } else {
                Log::error('VNPay status check failed', [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);
                return ['error' => 'Không thể kiểm tra trạng thái giao dịch'];
            }

        } catch (\Exception $e) {
            Log::error('VNPay checkTransactionStatus error: ' . $e->getMessage());
            return ['error' => 'Có lỗi xảy ra khi kiểm tra trạng thái giao dịch'];
        }
    }
}
