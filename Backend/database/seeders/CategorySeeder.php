<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use App\Models\Category;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Xóa dữ liệu cũ trong bảng categories để làm mới
        Schema::disableForeignKeyConstraints();
        Category::truncate();
        Schema::enableForeignKeyConstraints();

        $categories = [
            'Áo thun nam', 'Tanktop nam', 'Áo sơ mi nam', 'Áo polo nam', 'Áo thể thao nam',
            'Quần jeans nam', 'Quần short nam', 'Quần thể thao nam', 'Quần dài nam', 'Quần jogger nam',
            'Áo thun nữ', 'Áo sơ mi nữ', 'Áo Croptop nữ', 'Áo polo nữ', 'Áo Tanktop nữ',
            'Quần legging nữ', 'Quần jeans nữ', 'Quần short nữ', 'Quần jogger nữ', 'Váy đầm thể thao nữ',
            'Mũ nón', 'Tất vớ', 'Túi xách', 'Thắt lưng'
        ];

        foreach ($categories as $categoryName) {
            DB::table('categories')->insert([
                'name' => $categoryName,
                'slug' => Str::slug($categoryName), // Tự động tạo slug
                'status' => true, // Mặc định là 'Hoạt động'
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}