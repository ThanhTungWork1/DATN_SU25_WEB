<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

echo "Checking database structure...\n";

// Kiểm tra cấu trúc bảng product_variants
$columns = DB::select("DESCRIBE product_variants");
echo "product_variants columns:\n";
foreach ($columns as $column) {
    echo "- " . $column->Field . " (" . $column->Type . ")\n";
}

echo "\nChecking product_variants data...\n";
$variants = DB::table('product_variants')
    ->select('id', 'product_id', 'stock')
    ->get();

echo "Total variants: " . $variants->count() . "\n";

echo "\nSample variants:\n";
foreach ($variants->take(5) as $variant) {
    echo "ID: " . $variant->id . ", Product ID: " . $variant->product_id . ", Stock: " . $variant->stock . "\n";
}

// Kiểm tra bảng products
echo "\nChecking products table...\n";
$products = DB::table('products')
    ->select('id', 'name', 'price')
    ->get();

echo "Products with price:\n";
foreach ($products as $product) {
    echo "Product ID: " . $product->id . ", Name: " . $product->name . ", Price: " . ($product->price ?? 'NULL') . "\n";
}

// Kiểm tra join để lấy giá
echo "\nTesting join to get prices...\n";
$variantsWithPrices = DB::table('product_variants')
    ->join('products', 'product_variants.product_id', '=', 'products.id')
    ->select('product_variants.id', 'product_variants.product_id', 'product_variants.stock', 'products.name', 'products.price')
    ->where('product_variants.stock', '<', 10)
    ->get();

echo "Low stock variants with prices:\n";
foreach ($variantsWithPrices as $variant) {
    echo "Variant ID: " . $variant->id . ", Product: " . $variant->name . ", Stock: " . $variant->stock . ", Price: " . ($variant->price ?? 'NULL') . "\n";
} 