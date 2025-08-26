<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "🔍 Testing Dashboard API\n";
echo "======================\n";

// Test với date range hôm nay
$today = date('Y-m-d');
$params = [
    'start_date' => $today,
    'end_date' => $today
];

echo "Testing with date range: {$today} to {$today}\n";
echo "---\n";

try {
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

    $url = 'http://localhost:8000/api/dashboard?' . http_build_query($params);
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
        echo "Key values:\n";
        echo "orders_in_period: " . ($data['orders_in_period'] ?? 'N/A') . "\n";
        echo "delivered_orders: " . ($data['delivered_orders'] ?? 'N/A') . "\n";
        echo "completed_orders: " . ($data['completed_orders'] ?? 'N/A') . "\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}

