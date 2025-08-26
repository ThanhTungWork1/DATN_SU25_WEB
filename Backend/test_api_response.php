<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "🔍 Testing API Response Structure\n";
echo "================================\n";

try {
    $productId = 1;
    $period = 'month';
    
    echo "Testing product ID: {$productId}, period: {$period}\n";
    echo "---\n";
    
    // Tạo request context
    $context = stream_context_create([
        'http' => [
            'method' => 'GET',
            'header' => [
                'Content-Type: application/json',
                'Accept: application/json',
                'X-Requested-With: XMLHttpRequest'
            ]
        ]
    ]);

    $url = "http://localhost:8000/api/admin/products/{$productId}/statistics?period={$period}";
    echo "Requesting: $url\n";
    echo "---\n";

    $response = file_get_contents($url, false, $context);
    
    if ($response === false) {
        echo "❌ Failed to get response\n";
    } else {
        echo "✅ Response received:\n";
        $data = json_decode($response, true);
        echo json_encode($data, JSON_PRETTY_PRINT) . "\n";
        
        echo "\n---\n";
        echo "Response structure analysis:\n";
        echo "Has 'data' key: " . (isset($data['data']) ? 'YES' : 'NO') . "\n";
        echo "Has 'success' key: " . (isset($data['success']) ? 'YES' : 'NO') . "\n";
        
        if (isset($data['data'])) {
            echo "Data keys: " . implode(', ', array_keys($data['data'])) . "\n";
        }
        
        if (isset($data['success'])) {
            echo "Success value: " . ($data['success'] ? 'true' : 'false') . "\n";
        }
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}

