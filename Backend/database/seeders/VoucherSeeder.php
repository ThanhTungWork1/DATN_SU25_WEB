<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Voucher;

class VoucherSeeder extends Seeder
{
    public function run()
    {
<<<<<<< HEAD
        // Thêm voucher test
        Voucher::create([
            'title' => 'Giảm giá 10%',
            'code' => 'SAVE10',
            'value' => 10.00, // 10%
            'max_value' => 50000.00, // Tối đa 50,000 VND
            'quantity' => 100,
            'description' => 'Giảm giá 10% cho đơn hàng từ 100,000 VND',
            'start_date' => '2025-01-01',
            'end_date' => '2025-12-31',
            'status' => true
=======
        DB::table('vouchers')->insert([
            [
                'title' => 'Summer Sale 20%',
                'code' => 'SUMMER20',
                'value' => 20.00,
                'max_value' => 50.00,
                'min_order_amount' => 100000,
                'quantity' => 100,
                'usage_limit' => 1,
                'used_count' => 0,
                'user_type' => 'all',
                'discount_type' => 'percentage',
                'description' => 'Giảm 20% cho đơn hàng từ 100k',
                'start_date' => '2025-06-01',
                'end_date' => '2025-06-30',
                'status' => true,
                'product_categories' => json_encode([1, 2, 3]),
                'excluded_products' => json_encode([]),
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'title' => 'New Customer 50k',
                'code' => 'NEW50K',
                'value' => 50000,
                'max_value' => 50000,
                'min_order_amount' => 200000,
                'quantity' => 50,
                'usage_limit' => 1,
                'used_count' => 0,
                'user_type' => 'new',
                'discount_type' => 'fixed',
                'description' => 'Giảm 50k cho khách hàng mới, đơn hàng từ 200k',
                'start_date' => '2025-01-01',
                'end_date' => '2025-12-31',
                'status' => true,
                'product_categories' => json_encode([]),
                'excluded_products' => json_encode([]),
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'title' => 'VIP Customer 30%',
                'code' => 'VIP30',
                'value' => 30.00,
                'max_value' => 100000,
                'min_order_amount' => 500000,
                'quantity' => 20,
                'usage_limit' => 2,
                'used_count' => 0,
                'user_type' => 'existing',
                'discount_type' => 'percentage',
                'description' => 'Giảm 30% cho khách hàng VIP, đơn hàng từ 500k',
                'start_date' => '2025-01-01',
                'end_date' => '2025-12-31',
                'status' => true,
                'product_categories' => json_encode([]),
                'excluded_products' => json_encode([]),
                'created_at' => now(),
                'updated_at' => now()
            ]
>>>>>>> origin/sonph4441
        ]);

        Voucher::create([
            'title' => 'Giảm giá 20%',
            'code' => 'SAVE20',
            'value' => 20.00, // 20%
            'max_value' => 100000.00, // Tối đa 100,000 VND
            'quantity' => 50,
            'description' => 'Giảm giá 20% cho đơn hàng từ 200,000 VND',
            'start_date' => '2025-01-01',
            'end_date' => '2025-12-31',
            'status' => true
        ]);

        Voucher::create([
            'title' => 'Giảm giá cố định 30,000 VND',
            'code' => 'FIXED30K',
            'value' => 30000.00, // Giảm cố định 30,000 VND
            'max_value' => 30000.00,
            'quantity' => 200,
            'description' => 'Giảm giá cố định 30,000 VND cho đơn hàng từ 150,000 VND',
            'start_date' => '2025-01-01',
            'end_date' => '2025-12-31',
            'status' => true
        ]);

        Voucher::create([
            'title' => 'Giảm giá 15%',
            'code' => 'SUMMER15',
            'value' => 15.00, // 15%
            'max_value' => 75000.00, // Tối đa 75,000 VND
            'quantity' => 75,
            'description' => 'Giảm giá 15% cho đơn hàng từ 150,000 VND',
            'start_date' => '2025-01-01',
            'end_date' => '2025-12-31',
            'status' => true
        ]);

        echo "Vouchers created successfully!\n";
        echo "SAVE10 - Giảm 10% (tối đa 50,000 VND)\n";
        echo "SAVE20 - Giảm 20% (tối đa 100,000 VND)\n";
        echo "FIXED30K - Giảm cố định 30,000 VND\n";
    }
}
