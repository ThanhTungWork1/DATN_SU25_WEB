<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "🔍 Testing Pagination Issue\n";
echo "==========================\n";

try {
    // Test với các giá trị per_page khác nhau
    $testCases = [10, 20, 50, 100, 1000];
    
    foreach ($testCases as $perPage) {
        echo "📦 Testing per_page = {$perPage}:\n";
        
        $query = \DB::table('products');
        $products = $query->orderBy('id', 'asc')->paginate($perPage);
        
        echo "  - Total in DB: {$products->total()}\n";
        echo "  - Items in current page: " . count($products->items()) . "\n";
        echo "  - Current page: {$products->currentPage()}\n";
        echo "  - Last page: {$products->lastPage()}\n";
        
        if ($products->lastPage() > 1) {
            echo "  - ⚠️ Có nhiều trang! Cần pagination\n";
        } else {
            echo "  - ✅ Chỉ 1 trang, OK\n";
        }
        
        echo "  - Products: ";
        $productNames = array_map(function($p) { return $p->name; }, $products->items());
        echo implode(', ', array_slice($productNames, 0, 5)) . (count($productNames) > 5 ? '...' : '');
        echo "\n";
        echo "---\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}

