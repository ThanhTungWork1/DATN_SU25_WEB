<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class UpdateOrderFinalAmount extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'orders:update-final-amount';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Recalculate and update the final_amount for all orders based on their items.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting to update final_amount for all orders...');

        $orders = \App\Models\Order::with('items')->get();
        $updatedCount = 0;

        if ($orders->isEmpty()) {
            $this->info('No orders found to update.');
            return 0;
        }

        $progressBar = $this->output->createProgressBar($orders->count());
        $progressBar->start();

        foreach ($orders as $order) {
            $calculatedAmount = $order->calculated_final_amount;

            // So sánh với sai số nhỏ để tránh lỗi float
            if (abs($order->final_amount - $calculatedAmount) > 0.001) {
                $order->final_amount = $calculatedAmount;
                $order->save(); // Chỉ lưu khi có thay đổi
                $updatedCount++;
            }
            $progressBar->advance();
        }

        $progressBar->finish();
        $this->info("\nUpdate complete!");
        $this->info("Total orders checked: " . $orders->count());
        $this->info("Total orders updated: " . $updatedCount);

        return 0;
    }
}
