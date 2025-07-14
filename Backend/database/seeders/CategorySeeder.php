<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        DB::table('categories')->insert([
            ['name' => 'Electronics', 'status' => true, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Clothing', 'status' => true, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Books', 'status' => true, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}