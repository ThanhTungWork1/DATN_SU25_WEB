<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\HomeSection;

class HomeSectionSeeder extends Seeder
{
    public function run(): void
    {
        HomeSection::insert([
            ['name' => 'featured', 'title' => 'Sản phẩm nổi bật', 'status' => true],
            ['name' => 'new_arrivals', 'title' => 'Hàng mới về', 'status' => true],
        ]);
    }
}

