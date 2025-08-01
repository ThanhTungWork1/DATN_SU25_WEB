<?php

require_once 'vendor/autoload.php';

use App\Models\Order;

// Khởi tạo Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "Bắt đầu cập nhật order_code cho các đơn hàng cũ...\n";

// Lấy tất cả đơn hàng chưa có order_code
$orders = Order::whereNull('order_code')->orWhere('order_code', '')->get();

echo "Tìm thấy {$orders->count()} đơn hàng cần cập nhật.\n";

$updatedCount = 0;

foreach ($orders as $order) {
    try {
        // Tạo order_code mới
        $orderCode = Order::generateOrderCode();
        
        // Cập nhật order
        $order->update(['order_code' => $orderCode]);
        
        echo "Đã cập nhật đơn hàng #{$order->id} với order_code: {$orderCode}\n";
        $updatedCount++;
        
    } catch (Exception $e) {
        echo "Lỗi khi cập nhật đơn hàng #{$order->id}: " . $e->getMessage() . "\n";
    }
}

echo "Hoàn thành! Đã cập nhật {$updatedCount} đơn hàng.\n"; 