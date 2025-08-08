<?php

require_once 'vendor/autoload.php';

use App\Models\Order;

// Khởi tạo Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== CẬP NHẬT MÃ ĐƠN HÀNG THEO NGÀY ĐẶT HÀNG ===\n";

try {
    // Lấy tất cả đơn hàng
    $orders = Order::orderBy('created_at')->get();
    
    echo "Tìm thấy {$orders->count()} đơn hàng cần cập nhật.\n\n";
    
    $updatedCount = 0;
    
    foreach ($orders as $order) {
        try {
            // Tạo mã đơn hàng dựa trên ngày đặt hàng thực tế
            $orderDate = \Carbon\Carbon::parse($order->created_at);
            $newOrderCode = Order::generateOrderCode($orderDate);
            
            // Cập nhật mã đơn hàng
            $order->update(['order_code' => $newOrderCode]);
            
            echo "✓ Đơn hàng #{$order->id}: {$order->customer_name}\n";
            echo "  - Ngày đặt: {$orderDate->format('d/m/Y')}\n";
            echo "  - Mã mới: {$newOrderCode}\n\n";
            
            $updatedCount++;
            
        } catch (Exception $e) {
            echo "❌ Lỗi khi cập nhật đơn hàng #{$order->id}: " . $e->getMessage() . "\n";
        }
    }
    
    echo "=== HOÀN THÀNH ===\n";
    echo "✅ Đã cập nhật {$updatedCount} đơn hàng.\n";
    echo "📝 Mã đơn hàng giờ sẽ khớp với ngày đặt hàng thực tế.\n";
    
} catch (Exception $e) {
    echo "❌ Lỗi: " . $e->getMessage() . "\n";
    exit(1);
} 