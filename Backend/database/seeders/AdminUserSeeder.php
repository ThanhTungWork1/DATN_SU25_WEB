<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        // Xóa tài khoản admin cũ nếu có
        DB::table('users')->where('email', 'admin@stridex.com')->delete();
        
        // Thêm tài khoản admin mới
        DB::table('users')->insert([
            [
                'name' => 'Admin StrideX', 
                'email' => 'admin@stridex.com', 
                'password' => Hash::make('admin123'), 
                'phone' => '0123456789', 
                'address' => 'Hanoi, Vietnam', 
                'role' => 1, // 1 = admin
                'status' => true, 
                'is_verified' => true, 
                'created_at' => now(), 
                'updated_at' => now()
            ],
        ]);
        
        echo "✅ Tài khoản admin đã được tạo thành công!\n";
        echo "📧 Email: admin@stridex.com\n";
        echo "🔑 Password: admin123\n";
    }
} 