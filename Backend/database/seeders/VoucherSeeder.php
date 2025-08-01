<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Voucher;

class VoucherSeeder extends Seeder
{
    public function run()
    {
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