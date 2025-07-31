<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class AddCustomerFieldsToOrdersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Thêm cột customer_name nếu chưa tồn tại
        if (!Schema::hasColumn('orders', 'customer_name')) {
            DB::statement('ALTER TABLE orders ADD COLUMN customer_name VARCHAR(255) NULL AFTER status');
            echo "Added customer_name column\n";
        }
        
        // Thêm cột customer_email nếu chưa tồn tại
        if (!Schema::hasColumn('orders', 'customer_email')) {
            DB::statement('ALTER TABLE orders ADD COLUMN customer_email VARCHAR(255) NULL AFTER customer_name');
            echo "Added customer_email column\n";
        }
        
        // Thêm cột customer_phone nếu chưa tồn tại
        if (!Schema::hasColumn('orders', 'customer_phone')) {
            DB::statement('ALTER TABLE orders ADD COLUMN customer_phone VARCHAR(255) NULL AFTER customer_email');
            echo "Added customer_phone column\n";
        }
        
        // Cập nhật dữ liệu cho các orders hiện có
        DB::table('orders')->whereNull('customer_name')->update([
            'customer_name' => 'Khách hàng mặc định',
            'customer_email' => 'customer@example.com',
            'customer_phone' => '0123456789'
        ]);
        
        echo "Updated existing orders with customer data\n";
    }
}
