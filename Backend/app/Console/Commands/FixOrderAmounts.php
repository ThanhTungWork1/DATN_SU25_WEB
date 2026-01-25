<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Order;
use Illuminate\Support\Facades\DB;

class FixOrderAmounts extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:fix-order-amounts';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Recalculate and fix the total and final amounts for existing orders.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting to fix order amounts...');

        $orders = Order::with('items')->get();
        $updatedCount = 0;

        DB::beginTransaction();
        try {
            foreach ($orders as $order) {
                // Tính toán lại tổng tiền của các sản phẩm
                $recalculated_total_amount = $order->items->sum(function ($item) {
                    return $item->price * $item->quantity;
                });

                // Tính toán lại tổng tiền cuối cùng
                $recalculated_final_amount = $recalculated_total_amount + $order->shipping_fee - $order->discount_amount;

                // Chỉ cập nhật nếu có sự khác biệt
                if ($order->total_amount != $recalculated_total_amount || $order->final_amount != $recalculated_final_amount) {
                    $this->line("Fixing Order ID: {$order->id}. Old Final Amount: {$order->final_amount}, New: {$recalculated_final_amount}");

                    $order->total_amount = $recalculated_total_amount;
                    $order->final_amount = $recalculated_final_amount;
                    $order->save();

                    $updatedCount++;
                }
            }

            DB::commit();
            $this->info("Successfully updated {$updatedCount} orders.");

        } catch (\Exception $e) {
            DB::rollBack();
            $this->error('An error occurred: ' . $e->getMessage());
            return 1; // Return a non-zero status code to indicate failure
        }

        return 0; // Success
    }
}
