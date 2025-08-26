<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "🔍 Testing Product ID 51 API Response\n";
echo "====================================\n";

try {
    $productId = 51; // Áo thun ngắn tay thể thao nam SMG59
    $period = 'month';
    
    echo "Testing product ID: {$productId}, period: {$period}\n";
    echo "---\n";
    
    // Lấy variants của product
    $variantIds = \DB::table('product_variants')->where('product_id', $productId)->pluck('id');
    echo "Variant IDs: " . $variantIds->toJson() . "\n";
    
    if ($variantIds->isEmpty()) {
        echo "❌ No variants found for product {$productId}\n";
        exit;
    }
    
    // Test logic với filter status delivered/completed
    $startDate = \Carbon\Carbon::parse('2020-01-01');
    $endDate = \Carbon\Carbon::now();
    
    echo "Date range: {$startDate} to {$endDate}\n";
    echo "---\n";
    
    // Query với filter status
    $orderItemsQuery = \DB::table('order_items')
        ->whereIn('variant_id', $variantIds)
        ->join('orders', 'order_items.order_id', '=', 'orders.id')
        ->whereBetween('orders.created_at', [$startDate, $endDate])
        ->whereIn('orders.status', ['delivered', 'completed']);
    
    $orderItems = $orderItemsQuery->get();
    
    echo "Order items found: {$orderItems->count()}\n";
    
    if ($orderItems->count() > 0) {
        echo "---\n";
        echo "Order items details:\n";
        foreach ($orderItems as $item) {
            echo "OrderItem ID: {$item->id}, Order ID: {$item->order_id}, Qty: {$item->quantity}, Price: {$item->price}, Order Status: {$item->status}, Date: {$item->created_at}\n";
        }
        
        echo "---\n";
        echo "Statistics:\n";
        
        $totalOrders = $orderItems->groupBy('order_id')->count();
        $totalItems = $orderItems->sum('quantity');
        $totalRevenue = $orderItems->sum(function($item) {
            return $item->quantity * $item->price * 1000; // Giá trong DB là đơn vị nghìn
        });
        $averagePerItem = $totalItems > 0 ? $totalRevenue / $totalItems : 0;
        
        echo "Total Orders: {$totalOrders}\n";
        echo "Total Items: {$totalItems}\n";
        echo "Total Revenue: {$totalRevenue}\n";
        echo "Average per Item: {$averagePerItem}\n";
        
        echo "\n---\n";
        echo "Expected API Response Structure:\n";
        $expectedResponse = [
            'success' => true,
            'data' => [
                'product_id' => $productId,
                'product_name' => 'Áo thun ngắn tay thể thao nam SMG59',
                'total_orders' => $totalOrders,
                'total_revenue' => $totalRevenue,
                'total_quantity_sold' => $totalItems,
                'average_price' => $averagePerItem,
                'top_variants' => [],
                'time_data' => [],
                'period' => $period,
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d'),
            ]
        ];
        echo json_encode($expectedResponse, JSON_PRETTY_PRINT) . "\n";
        
    } else {
        echo "❌ No order items found with delivered/completed status\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}

