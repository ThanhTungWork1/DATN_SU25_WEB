<?php

require_once 'vendor/autoload.php';

use Illuminate\Support\Facades\DB;

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== KHẮC PHỤC CHÊNH LỆCH GIÁ ===\n";
echo "=================================\n";

// 1. Hiển thị trạng thái trước khi sửa
echo "TRẠNG THÁI TRƯỚC KHI SỬA:\n";
echo "==========================\n";

$orders = DB::table('orders')
    ->leftJoin('order_items', 'orders.id', '=', 'order_items.order_id')
    ->select(
        'orders.id',
        'orders.total_amount',
        'orders.shipping_fee',
        'orders.discount_amount',
        DB::raw('COALESCE(SUM(order_items.quantity * order_items.price), 0) as items_total')
    )
    ->groupBy('orders.id', 'orders.total_amount', 'orders.shipping_fee', 'orders.discount_amount')
    ->get();

foreach ($orders as $order) {
    $calculatedTotal = $order->items_total + $order->shipping_fee - $order->discount_amount;
    $difference = $order->total_amount - $calculatedTotal;
    
    echo "Order #{$order->id}:\n";
    echo "  - Total Amount (cũ): {$order->total_amount}\n";
    echo "  - Items Total: {$order->items_total}\n";
    echo "  - Shipping Fee: {$order->shipping_fee}\n";
    echo "  - Discount: {$order->discount_amount}\n";
    echo "  - Calculated Total (mới): {$calculatedTotal}\n";
    echo "  - Chênh lệch: {$difference}\n\n";
}

// 3. Cập nhật orders.total_amount
echo "\nĐANG CẬP NHẬT...\n";
echo "================\n";

$updatedCount = 0;

foreach ($orders as $order) {
    $calculatedTotal = $order->items_total + $order->shipping_fee - $order->discount_amount;
    
    // Chỉ cập nhật nếu có chênh lệch
    if (abs($order->total_amount - $calculatedTotal) > 0.01) {
        DB::table('orders')
            ->where('id', $order->id)
            ->update(['total_amount' => $calculatedTotal]);
        
        echo "✅ Cập nhật Order #{$order->id}: {$order->total_amount} → {$calculatedTotal}\n";
        $updatedCount++;
    }
}

echo "\nĐã cập nhật {$updatedCount} orders.\n";

// 4. Kiểm tra sau khi sửa
echo "\nTRẠNG THÁI SAU KHI SỬA:\n";
echo "=======================\n";

$ordersAfter = DB::table('orders')
    ->leftJoin('order_items', 'orders.id', '=', 'order_items.order_id')
    ->select(
        'orders.id',
        'orders.total_amount',
        'orders.shipping_fee',
        'orders.discount_amount',
        DB::raw('COALESCE(SUM(order_items.quantity * order_items.price), 0) as items_total')
    )
    ->groupBy('orders.id', 'orders.total_amount', 'orders.shipping_fee', 'orders.discount_amount')
    ->get();

foreach ($ordersAfter as $order) {
    $calculatedTotal = $order->items_total + $order->shipping_fee - $order->discount_amount;
    $difference = $order->total_amount - $calculatedTotal;
    
    if (abs($difference) <= 0.01) {
        echo "✅ Order #{$order->id}: NHẤT QUÁN\n";
    } else {
        echo "❌ Order #{$order->id}: VẪN CHÊNH LỆCH {$difference}\n";
    }
}

echo "\n=== HOÀN THÀNH ===\n"; 