<?php

require_once 'vendor/autoload.php';

use App\Models\Order;

// Khởi tạo Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== SETUP ORDERS SYSTEM ===\n";

try {
    // 1. Kiểm tra bảng orders có tồn tại không
    echo "1. Kiểm tra bảng orders...\n";
    $tableExists = \Schema::hasTable('orders');
    echo "Bảng orders " . ($tableExists ? "đã tồn tại" : "chưa tồn tại") . "\n";
    
    if (!$tableExists) {
        echo "❌ Lỗi: Bảng orders không tồn tại. Vui lòng chạy migration trước.\n";
        exit(1);
    }
    
    // 2. Kiểm tra cột order_code
    echo "2. Kiểm tra cột order_code...\n";
    $hasOrderCode = \Schema::hasColumn('orders', 'order_code');
    echo "Cột order_code " . ($hasOrderCode ? "đã tồn tại" : "chưa tồn tại") . "\n";
    
    if (!$hasOrderCode) {
        echo "❌ Lỗi: Cột order_code chưa tồn tại. Vui lòng chạy migration.\n";
        echo "Chạy lệnh: php artisan migrate\n";
        exit(1);
    }
    
    // 3. Đếm số đơn hàng
    echo "3. Đếm số đơn hàng...\n";
    $totalOrders = Order::count();
    echo "Tổng số đơn hàng: {$totalOrders}\n";
    
    // 4. Đếm đơn hàng chưa có order_code
    $ordersWithoutCode = Order::whereNull('order_code')->orWhere('order_code', '')->count();
    echo "Đơn hàng chưa có order_code: {$ordersWithoutCode}\n";
    
    if ($ordersWithoutCode > 0) {
        echo "4. Cập nhật order_code cho đơn hàng cũ...\n";
        
        $orders = Order::whereNull('order_code')->orWhere('order_code', '')->get();
        $updatedCount = 0;
        
        foreach ($orders as $order) {
            try {
                $orderCode = Order::generateOrderCode();
                $order->update(['order_code' => $orderCode]);
                echo "✓ Đã cập nhật đơn hàng #{$order->id} với order_code: {$orderCode}\n";
                $updatedCount++;
            } catch (Exception $e) {
                echo "❌ Lỗi khi cập nhật đơn hàng #{$order->id}: " . $e->getMessage() . "\n";
            }
        }
        
        echo "Hoàn thành! Đã cập nhật {$updatedCount} đơn hàng.\n";
    } else {
        echo "✓ Tất cả đơn hàng đã có order_code.\n";
    }
    
    // 5. Kiểm tra đơn hàng có items
    echo "5. Kiểm tra đơn hàng có items...\n";
    $ordersWithItems = Order::whereHas('items', function($q) {
        $q->where('quantity', '>', 0);
    })->count();
    echo "Đơn hàng có items với quantity > 0: {$ordersWithItems}\n";
    
    $ordersWithoutItems = Order::whereDoesntHave('items', function($q) {
        $q->where('quantity', '>', 0);
    })->count();
    echo "Đơn hàng không có items hoặc quantity = 0: {$ordersWithoutItems}\n";
    
    echo "\n=== SETUP HOÀN THÀNH ===\n";
    echo "✅ Hệ thống orders đã sẵn sàng!\n";
    
} catch (Exception $e) {
    echo "❌ Lỗi: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
    exit(1);
} 