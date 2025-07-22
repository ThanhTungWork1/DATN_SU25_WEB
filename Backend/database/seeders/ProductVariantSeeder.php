<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\ProductVariant; 
use Illuminate\Support\Facades\Schema;

class ProductVariantSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // BƯỚC 1: Xóa sạch dữ liệu cũ trong bảng để làm mới
        // Giúp bạn có thể chạy seeder này nhiều lần mà không bị lỗi trùng lặp.
        Schema::disableForeignKeyConstraints();
        ProductVariant::truncate();
        Schema::enableForeignKeyConstraints();

        // BƯỚC 2: Chèn dữ liệu mẫu hoàn chỉnh
        DB::table('product_variants')->insert([
            // --- Biến thể cho Product ID = 1 ---
            [
                'product_id' => 1,
                'color_id' => 1, // Giả sử ID 1 là màu Đỏ
                'size_id' => 1,  // Giả sử ID 1 là size S
                'stock' => 100,
                'price' => 150000,
                'sku' => 'AOTHUN-PREMIUM-DO-S', // THÊM: Mã SKU
                'image' => 'https://example.com/images/aothun-do.jpg', // THÊM: Ảnh riêng
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'product_id' => 1,
                'color_id' => 2, // Giả sử ID 2 là màu Xanh
                'size_id' => 2,  // Giả sử ID 2 là size M
                'stock' => 80,
                'price' => 150000,
                'sku' => 'AOTHUN-PREMIUM-XANH-M',
                'image' => 'https://example.com/images/aothun-xanh.jpg',
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // --- Biến thể cho Product ID = 2
            [
                'product_id' => 2,
                'color_id' => 2,
                'size_id' => 2,
                'stock' => 50,
                'price' => 250000,
                'sku' => 'AOKHOAC-KAKI-XANH-M',
                'image' => null, // Có thể để trống
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'product_id' => 2,
                'color_id' => 1,
                'size_id' => 1,
                'stock' => 30,
                'price' => 250000,
                'sku' => 'AOKHOAC-KAKI-DO-S',
                'image' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
