<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Banner;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;

class BannerSeeder extends Seeder
{
    public function run()
    {
        // Tạo thư mục banners nếu chưa tồn tại
        if (!Storage::disk('public')->exists('banners')) {
            Storage::disk('public')->makeDirectory('banners');
        }

        // Tạo banner mẫu với URL ảnh placeholder
        $banners = [
            [
                'image_url' => 'https://via.placeholder.com/1200x400/4F46E5/FFFFFF?text=Banner+1',
                'public_id' => 'placeholder_banner_1',
                'status' => true
            ],
            [
                'image_url' => 'https://via.placeholder.com/1200x400/7C3AED/FFFFFF?text=Banner+2',
                'public_id' => 'placeholder_banner_2', 
                'status' => true
            ],
            [
                'image_url' => 'https://via.placeholder.com/1200x400/059669/FFFFFF?text=Banner+3',
                'public_id' => 'placeholder_banner_3',
                'status' => false
            ]
        ];

        foreach ($banners as $banner) {
            Banner::updateOrCreate(
                ['public_id' => $banner['public_id']],
                $banner
            );
        }
    }
}