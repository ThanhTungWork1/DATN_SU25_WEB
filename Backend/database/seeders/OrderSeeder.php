<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\Order; // THÊM: Import Order model
use Illuminate\Support\Facades\Schema; // THÊM: Import Schema

class OrderSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // THÊM MỚI: Tạm thời vô hiệu hóa khóa ngoại, xóa sạch dữ liệu cũ trong bảng orders và kích hoạt lại.
        // Việc này đảm bảo bảng orders luôn được làm mới mà không gây lỗi.
        Schema::disableForeignKeyConstraints();
        Order::truncate();
        Schema::enableForeignKeyConstraints();

        // Lấy thông tin user có sẵn để điền vào đơn hàng
        $user1 = User::find(1);
        $user2 = User::find(2);

        // Chèn dữ liệu mới hoàn chỉnh
        DB::table('orders')->insert([
            [
                'user_id' => 1,
                'total_amount' => 1019.98,
                'shipping_fee' => 19.99,
                'is_paid' => false,
                'status' => 'processing',
                'discount_amount' => 0.00,
                'customer_name' => $user1 ? $user1->name : 'Khách hàng 1',
                'customer_email' => $user1 ? $user1->email : 'user1@example.com',
                'customer_phone' => $user1 && property_exists($user1, 'phone') ? $user1->phone : '0901111222',
                'shipping_address' => $user1 && property_exists($user1, 'address') ? $user1->address : '123 Đường ABC, Quận 1, TPHCM',
                'payment_method' => 'COD',
                'notes' => 'Giao hàng cẩn thận',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => 2,
                'total_amount' => 39.98,
                'shipping_fee' => 9.99,
                'is_paid' => true,
                'status' => 'completed',
                'discount_amount' => 5.00,
                'customer_name' => $user2 ? $user2->name : 'Khách hàng 2',
                'customer_email' => $user2 ? $user2->email : 'user2@example.com',
                'customer_phone' => $user2 && property_exists($user2, 'phone') ? $user2->phone : '0903333444',
                'shipping_address' => $user2 && property_exists($user2, 'address') ? $user2->address : '456 Đường XYZ, Quận Ba Đình, Hà Nội',
                'payment_method' => 'VNPAY',
                'notes' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
