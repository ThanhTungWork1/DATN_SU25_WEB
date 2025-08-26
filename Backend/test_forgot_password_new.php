<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "🔐 Testing Forgot Password API\n";
echo "=============================\n";

$email = 'duongpvph31963@fpt.edu.vn';

// Tạo request data
$data = [
    'email' => $email
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

$url = 'http://localhost:8000/api/forgot-password';

echo "Sending request to: $url\n";
echo "Email: $email\n";
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
echo "Now checking tokens in database:\n";

try {
    $tokens = \DB::table('password_reset_tokens')->get();
    
    if ($tokens->count() > 0) {
        foreach ($tokens as $token) {
            echo "Email: {$token->email}\n";
            echo "Token: {$token->token}\n";
            echo "Created: {$token->created_at}\n";
            echo "---\n";
        }
    } else {
        echo "No tokens found in database.\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

