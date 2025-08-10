<?php

return [
    'app_id' => env('ZALOPAY_APP_ID', ''),
    'key1' => env('ZALOPAY_KEY1', ''),
    'key2' => env('ZALOPAY_KEY2', ''),
    'endpoint' => env('ZALOPAY_ENDPOINT', 'https://sandbox.zalopay.com.vn/v001/tpe/createorder'),
    'callback_url' => env('ZALOPAY_CALLBACK_URL', 'https://yourdomain.com/api/zalopay/callback'),
];
