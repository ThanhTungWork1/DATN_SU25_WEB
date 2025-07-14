<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductVariantSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('product_variants')->insert([
            [
                'product_id' => 2,
                'color_id' => 2,
                'size_id' => 2,
                'stock' => 50,
                'price' => 19.99,
                'old_price' => 25.99,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'product_id' => 2,
                'color_id' => 1,
                'size_id' => 1,
                'stock' => 30,
                'price' => 19.99,
                'old_price' => 24.99,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}