<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class CancelUnpaidOrders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'orders:cancel-unpaid';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Cancel unpaid orders that are older than 60 minutes and restock items';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting to cancel unpaid orders...');

        $expirationTime = now()->subMinutes(60);

        // Tìm các đơn hàng chờ thanh toán đã quá hạn
        $ordersToCancel = \App\Models\Order::where('status', 'waiting_for_payment')
                                           ->where('created_at', '<=', $expirationTime)
                                           ->get();

        if ($ordersToCancel->isEmpty()) {
            $this->info('No unpaid orders to cancel.');
            return;
        }

        $this->info($ordersToCancel->count() . ' unpaid orders found. Starting cancellation process...');

        foreach ($ordersToCancel as $order) {
            // Bắt đầu transaction để đảm bảo toàn vẹn dữ liệu
            \Illuminate\Support\Facades\DB::transaction(function () use ($order) {
                // Cập nhật trạng thái đơn hàng
                $order->status = 'cancelled';
                $order->save();

                // Hoàn trả số lượng cho từng sản phẩm trong đơn hàng
                foreach ($order->items as $item) {
                    $variant = $item->variant;
                    if ($variant) {
                        $variant->quantity += $item->quantity;
                        $variant->save();
                    }
                }
            });

            $this->info('Order #' . $order->id . ' has been cancelled and items restocked.');
        }

        $this->info('Finished cancelling unpaid orders.');
    }
}
