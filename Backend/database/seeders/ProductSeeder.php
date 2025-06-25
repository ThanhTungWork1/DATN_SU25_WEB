<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('products')->insert([
            ['name' => 'Laptop', 'category_id' => 1, 'description' => 'A high-performance laptop', 'price' => 999.99, 'status' => true, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'T-Shirt', 'category_id' => 2, 'description' => 'Comfortable cotton t-shirt', 'price' => 19.99, 'status' => true, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}