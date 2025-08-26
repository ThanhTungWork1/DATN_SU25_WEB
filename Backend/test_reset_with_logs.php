<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "🔐 Testing Reset Password with NEW token and LOGS\n";
echo "===============================================\n";

$email = 'duongpvph31963@fpt.edu.vn';
$token = 'hBSlojMgTEn7D5mpwru60MUaaHBLhjx0wmsiwuTWdSqmR2JuNfrYrNgxaxv7';
$newPassword = '12345ok';

// Tạo request data
$data = [
    'email' => $email,
    'token' => $token,
    'password' => $newPassword,
    'password_confirmation' => $newPassword
];

// Tạo HTTP request
$context = stream_context_create([
    'http' => [
        'method' => 'POST',
        'header' => [
            'Content-Type: application/json',
            'Accept: application/json',
            'X-Requested-With: XMLHttpRequest'
        ],
        'content' => json_encode($data)
    ]
]);

$url = 'http://localhost:8000/api/reset-password';

echo "Sending request to: $url\n";
echo "Email: $email\n";
echo "Token: $token\n";
echo "New Password: $newPassword\n";
echo "---\n";

try {
    $response = file_get_contents($url, false, $context);
    
    if ($response === false) {
        echo "❌ Failed to get response\n";
    } else {
        echo "✅ Response received:\n";
        echo $response . "\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}

echo "\n---\n";
echo "Now checking Laravel logs for detailed information:\n";
echo "Check: storage/logs/laravel.log\n";

