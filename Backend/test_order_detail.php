<?php

require 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\Order;

echo "=== TEST ORDER DETAIL API ===\n\n";

// Test với order ID 9 (đơn hàng cuối cùng)
$orderId = 9;

try {
    $order = Order::with('items')->find($orderId);
    
    if (!$order) {
        echo "❌ Không tìm thấy đơn hàng ID: {$orderId}\n";
        exit;
    }
    
    echo "✅ Tìm thấy đơn hàng ID: {$orderId}\n";
    echo "Order Code: {$order->order_code}\n";
    echo "Status: {$order->status}\n";
    echo "Is Paid: " . ($order->is_paid ? 'true' : 'false') . "\n";
    echo "Total Amount: {$order->total_amount}\n";
    echo "Shipping Fee: {$order->shipping_fee}\n";
    echo "Discount Amount: {$order->discount_amount}\n";
    echo "Final Amount: {$order->final_amount}\n";
    echo "Created At: {$order->created_at}\n";
    echo "Items Count: " . $order->items->count() . "\n";
    
    echo "\n=== ORDER ITEMS ===\n";
    foreach ($order->items as $item) {
        echo "Item ID: {$item->id}\n";
        echo "Product Name: {$item->product_name}\n";
        echo "Price: {$item->price}\n";
        echo "Quantity: {$item->quantity}\n";
        echo "---\n";
    }
    
    // Test JSON response
    echo "\n=== JSON RESPONSE ===\n";
    $jsonResponse = $order->toArray();
    echo json_encode($jsonResponse, JSON_PRETTY_PRINT);
    
} catch (\Exception $e) {
    echo "❌ Lỗi: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
} 