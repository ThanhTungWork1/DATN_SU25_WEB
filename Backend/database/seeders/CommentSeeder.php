<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Comment;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\Schema;

class CommentSeeder extends Seeder
{

    public function run(): void
    {

        Schema::disableForeignKeyConstraints();
        Comment::truncate();
        Schema::enableForeignKeyConstraints();

        // Lấy 2 người dùng đầu tiên
        $users = User::take(2)->get();
        // Lấy 2 sản phẩm đầu tiên
        $products = Product::take(2)->get();

        if ($users->count() >= 2 && $products->count() >= 2) {
            Comment::create([
                'product_id' => $products[0]->id, 
                'user_id' => $users[0]->id,
                'content' => 'Sản phẩm này rất tuyệt vời, chất liệu vải tốt!',
                'rating' => 5,
                'status' => true,
            ]);

            Comment::create([
                'product_id' => $products[1]->id,
                'user_id' => $users[1]->id,
                'content' => 'Chất lượng tốt, giao hàng nhanh.',
                'rating' => 4,
                'status' => true,
            ]);
        } else {
            // In ra cảnh báo nếu không có đủ user hoặc product
            $this->command->info('Không thể tạo bình luận mẫu do thiếu dữ liệu User hoặc Product.');
        }
    }
}