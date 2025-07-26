<?php

return [
    /*
    |--------------------------------------------------------------------------
    | VNPay Configuration
    |--------------------------------------------------------------------------
    |
    | Cấu hình cho cổng thanh toán VNPay
    |
    */

    // TMN Code từ VNPay (Merchant ID)
    'tmn_code' => env('VNPAY_TMN_CODE', ''),

    // Hash Secret từ VNPay
    'hash_secret' => env('VNPAY_HASH_SECRET', ''),

    // URL thanh toán VNPay
    'url' => env('VNPAY_URL', 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html'),

    // URL callback khi thanh toán thành công
    'return_url' => env('VNPAY_RETURN_URL', 'http://localhost:8000/api/payments/vnpay/callback'),

    // URL IPN (Instant Payment Notification)
    'ipn_url' => env('VNPAY_IPN_URL', 'http://localhost:8000/api/payments/vnpay/ipn'),

    // Môi trường (sandbox hoặc production)
    'environment' => env('VNPAY_ENVIRONMENT', 'sandbox'),
];
