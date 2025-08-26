<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "🔍 Testing Product Statistics Data\n";
echo "=================================\n";

try {
    // Kiểm tra products
    echo "📦 Products in database:\n";
    $products = \DB::table('products')->select('id', 'name', 'category_id')->get();
    foreach ($products as $product) {
        echo "ID: {$product->id}, Name: {$product->name}, Category: {$product->category_id}\n";
    }
    
    echo "\n---\n";
    
    // Kiểm tra order_items
    echo "🛒 Order Items in database:\n";
    $orderItems = \DB::table('order_items')
        ->join('product_variants', 'order_items.variant_id', '=', 'product_variants.id')
        ->join('products', 'product_variants.product_id', '=', 'products.id')
        ->join('orders', 'order_items.order_id', '=', 'orders.id')
        ->select(
            'order_items.id',
            'products.name as product_name',
            'order_items.quantity',
            'order_items.price',
            'orders.status as order_status',
            'orders.created_at'
        )
        ->get();
    
    if ($orderItems->count() > 0) {
        foreach ($orderItems as $item) {
            echo "OrderItem ID: {$item->id}, Product: {$item->product_name}, Qty: {$item->quantity}, Price: {$item->price}, Order Status: {$item->order_status}, Date: {$item->created_at}\n";
        }
    } else {
        echo "No order items found.\n";
    }
    
    echo "\n---\n";
    
    // Kiểm tra theo product cụ thể
    echo "🎯 Testing specific product (ID: 1):\n";
    $productId = 1;
    
    // Lấy variants của product
    $variants = \DB::table('product_variants')->where('product_id', $productId)->pluck('id');
    echo "Variants for product {$productId}: " . $variants->toJson() . "\n";
    
    if ($variants->count() > 0) {
        // Kiểm tra order_items cho variants này
        $productOrderItems = \DB::table('order_items')
            ->whereIn('variant_id', $variants)
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->select(
                'order_items.quantity',
                'order_items.price',
                'orders.status',
                'orders.created_at'
            )
            ->get();
        
        echo "Order items for product {$productId}: {$productOrderItems->count()}\n";
        
        if ($productOrderItems->count() > 0) {
            $totalQuantity = $productOrderItems->sum('quantity');
            $totalRevenue = $productOrderItems->sum(function($item) {
                return $item->quantity * $item->price * 1000; // Giá trong DB là đơn vị nghìn
            });
            
            echo "Total quantity sold: {$totalQuantity}\n";
            echo "Total revenue: {$totalRevenue}\n";
        }
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}

