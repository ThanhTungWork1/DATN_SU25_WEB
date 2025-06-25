<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('users')->insert([
            ['name' => 'John Doe', 'email' => 'john@example.com', 'password' => Hash::make('password123'), 'phone' => '1234567890', 'address' => '123 Main St', 'role' => '0', 'status' => true, 'is_verified' => true, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Jane Smith', 'email' => 'jane@example.com', 'password' => Hash::make('password123'), 'phone' => '0987654321', 'address' => '456 Oak St', 'role' => '1', 'status' => true, 'is_verified' => true, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}