<?php

require_once 'vendor/autoload.php';

use App\Models\Order;

// Khởi tạo Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== TEST ORDERS API ===\n";

try {
    // 1. Kiểm tra bảng orders
    echo "1. Kiểm tra bảng orders...\n";
    $tableExists = \Schema::hasTable('orders');
    echo "Bảng orders: " . ($tableExists ? "✓ Tồn tại" : "❌ Không tồn tại") . "\n";
    
    // 2. Kiểm tra cột order_code
    echo "2. Kiểm tra cột order_code...\n";
    $hasOrderCode = \Schema::hasColumn('orders', 'order_code');
    echo "Cột order_code: " . ($hasOrderCode ? "✓ Tồn tại" : "❌ Không tồn tại") . "\n";
    
    // 3. Kiểm tra đơn hàng
    echo "3. Kiểm tra đơn hàng...\n";
    $totalOrders = Order::count();
    echo "Tổng đơn hàng: {$totalOrders}\n";
    
    if ($totalOrders > 0) {
        $firstOrder = Order::first();
        echo "Đơn hàng đầu tiên:\n";
        echo "- ID: {$firstOrder->id}\n";
        echo "- Order Code: " . ($firstOrder->order_code ?? 'NULL') . "\n";
        echo "- Customer: {$firstOrder->customer_name}\n";
        echo "- Status: {$firstOrder->status}\n";
    }
    
    // 4. Test query đơn giản
    echo "4. Test query đơn giản...\n";
    $orders = Order::select(['id', 'order_code', 'customer_name'])->limit(3)->get();
    echo "3 đơn hàng đầu: " . $orders->count() . " kết quả\n";
    
    foreach ($orders as $order) {
        echo "- #{$order->id}: {$order->order_code} - {$order->customer_name}\n";
    }
    
    echo "\n=== TEST HOÀN THÀNH ===\n";
    
} catch (Exception $e) {
    echo "❌ Lỗi: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
} 