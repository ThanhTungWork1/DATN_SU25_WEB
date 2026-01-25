<?php

namespace App\Console\Commands;

use App\Jobs\AutoConfirmDeliveredOrders;
use Illuminate\Console\Command;

class RunAutoConfirmOrders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'orders:auto-confirm';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Tự động xác nhận đơn hàng đã giao sau 3 ngày';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🔄 Đang chạy job tự động xác nhận đơn hàng...');
        
        AutoConfirmDeliveredOrders::dispatch();
        
        $this->info('✅ Job đã được dispatch thành công!');
    }
}
