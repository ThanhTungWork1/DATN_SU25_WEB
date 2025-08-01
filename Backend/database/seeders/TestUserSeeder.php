<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class TestUserSeeder extends Seeder
{
    public function run()
    {
        User::create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => Hash::make('password'),
            'phone' => '0123456789',
            'role' => 'user'
        ]);
        
        echo "Test user created successfully!\n";
        echo "Email: test@example.com\n";
        echo "Password: password\n";
    }
} 