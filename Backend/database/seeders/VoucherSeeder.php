<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class VoucherSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('vouchers')->insert([
            ['title' => 'Summer Sale', 'code' => 'SUMMER20', 'value' => 20.00, 'max_value' => 50.00, 'quantity' => 100, 'description' => '20% off summer items', 'start_date' => '2025-06-01', 'end_date' => '2025-06-30', 'status' => true, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}