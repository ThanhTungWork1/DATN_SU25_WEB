<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UpdateOrdersWithUserDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Cập nhật orders với dữ liệu từ bảng users
        DB::statement("
            UPDATE orders o 
            JOIN users u ON o.user_id = u.id 
            SET 
            o.customer_name = u.name,
            o.customer_email = u.email,
            o.customer_phone = u.phone
            WHERE o.customer_name IS NULL OR o.customer_name = ''
        ");
        
        echo "Updated orders with real user data\n";
    }
}
