<?php

/**
 * 🔧 Fix Database Configuration
 */

echo "🔧 Fixing database configuration...\n\n";

$envFile = '.env';
$envContent = file_get_contents($envFile);

echo "📋 Các tùy chọn database phổ biến:\n";
echo "1. MySQL không có password (XAMPP mặc định)\n";
echo "2. MySQL có password\n";
echo "3. Sử dụng database khác\n\n";

echo "🔍 Kiểm tra MySQL hiện tại...\n";

// Thử connect để test
try {
    $pdo = new PDO('mysql:host=127.0.0.1;port=3306', 'root', '');
    echo "✅ MySQL root không có password - OK!\n";
    $needPassword = false;
} catch (Exception $e) {
    echo "❌ MySQL root không connect được: " . $e->getMessage() . "\n";
    echo "💡 Có thể cần password hoặc MySQL chưa chạy\n";
    $needPassword = true;
}

// Cập nhật config database
if (!$needPassword) {
    // MySQL không password
    $envContent = preg_replace('/^DB_PASSWORD=.*$/m', 'DB_PASSWORD=', $envContent);
    echo "🔧 Đã set DB_PASSWORD= (trống)\n";
} else {
    // Thử một số password phổ biến
    $commonPasswords = ['', 'root', '123456', 'password'];
    $connected = false;
    
    foreach ($commonPasswords as $pass) {
        try {
            $pdo = new PDO('mysql:host=127.0.0.1;port=3306', 'root', $pass);
            echo "✅ Kết nối thành công với password: " . ($pass ?: '(trống)') . "\n";
            $envContent = preg_replace('/^DB_PASSWORD=.*$/m', 'DB_PASSWORD=' . $pass, $envContent);
            $connected = true;
            break;
        } catch (Exception $e) {
            // Thử password tiếp theo
        }
    }
    
    if (!$connected) {
        echo "❌ Không thể kết nối với các password phổ biến\n";
        echo "📝 Vui lòng kiểm tra MySQL và nhập password đúng\n";
        echo "🔧 Hoặc chạy: mysql -u root -p để kiểm tra\n";
    }
}

// Kiểm tra database tồn tại
try {
    $pdo = new PDO('mysql:host=127.0.0.1;port=3306', 'root', '');
    $stmt = $pdo->query("SHOW DATABASES LIKE 'datn_su25_web'");
    if ($stmt->rowCount() > 0) {
        echo "✅ Database 'datn_su25_web' đã tồn tại\n";
    } else {
        echo "⚠️  Database 'datn_su25_web' chưa tồn tại\n";
        echo "📝 Tạo database: CREATE DATABASE datn_su25_web;\n";
    }
} catch (Exception $e) {
    echo "❌ Không thể kiểm tra database: " . $e->getMessage() . "\n";
}

// Ghi lại file .env
file_put_contents($envFile, $envContent);

echo "\n✅ Database config đã được cập nhật!\n";
echo "🎯 Bước tiếp theo: test kết nối Laravel\n";

?>




