<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "🔍 Testing Dashboard Logic Directly\n";
echo "==================================\n";

// Test với date range hôm nay
$today = date('Y-m-d');
echo "Testing with date range: {$today} to {$today}\n";
echo "---\n";

try {
    $startDate = \Carbon\Carbon::parse($today)->startOfDay();
    $endDate = \Carbon\Carbon::parse($today)->endOfDay();
    
    echo "Start Date: {$startDate}\n";
    echo "End Date: {$endDate}\n";
    echo "---\n";
    
    // Test logic từ DashboardController
    $totalOrdersQuery = \DB::table('orders')->whereIn('status', ['delivered', 'completed']);
    $totalOrdersQuery->whereBetween('created_at', [$startDate, $endDate]);
    
    $orders_in_period = $totalOrdersQuery->count();
    
    echo "Query SQL: " . $totalOrdersQuery->toSql() . "\n";
    echo "Query Bindings: " . json_encode($totalOrdersQuery->getBindings()) . "\n";
    echo "---\n";
    
    echo "Result: orders_in_period = {$orders_in_period}\n";
    
    // Kiểm tra chi tiết
    echo "\n---\n";
    echo "Detailed check:\n";
    
    $delivered = \DB::table('orders')
        ->where('status', 'delivered')
        ->whereBetween('created_at', [$startDate, $endDate])
        ->count();
    
    $completed = \DB::table('orders')
        ->where('status', 'completed')
        ->whereBetween('created_at', [$startDate, $endDate])
        ->count();
    
    echo "Delivered orders in range: {$delivered}\n";
    echo "Completed orders in range: {$completed}\n";
    echo "Total (delivered + completed): " . ($delivered + $completed) . "\n";
    
    // Kiểm tra tất cả orders trong range
    echo "\n---\n";
    echo "All orders in date range:\n";
    $allOrders = \DB::table('orders')
        ->whereBetween('created_at', [$startDate, $endDate])
        ->select('id', 'status', 'created_at')
        ->get();
    
    foreach ($allOrders as $order) {
        echo "ID: {$order->id}, Status: {$order->status}, Created: {$order->created_at}\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}

