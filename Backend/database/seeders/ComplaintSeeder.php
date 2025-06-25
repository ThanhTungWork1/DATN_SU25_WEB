<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ComplaintSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('complaints')->insert([
            ['user_id' => 1, 'order_id' => 1, 'description' => 'Item damaged on arrival', 'status' => 'pending', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}