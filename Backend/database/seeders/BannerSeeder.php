<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Banner;

class BannerSeeder extends Seeder
{
    public function run()
    {
        Banner::create(['image_url' => 'banner1.jpg', 'public_id' => 'banner_1', 'status' => true]);
    }
}