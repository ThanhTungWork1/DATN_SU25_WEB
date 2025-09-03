<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        // Chạy mỗi 5 phút để cập nhật nhanh hơn
        $schedule->command('orders:cancel-unpaid')->everyFiveMinutes();
        
        // Chạy mỗi phút trong giờ cao điểm (9h-22h)
        $schedule->command('orders:cancel-unpaid')->everyMinute()->between('09:00', '22:00');
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
