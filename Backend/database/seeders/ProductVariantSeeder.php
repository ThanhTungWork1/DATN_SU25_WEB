<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductVariantSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('product_variants')->insert([
            [
                'product_id' => 2,
                'color_id' => 2,
                'size_id' => 2,
                'stock' => 50,
                'price' => 10,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'product_id' => 2,
                'color_id' => 1,
                'size_id' => 1,
                'stock' => 30,
                'price' => 10,
                'created_at' => now(),
                'updated_at' => now(),
            ],

        ]);
    }
}
