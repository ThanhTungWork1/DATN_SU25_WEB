<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class VoucherSeeder extends Seeder
{
    public function run(): void
    {
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
        ]);
    }
}
