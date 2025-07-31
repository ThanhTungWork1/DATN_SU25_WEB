<?php

require_once 'vendor/autoload.php';

use Illuminate\Support\Facades\DB;

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== KIỂM TRA SAU KHI SỬA ===\n";
echo "============================\n";

// 1. Tổng doanh thu từ orders
$totalRevenue = DB::table('orders')
    ->where('is_paid', 1)
    ->whereIn('status', ['delivered', 'completed'])
    ->sum('total_amount');

echo "1. TỔNG DOANH THU (từ orders):\n";
echo "   - Total: {$totalRevenue} × 1000 = " . ($totalRevenue * 1000) . " VND\n\n";

// 2. Doanh thu từ order_items
$productRevenue = DB::table('order_items')
    ->join('orders', 'order_items.order_id', '=', 'orders.id')
    ->where('orders.is_paid', 1)
    ->whereIn('orders.status', ['delivered', 'completed'])
    ->sum(DB::raw('order_items.quantity * order_items.price'));

echo "2. DOANH THU SẢN PHẨM (từ order_items):\n";
echo "   - Total: {$productRevenue} × 1000 = " . ($productRevenue * 1000) . " VND\n\n";

// 3. Chênh lệch
$difference = $totalRevenue - $productRevenue;
echo "3. CHÊNH LỆCH:\n";
echo "   - Difference: {$difference} × 1000 = " . ($difference * 1000) . " VND\n";
echo "   - Status: " . (abs($difference) <= 0.01 ? "✅ NHẤT QUÁN" : "❌ VẪN CHÊNH LỆCH") . "\n\n";

// 4. Chi tiết từng order
echo "4. CHI TIẾT TỪNG ORDER:\n";
echo "=======================\n";

$orders = DB::table('orders')
    ->where('is_paid', 1)
    ->whereIn('status', ['delivered', 'completed'])
    ->get();

foreach ($orders as $order) {
    $itemsTotal = DB::table('order_items')
        ->where('order_id', $order->id)
        ->sum(DB::raw('quantity * price'));
    
    $calculatedTotal = $itemsTotal + $order->shipping_fee - $order->discount_amount;
    $isConsistent = abs($order->total_amount - $calculatedTotal) <= 0.01;
    
    echo "Order #{$order->id}: {$order->total_amount} = {$calculatedTotal} " . ($isConsistent ? "✅" : "❌") . "\n";
}

echo "\n=== HOÀN THÀNH ===\n"; 