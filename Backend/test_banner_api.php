<?php
// Test script để kiểm tra API banner
require_once 'vendor/autoload.php';

use Illuminate\Http\Request;

// Khởi tạo Laravel app
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

// Test tạo banner mẫu trực tiếp
$banner = new App\Models\Banner();
$banner->image_url = 'https://via.placeholder.com/1200x400/4F46E5/FFFFFF?text=Test+Banner';
$banner->public_id = 'test_banner_1';
$banner->status = true;
$banner->save();

echo "Banner đã được tạo với ID: " . $banner->id . "\n";
echo "Image URL: " . $banner->image_url . "\n";

// Test API endpoint
$controller = new App\Http\Controllers\Api\BannerController();
$response = $controller->adminIndex();
$data = json_decode($response->getContent(), true);

echo "Số lượng banner trong DB: " . count($data['data']) . "\n";
foreach ($data['data'] as $item) {
    echo "Banner ID {$item['id']}: {$item['image_url']}\n";
}
