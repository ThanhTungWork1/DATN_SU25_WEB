<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $sampleProducts = [
            [
                'name' => 'Laptop Dell XPS 13',
                'slug' => Str::slug('Laptop Dell XPS 13'),
                'category_id' => 1,
                'description' => 'Laptop cao cấp nhỏ gọn, hiệu năng mạnh.',
                'price' => 25990000,
                'discount' => 1000000,
                'image' => 'https://via.placeholder.com/300x200?text=Dell+XPS+13',
                'status' => 1,
            ],
            [
                'name' => 'PC Gaming ROG Strix',
                'slug' => Str::slug('PC Gaming ROG Strix'),
                'category_id' => 2,
                'description' => 'Máy tính bàn chơi game hiệu năng cao.',
                'price' => 32990000,
                'discount' => 2000000,
                'image' => 'https://via.placeholder.com/300x200?text=ROG+Strix',
                'status' => 1,
            ],
            [
                'name' => 'Card đồ họa RTX 4070 Ti',
                'slug' => Str::slug('Card đồ họa RTX 4070 Ti'),
                'category_id' => 3,
                'description' => 'Card đồ họa cho game và dựng video.',
                'price' => 18990000,
                'discount' => 1500000,
                'image' => 'https://via.placeholder.com/300x200?text=RTX+4070+Ti',
                'status' => 1,
            ],
            [
                'name' => 'Chuột Logitech G Pro',
                'slug' => Str::slug('Chuột Logitech G Pro'),
                'category_id' => 4,
                'description' => 'Chuột không dây cho game thủ chuyên nghiệp.',
                'price' => 2490000,
                'discount' => 300000,
                'image' => 'https://via.placeholder.com/300x200?text=Logitech+G+Pro',
                'status' => 1,
            ],
        ];

        foreach ($sampleProducts as $product) {
            Product::create($product);
        }
    }
}
