<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SizeSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('sizes')->insert([
            ['name' => 'S', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'M', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'L', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}