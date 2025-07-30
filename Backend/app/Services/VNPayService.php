<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class VNPayService
{
    private $tmnCode;
    private $hashSecret;
    private $url;
    private $returnUrl;
    private $ipnUrl;

    public function __construct()
    {
        $this->tmnCode = config('vnpay.tmn_code');
        $this->hashSecret = config('vnpay.hash_secret');
        $this->url = config('vnpay.url');
        $this->returnUrl = config('vnpay.return_url');
        $this->ipnUrl = config('vnpay.ipn_url');
    }

    /**
     * Tạo URL thanh toán VNPay
     */
    public function createPaymentUrl($orderId, $amount, $orderInfo = 'Thanh toan don hang')
    {
        $vnpUrl = $this->url;
        $vnpReturnUrl = $this->returnUrl;
        $vnpTmnCode = $this->tmnCode;
        $vnpHashSecret = $this->hashSecret;

        $vnpTxnRef = $orderId;
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

        return $vnpUrl;
    }

    /**
     * Xác thực callback từ VNPay
     */
    public function verifyCallback($request)
    {
        $vnpSecureHash = $request->get('vnp_SecureHash');
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

        return $vnpSecureHash == $secureHash;
    }

    /**
     * Xử lý kết quả thanh toán
     */
    public function processPaymentResult($request)
    {
        $vnpResponseCode = $request->get('vnp_ResponseCode');
        $vnpTxnRef = $request->get('vnp_TxnRef');
        $vnpAmount = $request->get('vnp_Amount') / 100; // Chia lại cho 100
        $vnpOrderInfo = $request->get('vnp_OrderInfo');
        $vnpBankCode = $request->get('vnp_BankCode');
        $vnpPayDate = $request->get('vnp_PayDate');

        return [
            'success' => $vnpResponseCode == '00',
            'order_id' => $vnpTxnRef,
            'amount' => $vnpAmount,
            'order_info' => $vnpOrderInfo,
            'bank_code' => $vnpBankCode,
            'pay_date' => $vnpPayDate,
            'response_code' => $vnpResponseCode,
        ];
    }
}
