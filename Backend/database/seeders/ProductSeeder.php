<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('products')->insert([
            [
                'category_id' => 1, // Electronics
                'name' => 'Laptop',
                'description' => 'A high-performance laptop',
                'price' => 999.99,
                'status' => 1,
                'created_at' => now(),
                'updated_at' => now(),
                'slug' => 'laptop',
                'discount' => 100.00,
                'image' => 'laptop.jpg',
            ],
            [
                'category_id' => 2, // Clothing
                'name' => 'T-Shirt',
                'description' => 'Comfortable cotton t-shirt',
                'price' => 19.99,
                'status' => 1,
                'created_at' => now(),
                'updated_at' => now(),
                'slug' => 't-shirt',
                'discount' => 2.00,
                'image' => 't-shirt.jpg',
            ],
            [
                'category_id' => 3, // Books
                'name' => 'Programming Book',
                'description' => 'Comprehensive guide to programming',
                'price' => 39.99,
                'status' => 1,
                'created_at' => now(),
                'updated_at' => now(),
                'slug' => 'programming-book',
                'discount' => 5.00,
                'image' => 'programming-book.jpg',
            ],
        ]);
    }
}