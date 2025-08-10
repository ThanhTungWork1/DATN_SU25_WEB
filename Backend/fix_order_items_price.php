<?php

require_once 'vendor/autoload.php';

use Illuminate\Support\Facades\DB;

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== KHẮC PHỤC BẰNG CÁCH CẬP NHẬT ORDER_ITEMS.PRICE ===\n";
echo "======================================================\n";

// 1. Hiển thị trạng thái trước khi sửa
echo "TRẠNG THÁI TRƯỚC KHI SỬA:\n";
echo "==========================\n";

$orders = DB::table('orders')
    ->join('order_items', 'orders.id', '=', 'order_items.order_id')
    ->select(
        'orders.id',
        'orders.total_amount',
        'orders.shipping_fee',
        'orders.discount_amount',
        DB::raw('SUM(order_items.quantity * order_items.price) as items_total'),
        DB::raw('SUM(order_items.quantity) as total_quantity')
    )
    ->groupBy('orders.id', 'orders.total_amount', 'orders.shipping_fee', 'orders.discount_amount')
    ->get();

foreach ($orders as $order) {
    $calculatedTotal = $order->items_total + $order->shipping_fee - $order->discount_amount;
    $difference = $order->total_amount - $calculatedTotal;
    
    echo "Order #{$order->id}:\n";
    echo "  - Total Amount: {$order->total_amount}\n";
    echo "  - Items Total: {$order->items_total}\n";
    echo "  - Total Quantity: {$order->total_quantity}\n";
    echo "  - Shipping Fee: {$order->shipping_fee}\n";
    echo "  - Discount: {$order->discount_amount}\n";
    echo "  - Chênh lệch: {$difference}\n\n";
}

// 2. Xác nhận từ người dùng
echo "Bạn có muốn cập nhật order_items.price không? (y/n): ";
$handle = fopen("php://stdin", "r");
$line = fgets($handle);
fclose($handle);

if (trim(strtolower($line)) !== 'y') {
    echo "Hủy bỏ cập nhật.\n";
    exit;
}

// 3. Cập nhật order_items.price
echo "\nĐANG CẬP NHẬT...\n";
echo "================\n";

$updatedCount = 0;

foreach ($orders as $order) {
    // Tính giá mới cho mỗi item
    $targetItemsTotal = $order->total_amount - $order->shipping_fee + $order->discount_amount;
    $newPricePerUnit = $targetItemsTotal / $order->total_quantity;
    
    // Cập nhật tất cả order_items của order này
    $orderItems = DB::table('order_items')
        ->where('order_id', $order->id)
        ->get();
    
    foreach ($orderItems as $item) {
        DB::table('order_items')
            ->where('id', $item->id)
            ->update(['price' => $newPricePerUnit]);
        
        echo "✅ Cập nhật Order #{$order->id}, Item #{$item->id}: {$item->price} → {$newPricePerUnit}\n";
        $updatedCount++;
    }
}

echo "\nĐã cập nhật {$updatedCount} order_items.\n";

// 4. Kiểm tra sau khi sửa
echo "\nTRẠNG THÁI SAU KHI SỬA:\n";
echo "=======================\n";

$ordersAfter = DB::table('orders')
    ->join('order_items', 'orders.id', '=', 'order_items.order_id')
    ->select(
        'orders.id',
        'orders.total_amount',
        'orders.shipping_fee',
        'orders.discount_amount',
        DB::raw('SUM(order_items.quantity * order_items.price) as items_total')
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