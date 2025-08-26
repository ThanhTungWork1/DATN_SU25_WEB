<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "🔍 Testing Admin Products Logic\n";
echo "==============================\n";

try {
    // Test logic từ Admin ProductController
    echo "📦 Testing Admin ProductController logic:\n";
    
    // Simulate request parameters
    $perPage = 1000; // Lấy tất cả
    $search = ''; // Không search
    
    echo "Parameters: per_page={$perPage}, search='{$search}'\n";
    echo "---\n";
    
    // Logic từ controller
    $query = \DB::table('products');
    
    // Logic xử lý tìm kiếm
    if (!empty($search)) {
        $query->where('name', 'like', '%' . $search . '%');
    }
    
    // Sắp xếp và phân trang
    $products = $query->orderBy('id', 'asc')->paginate($perPage);
    
    echo "Total products found: {$products->total()}\n";
    echo "Current page: {$products->currentPage()}\n";
    echo "Per page: {$products->perPage()}\n";
    echo "Last page: {$products->lastPage()}\n";
    echo "---\n";
    
    echo "Products in current page:\n";
    foreach ($products->items() as $product) {
        echo "ID: {$product->id}, Name: {$product->name}, Status: {$product->status}\n";
    }
    
    echo "\n---\n";
    echo "Response structure:\n";
    $response = [
        'current_page' => $products->currentPage(),
        'data' => $products->items(),
        'first_page_url' => $products->url(1),
        'from' => $products->firstItem(),
        'last_page' => $products->lastPage(),
        'last_page_url' => $products->url($products->lastPage()),
        'next_page_url' => $products->nextPageUrl(),
        'path' => $products->path(),
        'per_page' => $products->perPage(),
        'prev_page_url' => $products->previousPageUrl(),
        'to' => $products->lastItem(),
        'total' => $products->total(),
    ];
    
    echo "Response keys: " . implode(', ', array_keys($response)) . "\n";
    echo "Data count: " . count($response['data']) . "\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
