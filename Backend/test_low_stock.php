<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Services\DashboardService;
use App\Models\ProductVariant;

echo "Testing low stock products...\n";

// Kiểm tra dữ liệu gốc
echo "=== Raw data from database ===\n";
$variants = ProductVariant::with(['product', 'size', 'color'])
    ->where('stock', '<', 10)
    ->get();

foreach ($variants as $variant) {
    echo "Variant ID: " . $variant->id . "\n";
    echo "Product: " . ($variant->product->name ?? 'N/A') . "\n";
    echo "Size: " . ($variant->size->name ?? 'N/A') . "\n";
    echo "Color: " . ($variant->color->name ?? 'N/A') . "\n";
    echo "Stock: " . $variant->stock . "\n";
    echo "Price: " . $variant->price . "\n";
    echo "Price * 1000: " . ($variant->price * 1000) . "\n";
    echo "---\n";
}

echo "\n=== Service data ===\n";
$service = new DashboardService();
$data = $service->getLowStockProducts(5);

echo "Total low stock: " . $data['total_low_stock'] . "\n";
echo "Out of stock: " . $data['out_of_stock'] . "\n";
echo "Products with low stock:\n";

foreach ($data['low_stock_products'] as $product) {
    echo "- Product: " . $product['product_name'] . "\n";
    echo "  Min stock: " . $product['min_stock'] . "\n";
    echo "  Total low stock variants: " . $product['total_low_stock_variants'] . "\n";
    echo "  Variants:\n";
    
    if (isset($product['low_stock_variants']) && is_array($product['low_stock_variants'])) {
        foreach ($product['low_stock_variants'] as $variant) {
            echo "    • " . $variant['size_name'] . " (" . $variant['color_name'] . "): " . $variant['stock'] . " - " . $variant['price'] . " VND\n";
        }
    } else {
        echo "    No variants data!\n";
        echo "    Product data: " . print_r($product, true) . "\n";
    }
    echo "\n";
} 