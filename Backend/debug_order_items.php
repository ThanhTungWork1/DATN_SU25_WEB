<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "🔍 Debug Order Items and Product Mapping\n";
echo "=======================================\n";

try {
    // Kiểm tra tất cả order items
    echo "📦 All Order Items:\n";
    $allOrderItems = \DB::table('order_items')
        ->join('product_variants', 'order_items.variant_id', '=', 'product_variants.id')
        ->join('products', 'product_variants.product_id', '=', 'products.id')
        ->join('orders', 'order_items.order_id', '=', 'orders.id')
        ->select(
            'order_items.id as order_item_id',
            'order_items.variant_id',
            'order_items.quantity',
            'order_items.price',
            'products.id as product_id',
            'products.name as product_name',
            'orders.id as order_id',
            'orders.status as order_status',
            'orders.created_at'
        )
        ->get();
    
    if ($allOrderItems->count() > 0) {
        foreach ($allOrderItems as $item) {
            echo "OrderItem ID: {$item->order_item_id}, Variant ID: {$item->variant_id}, Product ID: {$item->product_id}, Product: {$item->product_name}, Qty: {$item->quantity}, Price: {$item->price}, Order ID: {$item->order_id}, Status: {$item->order_status}, Date: {$item->created_at}\n";
        }
    } else {
        echo "No order items found.\n";
    }
    
    echo "\n---\n";
    
    // Kiểm tra product variants
    echo "🎯 Product Variants:\n";
    $variants = \DB::table('product_variants')
        ->join('products', 'product_variants.product_id', '=', 'products.id')
        ->select('product_variants.id', 'product_variants.product_id', 'products.name as product_name')
        ->get();
    
    foreach ($variants as $variant) {
        echo "Variant ID: {$variant->id}, Product ID: {$variant->product_id}, Product: {$variant->product_name}\n";
    }
    
    echo "\n---\n";
    
    // Kiểm tra orders
    echo "📋 Orders:\n";
    $orders = \DB::table('orders')->select('id', 'status', 'created_at')->get();
    foreach ($orders as $order) {
        echo "Order ID: {$order->id}, Status: {$order->status}, Date: {$order->created_at}\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}

