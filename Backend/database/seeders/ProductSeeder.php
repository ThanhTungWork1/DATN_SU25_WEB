<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Product; //có thể dùng Eloquent Model::insert() thay vì DB::table()
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('products')->insert([
            // Sản phẩm 1: Laptop
            [
                'category_id' => 1,
                'name' => 'Laptop',
                'description' => 'A high-performance laptop',
                'price' => 999.99,
                'status' => 1,
                'created_at' => now(),
                'updated_at' => now(),
                'slug' => 'laptop',
                'image' => 'laptop.jpg',
                'material' => null,
                'sold' => 0,
                'hover_image' => null,
            ],
            // Sản phẩm 2: T-Shirt
            [
                'category_id' => 2,
                'name' => 'T-Shirt',
                'description' => 'Comfortable cotton t-shirt',
                'price' => 19.99,
                'status' => 1,
                'created_at' => now(),
                'updated_at' => now(),
                'slug' => 't-shirt',

                'image' => 't-shirt.jpg',
                //thêm các trường
                'material' => 'Cotton',
                'sold' => 0,
                'hover_image' => null,
            ],

            [
                'category_id' => 3,
                'name' => 'Programming Book',
                'description' => 'Comprehensive guide to programming',
                'price' => 39.99,
                'status' => 1,
                'created_at' => now(),
                'updated_at' => now(),
                'slug' => 'programming-book',
                'image' => 'programming-book.jpg',
                //thêm các trường
                'material' => null,
                'sold' => 0,
                'hover_image' => null,
            ],
            // Sản phẩm 4
            [
                'category_id' => 1,
                'name' => 'Áo Thun Thể Thao Cao Cấp',
                'description' => 'Áo thun co giãn 4 chiều, chất liệu vải thoáng khí, chống tia UV.',
                'material' => 'Polyester',
                'sold' => 150,
                'price' => 250000,
                'status' => 1,
                'image' => 'https://example.com/img/ao_thun_the_thao_1.jpg',
                'hover_image' => 'https://example.com/img/ao_thun_the_thao_1_hover.jpg',
                'slug' => 'ao-thun-the-thao-cao-cap',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'category_id' => 2,
                'name' => 'Quần Short Chạy Bộ Nam',
                'description' => 'Thiết kế gọn nhẹ, có túi zip, phù hợp chạy bộ và tập gym.',
                'material' => 'Nylon',
                'sold' => 80,
                'price' => 180000,
                'status' => 1,
                'image' => 'https://example.com/img/quan_short_chay_bo.jpg',
                'hover_image' => 'https://example.com/img/quan_short_chay_bo_hover.jpg',
                'slug' => 'quan-short-chay-bo-nam',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'category_id' => 3,
                'name' => 'Giày Chạy Bộ Nike Air',
                'description' => 'Giày siêu nhẹ, đệm air tốt, thích hợp cho các buổi chạy dài.',
                'material' => 'Mesh',
                'sold' => 200,
                'price' => 1800000,
                'status' => 1,
                'image' => 'https://example.com/img/giay_nike_air.jpg',
                'hover_image' => 'https://example.com/img/giay_nike_air_hover.jpg',
                'slug' => 'giay-chay-bo-nike-air',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'category_id' => 1,
                'name' => 'Áo Polo Tennis',
                'description' => 'Áo polo thoáng mát, chuyên dùng cho chơi tennis.',
                'material' => 'Cotton',
                'sold' => 75,
                'price' => 300000,
                'status' => 1,

                'image' => 'https://example.com/img/polo_tennis.jpg',
                'hover_image' => 'https://example.com/img/polo_tennis_hover.jpg',
                'slug' => 'ao-polo-tennis',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'category_id' => 2,
                'name' => 'Quần Thể Thao Dài',
                'description' => 'Quần dài ôm chân, chất vải dày dặn.',
                'material' => 'Fleece',
                'sold' => 110,
                'price' => 280000,
                'status' => 1,

                'image' => 'https://example.com/img/quan_dai_the_thao.jpg',
                'hover_image' => 'https://example.com/img/quan_dai_the_thao_hover.jpg',
                'slug' => 'quan-the-thao-dai',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}