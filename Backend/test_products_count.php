<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "🔍 Testing Products Count\n";
echo "========================\n";

try {
    // Test 1: Đếm trực tiếp trong database
    echo "📦 Direct database count:\n";
    $totalProducts = \DB::table('products')->count();
    echo "Total products in DB: {$totalProducts}\n";
    
    // Test 2: Lấy tất cả products
    echo "\n📦 All products from DB:\n";
    $allProducts = \DB::table('products')->select('id', 'name', 'status')->get();
    echo "Products count: {$allProducts->count()}\n";
    
    foreach ($allProducts as $product) {
        echo "ID: {$product->id}, Name: {$product->name}, Status: {$product->status}\n";
    }
    
    // Test 3: Test pagination với per_page = 1000
    echo "\n📦 Testing pagination with per_page = 1000:\n";
    $query = \DB::table('products');
    $products = $query->orderBy('id', 'asc')->paginate(1000);
    
    echo "Pagination total: {$products->total()}\n";
    echo "Current page items: " . count($products->items()) . "\n";
    echo "Current page: {$products->currentPage()}\n";
    echo "Last page: {$products->lastPage()}\n";
    
    // Test 4: Test với per_page = 20 (default)
    echo "\n📦 Testing pagination with per_page = 20:\n";
    $query2 = \DB::table('products');
    $products2 = $query2->orderBy('id', 'asc')->paginate(20);
    
    echo "Pagination total: {$products2->total()}\n";
    echo "Current page items: " . count($products2->items()) . "\n";
    echo "Current page: {$products2->currentPage()}\n";
    echo "Last page: {$products2->lastPage()}\n";
    
    // Test 5: Kiểm tra response structure
    echo "\n📦 Response structure test:\n";
    $response = [
        'success' => true,
        'data' => $products
    ];
    
    echo "Response keys: " . implode(', ', array_keys($response)) . "\n";
    echo "Data keys: " . implode(', ', array_keys($response['data']->toArray())) . "\n";
    echo "Data count: " . count($response['data']->items()) . "\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}

