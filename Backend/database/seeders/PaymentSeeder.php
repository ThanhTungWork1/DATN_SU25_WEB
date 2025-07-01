<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PaymentSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('payments')->insert([
            ['order_id' => 2, 'method' => 'Credit Card', 'status' => 'completed', 'amount' => 49.97, 'paid_at' => now(), 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}