<?php

require_once 'vendor/autoload.php';

use App\Models\OrderItem;

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "🔧 Cập nhật ảnh cho đơn hàng cũ khi sản phẩm thay ảnh...\n";

// Lấy tất cả order items có variant và product
$orderItems = OrderItem::with(['variant.product'])
    ->whereHas('variant')
    ->get();

echo "📋 Tìm thấy " . $orderItems->count() . " order items cần kiểm tra\n";

$updatedCount = 0;

foreach ($orderItems as $item) {
    if (!$item->variant || !$item->variant->product) {
        continue;
    }
    
    // Lấy ảnh mới nhất từ sản phẩm
    $newImageUrl = $item->variant->image_url ?? 
                   $item->variant->product->image_url ?? 
                   ($item->variant->product->image ? asset('storage/' . $item->variant->product->image) : null);
    
    // Nếu có ảnh mới và khác với ảnh cũ
    if ($newImageUrl && $newImageUrl !== $item->image_url) {
        echo "🔍 OrderItem ID: " . $item->id . " (Order ID: " . $item->order_id . ")\n";
        echo "   - Sản phẩm: " . $item->product_name . "\n";
        echo "   - Ảnh cũ: " . ($item->image_url ?: 'NULL') . "\n";
        echo "   - Ảnh mới: " . $newImageUrl . "\n";
        
        // Cập nhật ảnh mới
        $item->image_url = $newImageUrl;
        $item->save();
        $updatedCount++;
        
        echo "   ✅ Đã cập nhật ảnh mới\n\n";
    }
}

echo "🎉 Hoàn thành! Đã cập nhật " . $updatedCount . " order items\n";
echo "📊 Tổng số items đã kiểm tra: " . $orderItems->count() . "\n";
