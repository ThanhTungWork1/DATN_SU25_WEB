<?php

require_once 'vendor/autoload.php';

use App\Models\Order;

// Khởi tạo Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "=== KIỂM TRA TRẠNG THÁI THANH TOÁN ĐƠN HÀNG ===\n";

try {
    $orders = Order::where('status', 'cancelled')->get();
    
    echo "Đơn hàng đã hủy:\n";
    foreach ($orders as $order) {
        echo "\nĐơn hàng #{$order->id}: {$order->order_code}\n";
        echo "- Khách hàng: {$order->customer_name}\n";
        echo "- Ngày đặt: {$order->created_at}\n";
        echo "- Trạng thái: {$order->status}\n";
        echo "- is_paid: " . var_export($order->is_paid, true) . "\n";
        echo "- payment_method: {$order->payment_method}\n";
        
        // Xác định hiển thị
        $isPaidBool = $order->is_paid === true || $order->is_paid == 1 || $order->is_paid === 'paid';
        
        if ($isPaidBool) {
            echo "- Hiển thị: ❌ Đã thanh toán – cần hoàn tiền\n";
        } else if ($order->payment_method === 'COD') {
            echo "- Hiển thị: 🔄 COD – đã hủy trước khi giao\n";
        } else {
            echo "- Hiển thị: ✅ Chưa thanh toán\n";
        }
    }
    
} catch (Exception $e) {
    echo "❌ Lỗi: " . $e->getMessage() . "\n";
} 