<?php

require 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Order;

echo "=== KIỂM TRA TÌNH TRẠNG ORDER_CODE ===\n\n";

// Đếm tổng số đơn hàng
$totalOrders = Order::count();
echo "Tổng số đơn hàng: {$totalOrders}\n";

// Đếm đơn hàng chưa có order_code
$ordersWithoutCode = Order::whereNull('order_code')->count();
echo "Đơn hàng chưa có order_code: {$ordersWithoutCode}\n";

// Đếm đơn hàng có order_code
$ordersWithCode = Order::whereNotNull('order_code')->count();
echo "Đơn hàng có order_code: {$ordersWithCode}\n";

// Kiểm tra trùng lặp order_code
$duplicateCodes = Order::select('order_code')
    ->whereNotNull('order_code')
    ->groupBy('order_code')
    ->havingRaw('COUNT(*) > 1')
    ->get();

echo "\n=== KIỂM TRA TRÙNG LẶP ===\n";
if ($duplicateCodes->count() > 0) {
    echo "CÓ TRÙNG LẶP ORDER_CODE:\n";
    foreach ($duplicateCodes as $duplicate) {
        $orders = Order::where('order_code', $duplicate->order_code)->get();
        echo "- Mã: {$duplicate->order_code} (xuất hiện {$orders->count()} lần)\n";
        foreach ($orders as $order) {
            echo "  + ID: {$order->id}, Ngày tạo: {$order->created_at}\n";
        }
    }
} else {
    echo "✅ KHÔNG CÓ TRÙNG LẶP ORDER_CODE\n";
}

// Hiển thị một số đơn hàng mẫu
echo "\n=== MẪU ĐƠN HÀNG ===\n";
$sampleOrders = Order::orderBy('created_at', 'desc')->limit(5)->get();
foreach ($sampleOrders as $order) {
    echo "ID: {$order->id}, Order Code: " . ($order->order_code ?? 'NULL') . ", Ngày: {$order->created_at}\n";
}

echo "\n=== KẾT LUẬN ===\n";
if ($ordersWithoutCode > 0) {
    echo "⚠️  Cần chạy script tạo order_code cho {$ordersWithoutCode} đơn hàng\n";
} else {
    echo "✅ Tất cả đơn hàng đã có order_code\n";
}

if ($duplicateCodes->count() > 0) {
    echo "⚠️  Cần xử lý trùng lặp order_code\n";
} else {
    echo "✅ Không có trùng lặp order_code\n";
} 