<?php

require 'vendor/autoload.php';
require 'bootstrap/app.php';

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\ProductVariant;
use Carbon\Carbon;

echo '=== KIỂM TRA ĐƠN HÀNG ===' . PHP_EOL;

// Lấy tất cả đơn hàng
$orders = Order::whereIn('status', ['delivered', 'completed'])->get();
echo 'Tổng đơn hàng delivered/completed: ' . $orders->count() . PHP_EOL;

foreach($orders as $order) {
    echo 'Order ID: ' . $order->id . ' | Status: ' . $order->status . ' | Created: ' . $order->created_at . PHP_EOL;
}

echo PHP_EOL . '=== KIỂM TRA ORDER ITEMS ===' . PHP_EOL;

// Lấy order items của sản phẩm SMG59
$product = \App\Models\Product::where('name', 'like', '%SMG59%')->first();
if ($product) {
    echo 'Product ID: ' . $product->id . ' | Name: ' . $product->name . PHP_EOL;
    
    $variantIds = ProductVariant::where('product_id', $product->id)->pluck('id');
    echo 'Variant IDs: ' . $variantIds->toJson() . PHP_EOL;
    
    $orderItems = OrderItem::whereIn('variant_id', $variantIds)->with('order')->get();
    echo 'Order items count: ' . $orderItems->count() . PHP_EOL;
    
    foreach($orderItems as $item) {
        echo 'Item ID: ' . $item->id . ' | Order ID: ' . $item->order_id . ' | Order Status: ' . $item->order->status . ' | Order Created: ' . $item->order->created_at . ' | Quantity: ' . $item->quantity . ' | Price: ' . $item->price . PHP_EOL;
    }
} else {
    echo 'Không tìm thấy sản phẩm SMG59' . PHP_EOL;
}

echo PHP_EOL . '=== KIỂM TRA THỜI GIAN HIỆN TẠI ===' . PHP_EOL;
echo 'Now: ' . Carbon::now() . PHP_EOL;
echo 'Start of month: ' . Carbon::now()->startOfMonth() . PHP_EOL;
echo 'End of month: ' . Carbon::now()->endOfMonth() . PHP_EOL;

echo PHP_EOL . '=== KIỂM TRA LOGIC TIME DATA ===' . PHP_EOL;

// Test logic time data
$startDate = Carbon::parse('2020-01-01');
$endDate = Carbon::now();
$period = 'month';

echo 'Start Date: ' . $startDate . PHP_EOL;
echo 'End Date: ' . $endDate . PHP_EOL;
echo 'Period: ' . $period . PHP_EOL;

if ($product) {
    $variantIds = ProductVariant::where('product_id', $product->id)->pluck('id');
    
    $orderItemsQuery = OrderItem::whereIn('variant_id', $variantIds)
        ->with(['order', 'variant.color', 'variant.size']);

    // BẬT lọc theo thời gian và status theo orders.created_at
    $orderItemsQuery->whereHas('order', function($q) use ($startDate, $endDate) {
        $q->whereBetween('created_at', [$startDate, $endDate])
          ->whereIn('status', ['delivered', 'completed']); // Chỉ tính đơn đã giao/hoàn thành
    });

    $orderItems = $orderItemsQuery->get();
    echo 'Order items after time filter: ' . $orderItems->count() . PHP_EOL;
    
    // Test time data generation
    $label = 'Tháng ' . $startDate->month;
    $rangeStart = $startDate->copy()->startOfMonth();
    $rangeEnd = min($endDate, $startDate->copy()->endOfMonth());
    
    echo 'Label: ' . $label . PHP_EOL;
    echo 'Range Start: ' . $rangeStart . PHP_EOL;
    echo 'Range End: ' . $rangeEnd . PHP_EOL;
    
    $itemsForRange = $orderItems->filter(function($item) use ($rangeStart, $rangeEnd) {
        $created = Carbon::parse(optional($item->order)->created_at);
        return $created && $created->between($rangeStart, $rangeEnd);
    });
    
    echo 'Items for range: ' . $itemsForRange->count() . PHP_EOL;
    echo 'Orders for range: ' . $itemsForRange->groupBy('order_id')->count() . PHP_EOL;
    echo 'Revenue for range: ' . $itemsForRange->sum(function($i){ return $i->quantity * $i->price * 1000; }) . PHP_EOL;
}

