<?php

namespace App\Jobs;

use App\Models\Order;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class AutoConfirmDeliveredOrders implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            // Tìm tất cả đơn hàng đã giao hơn 3 ngày
            $threeDaysAgo = Carbon::now()->subDays(3);
            
            $orders = Order::where('status', 'delivered')
                ->where('updated_at', '<=', $threeDaysAgo)
                ->get();
            
            $count = 0;
            foreach ($orders as $order) {
                // Tự động xác nhận đã nhận hàng
                $order->status = 'completed';
                $order->is_paid = true; // Tự động đánh dấu đã thanh toán
                $order->save();
                
                $count++;
                Log::info('🔍 Auto confirmed order #' . $order->id . ' after 3 days');
            }
            
            if ($count > 0) {
                Log::info('🔍 Auto confirmed ' . $count . ' delivered orders after 3 days');
            }
            
        } catch (\Exception $e) {
            Log::error('Error in AutoConfirmDeliveredOrders job: ' . $e->getMessage());
        }
    }
}
