<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "🔍 Testing Fixed Dashboard Logic\n";
echo "===============================\n";

try {
    // Test logic đã sửa - không có date filter
    echo "Testing WITHOUT date filter (should show all delivered/completed orders):\n";
    echo "---\n";
    
    $totalOrdersQuery = \DB::table('orders')->whereIn('status', ['delivered', 'completed']);
    $orders_in_period = $totalOrdersQuery->count();
    
    echo "Query SQL: " . $totalOrdersQuery->toSql() . "\n";
    echo "Query Bindings: " . json_encode($totalOrdersQuery->getBindings()) . "\n";
    echo "---\n";
    
    echo "Result: orders_in_period = {$orders_in_period}\n";
    
    // Kiểm tra chi tiết
    echo "\n---\n";
    echo "Detailed check:\n";
    
    $delivered = \DB::table('orders')->where('status', 'delivered')->count();
    $completed = \DB::table('orders')->where('status', 'completed')->count();
    
    echo "Total delivered orders: {$delivered}\n";
    echo "Total completed orders: {$completed}\n";
    echo "Total (delivered + completed): " . ($delivered + $completed) . "\n";
    
    // Hiển thị tất cả orders delivered/completed
    echo "\n---\n";
    echo "All delivered/completed orders:\n";
    $allOrders = \DB::table('orders')
        ->whereIn('status', ['delivered', 'completed'])
        ->select('id', 'status', 'created_at')
        ->get();
    
    foreach ($allOrders as $order) {
        echo "ID: {$order->id}, Status: {$order->status}, Created: {$order->created_at}\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}

