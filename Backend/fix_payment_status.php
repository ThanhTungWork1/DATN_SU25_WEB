<?php

require_once 'vendor/autoload.php';

use App\Models\Order;

// Reset trạng thái thanh toán cho các đơn hàng chưa hoàn thành
$orders = Order::whereIn('status', ['pending_confirmation', 'confirmed', 'processing', 'shipping'])
              ->where('is_paid', true)
              ->get();

echo "Found " . $orders->count() . " orders with incorrect payment status\n";

foreach ($orders as $order) {
    echo "Order #{$order->id}: Status = {$order->status}, is_paid = {$order->is_paid}\n";
    
    // Reset is_paid to false for orders that are not delivered/completed
    $order->update(['is_paid' => false]);
    echo "  -> Updated is_paid to false\n";
}

echo "Payment status fix completed!\n"; 