<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class OrderSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('orders')->insert([
            ['user_id' => 1, 'total_amount' => 1019.98, 'shipping_fee' => 19.99, 'is_paid' => false, 'status' => 'pending', 'created_at' => now(), 'updated_at' => now()],
            ['user_id' => 2, 'total_amount' => 39.98, 'shipping_fee' => 9.99, 'is_paid' => true, 'status' => 'completed', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}