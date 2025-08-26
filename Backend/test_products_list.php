<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "🔍 Testing Products List API\n";
echo "===========================\n";

try {
    // Kiểm tra trực tiếp trong database
    echo "📦 Products in database:\n";
    $products = \DB::table('products')->select('id', 'name', 'status')->get();
    echo "Total products in DB: {$products->count()}\n";
    
    foreach ($products as $product) {
        echo "ID: {$product->id}, Name: {$product->name}, Status: {$product->status}\n";
    }
    
    echo "\n---\n";
    
    // Kiểm tra products theo status
    echo "📊 Products by status:\n";
    $activeProducts = \DB::table('products')->where('status', true)->count();
    $inactiveProducts = \DB::table('products')->where('status', false)->count();
    echo "Active products: {$activeProducts}\n";
    echo "Inactive products: {$inactiveProducts}\n";
    
    echo "\n---\n";
    
    // Test API call (sẽ fail vì cần auth, nhưng để xem structure)
    echo "🌐 Testing API call structure:\n";
    
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

    $url = "http://localhost:8000/api/admin/products?page=1&per_page=1000";
    echo "Requesting: $url\n";
    echo "---\n";

    $response = file_get_contents($url, false, $context);
    
    if ($response === false) {
        echo "❌ Failed to get response (expected - needs auth)\n";
    } else {
        echo "✅ Response received:\n";
        $data = json_decode($response, true);
        echo json_encode($data, JSON_PRETTY_PRINT) . "\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}

