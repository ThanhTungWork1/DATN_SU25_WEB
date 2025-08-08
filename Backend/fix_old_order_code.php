<?php

require 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Order;

echo "=== SỬA ORDER_CODE CHO ĐƠN HÀNG CŨ ===\n\n";

// Tìm đơn hàng có order_code không đúng format
$invalidOrders = Order::where('order_code', 'not like', 'ORD-%')
    ->orWhere('order_code', 'like', '%[^0-9]%')
    ->get();

echo "Đơn hàng có order_code không đúng format: {$invalidOrders->count()}\n\n";

foreach ($invalidOrders as $order) {
    echo "Đơn hàng ID: {$order->id}\n";
    echo "Order Code cũ: {$order->order_code}\n";
    echo "Ngày tạo: {$order->created_at}\n";
    
    // Tạo order_code mới dựa trên ngày tạo thực tế
    $orderDate = \Carbon\Carbon::parse($order->created_at);
    $newOrderCode = Order::generateOrderCode($orderDate);
    
    echo "Order Code mới: {$newOrderCode}\n";
    
    // Cập nhật order_code
    $order->order_code = $newOrderCode;
    $order->save();
    
    echo "✅ Đã cập nhật thành công!\n";
    echo "---\n";
}

echo "\n=== KIỂM TRA SAU KHI SỬA ===\n";

// Kiểm tra lại
$totalOrders = Order::count();
$ordersWithCode = Order::whereNotNull('order_code')->count();
$duplicateCodes = Order::select('order_code')
    ->whereNotNull('order_code')
    ->groupBy('order_code')
    ->havingRaw('COUNT(*) > 1')
    ->get();

echo "Tổng số đơn hàng: {$totalOrders}\n";
echo "Đơn hàng có order_code: {$ordersWithCode}\n";
echo "Trùng lặp order_code: {$duplicateCodes->count()}\n";

if ($duplicateCodes->count() === 0) {
    echo "✅ Tất cả order_code đã đúng format và không trùng lặp!\n";
} else {
    echo "⚠️  Vẫn còn trùng lặp order_code\n";
} 