<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Order;
use Illuminate\Support\Facades\DB;

class TestCancelOrders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'orders:test-cancel';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test cancel unpaid orders logic';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🔍 Testing cancel unpaid orders logic...');

        // Kiểm tra đơn hàng 129, 130, 131
        $testOrders = Order::whereIn('id', [129, 130, 131])->get();
        
        if ($testOrders->isEmpty()) {
            $this->error('❌ Không tìm thấy đơn hàng test!');
            return;
        }

        $this->info('📋 Found ' . $testOrders->count() . ' test orders:');
        
        foreach ($testOrders as $order) {
            $this->info("  - Order #{$order->id}:");
            $this->info("    Status: {$order->status}");
            $this->info("    Created: {$order->created_at}");
            $this->info("    Payment Method: {$order->payment_method}");
            $this->info("    Is Paid: " . ($order->is_paid ? 'Yes' : 'No'));
            
            // Kiểm tra xem có hết hạn không
            $createdAt = $order->created_at;
            $expirationTime = $createdAt->addMinutes(60);
            $now = now();
            $isExpired = $now->gt($expirationTime);
            
            $this->info("    Expiration: {$expirationTime}");
            $this->info("    Is Expired: " . ($isExpired ? 'Yes' : 'No'));
            $this->info("    Time Left: " . $now->diffForHumans($expirationTime));
            $this->info('');
        }

        // Kiểm tra tất cả đơn hàng waiting_for_payment
        $waitingOrders = Order::where('status', 'waiting_for_payment')->get();
        
        if ($waitingOrders->isEmpty()) {
            $this->info('✅ Không có đơn hàng nào đang chờ thanh toán');
        } else {
            $this->info("⚠️  Có {$waitingOrders->count()} đơn hàng đang chờ thanh toán:");
            
            foreach ($waitingOrders as $order) {
                $createdAt = $order->created_at;
                $expirationTime = $createdAt->addMinutes(60);
                $now = now();
                $isExpired = $now->gt($expirationTime);
                
                $this->info("  - Order #{$order->id} (created: {$createdAt->format('Y-m-d H:i:s')}) - " . ($isExpired ? 'EXPIRED' : 'NOT EXPIRED'));
            }
        }

        $this->info('🔍 Test completed!');
    }
}
