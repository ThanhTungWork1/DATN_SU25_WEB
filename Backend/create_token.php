<?php
require_once 'vendor/autoload.php';

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use App\Models\User;

try {
    // Tạo hoặc lấy user test
    $user = User::firstOrCreate(
        ['email' => 'test@example.com'],
        [
            'name' => 'Test User',
            'password' => bcrypt('password'),
            'email_verified_at' => now()
        ]
    );
    
    // Xóa token cũ
    $user->tokens()->delete();
    
    // Tạo token mới
    $token = $user->createToken('test-token')->plainTextToken;
    
    echo "✅ TOKEN CREATED SUCCESSFULLY:\n";
    echo "USER: {$user->email}\n";
    echo "TOKEN: {$token}\n";
    echo "\n🔥 COPY THIS TOKEN TO FRONTEND:\n";
    echo "localStorage.setItem('token', '{$token}');\n";
    
} catch (Exception $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
}
