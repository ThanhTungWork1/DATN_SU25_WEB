<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "🔍 Checking orders in database:\n";
echo "==============================\n";

try {
    $orders = \DB::table('orders')->select('id', 'status', 'created_at')->get();
    
    if ($orders->count() > 0) {
        echo "Total orders: {$orders->count()}\n";
        echo "---\n";
        
        foreach ($orders as $order) {
            echo "ID: {$order->id}, Status: {$order->status}, Created: {$order->created_at}\n";
        }
        
        // Kiểm tra theo trạng thái
        echo "\n---\n";
        echo "Orders by status:\n";
        
        $delivered = \DB::table('orders')->where('status', 'delivered')->count();
        $completed = \DB::table('orders')->where('status', 'completed')->count();
        $pending = \DB::table('orders')->where('status', 'pending')->count();
        
        echo "Delivered: {$delivered}\n";
        echo "Completed: {$completed}\n";
        echo "Pending: {$pending}\n";
        echo "Total (delivered + completed): " . ($delivered + $completed) . "\n";
        
    } else {
        echo "No orders found in database.\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

