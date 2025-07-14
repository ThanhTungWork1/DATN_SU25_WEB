<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class OrderItemSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('order_items')->insert([
            ['order_id' => 1, 'variant_id' => 1, 'quantity' => 1, 'price' => 999.99, 'created_at' => now(), 'updated_at' => now()],
            ['order_id' => 2, 'variant_id' => 2, 'quantity' => 2, 'price' => 19.99, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}