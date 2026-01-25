<?php
require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Size;
use App\Models\Color;

// Lấy sản phẩm ID 25
$product = Product::find(25);
if (!$product) {
    echo "Không tìm thấy sản phẩm ID 25\n";
    exit;
}

echo "Sản phẩm: " . $product->name . "\n";
echo "Variants hiện tại: " . $product->variants->count() . "\n";

// Lấy sizes và colors
$sizes = Size::all();
$colors = Color::all();

echo "Sizes có sẵn:\n";
foreach($sizes as $size) {
    echo "- ID: {$size->id}, Name: {$size->name}\n";
}

echo "Colors có sẵn:\n";
foreach($colors as $color) {
    echo "- ID: {$color->id}, Name: {$color->name}\n";
}

// Thêm variants mới (Size M, L, XL với màu đỏ)
$redColor = $colors->where('name', 'Đỏ')->first() ?? $colors->first();
$sizesToAdd = ['M', 'L', 'XL'];

foreach($sizesToAdd as $sizeName) {
    $size = $sizes->where('name', $sizeName)->first();
    if (!$size) {
        echo "Không tìm thấy size {$sizeName}, tạo mới...\n";
        $size = Size::create(['name' => $sizeName]);
    }
    
    // Kiểm tra variant đã tồn tại chưa
    $existingVariant = ProductVariant::where('product_id', 25)
        ->where('size_id', $size->id)
        ->where('color_id', $redColor->id)
        ->first();
        
    if (!$existingVariant) {
        $variant = ProductVariant::create([
            'product_id' => 25,
            'size_id' => $size->id,
            'color_id' => $redColor->id,
            'price' => $product->price, // Giá giống sản phẩm gốc
            'stock' => 50, // Stock 50
            'sku' => $product->sku . '-' . $size->name . '-' . $redColor->name,
            'image' => $product->image,
            'image_url' => $product->image_url
        ]);
        echo "✅ Đã tạo variant: Size {$size->name} - Color {$redColor->name} - ID: {$variant->id}\n";
    } else {
        echo "⚠️ Variant Size {$size->name} - Color {$redColor->name} đã tồn tại\n";
    }
}

echo "\n=== KẾT QUẢ ===\n";
$product->refresh();
echo "Tổng variants sau khi thêm: " . $product->variants->count() . "\n";
foreach($product->variants as $v) {
    $sizeName = $v->size ? $v->size->name : 'N/A';
    $colorName = $v->color ? $v->color->name : 'N/A';
    echo "- ID: {$v->id} | Size: {$sizeName} | Color: {$colorName} | Stock: {$v->stock}\n";
}
