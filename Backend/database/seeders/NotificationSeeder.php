<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class NotificationSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('notifications')->insert([
            ['user_id' => 1, 'order_id' => 1, 'message' => 'Your order is being processed', 'is_read' => false, 'created_at' => now(), 'updated_at' => now()],
            ['user_id' => 2, 'order_id' => 2, 'message' => 'Your order has been shipped', 'is_read' => false, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}