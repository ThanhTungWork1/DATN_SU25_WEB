<?php

/**
 * 🚀 Auto Create .env file for StrideX
 * 
 * Script này sẽ tự động tạo file .env với cấu hình đầy đủ
 */

echo "🚀 Creating .env file for StrideX...\n\n";

// Cấu hình .env hoàn chỉnh
$envContent = 'APP_NAME="StrideX"
APP_ENV=local
APP_KEY=base64:' . base64_encode(random_bytes(32)) . '
APP_DEBUG=true
APP_TIMEZONE=UTC
APP_URL=http://localhost:8000

APP_LOCALE=en
APP_FALLBACK_LOCALE=en
APP_FAKER_LOCALE=en_US

APP_MAINTENANCE_DRIVER=file
APP_MAINTENANCE_STORE=database

BCRYPT_ROUNDS=12

LOG_CHANNEL=stack
LOG_STACK=single
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=debug

# DATABASE CONFIGURATION
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=datn_su25_web
DB_USERNAME=root
DB_PASSWORD=

# SESSION CONFIGURATION
SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_ENCRYPT=false
SESSION_PATH=/
SESSION_DOMAIN=null

BROADCAST_CONNECTION=log
FILESYSTEM_DISK=local
QUEUE_CONNECTION=database

CACHE_STORE=database
CACHE_PREFIX=

MEMCACHED_HOST=127.0.0.1

REDIS_CLIENT=phpredis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

# ===== EMAIL CONFIGURATION FOR STRIDEX =====
# Option 1: Gmail (Production) - Cần App Password
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=stridex.noreply@gmail.com
MAIL_PASSWORD=your-gmail-app-password-here
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=stridex.noreply@gmail.com
MAIL_FROM_NAME="StrideX Support Team"

# Option 2: Mailtrap (Development) - Uncomment để dùng
# MAIL_MAILER=smtp
# MAIL_HOST=sandbox.smtp.mailtrap.io
# MAIL_PORT=2525
# MAIL_USERNAME=your-mailtrap-username
# MAIL_PASSWORD=your-mailtrap-password
# MAIL_ENCRYPTION=tls
# MAIL_FROM_ADDRESS=noreply@stridex.com
# MAIL_FROM_NAME="StrideX Support Team"

# Option 3: Log Only (Testing) - Uncomment để test
# MAIL_MAILER=log
# MAIL_FROM_ADDRESS=noreply@stridex.com
# MAIL_FROM_NAME="StrideX Support Team"

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=
AWS_USE_PATH_STYLE_ENDPOINT=false

VITE_APP_NAME="${APP_NAME}"

# CORS & SANCTUM CONFIGURATION
SANCTUM_STATEFUL_DOMAINS=localhost:3000,localhost:3001,127.0.0.1:3000,localhost:5173
SESSION_DOMAIN=localhost
';

// Kiểm tra nếu .env đã tồn tại
if (file_exists('.env')) {
    echo "⚠️  File .env đã tồn tại!\n";
    echo "📋 Bạn có muốn backup và tạo mới? (y/n): ";
    $handle = fopen("php://stdin", "r");
    $line = fgets($handle);
    fclose($handle);
    
    if (trim($line) === 'y' || trim($line) === 'Y') {
        // Backup file cũ
        $backupName = '.env.backup.' . date('Y-m-d_H-i-s');
        copy('.env', $backupName);
        echo "✅ Đã backup .env cũ thành: $backupName\n";
    } else {
        echo "❌ Hủy tạo file .env mới\n";
        exit;
    }
}

// Tạo file .env
file_put_contents('.env', $envContent);

echo "✅ File .env đã được tạo thành công!\n\n";

echo "📋 Cấu hình email hiện tại:\n";
echo "- MAIL_MAILER: smtp (Gmail)\n";
echo "- MAIL_HOST: smtp.gmail.com\n";
echo "- MAIL_PORT: 587\n";
echo "- MAIL_ENCRYPTION: tls\n\n";

echo "🔧 Các bước tiếp theo:\n";
echo "1. ✏️  Sửa MAIL_USERNAME và MAIL_PASSWORD trong .env\n";
echo "2. 🔑 Tạo Gmail App Password (nếu dùng Gmail)\n";
echo "3. 🧪 Chạy: php test_email.php\n";
echo "4. 🚀 Test thực tế từ admin panel\n\n";

echo "💡 Tùy chọn khác:\n";
echo "- Dùng Mailtrap cho development (comment/uncomment trong .env)\n";
echo "- Dùng log mode để test (MAIL_MAILER=log)\n\n";

echo "🎯 Hoàn tất! File .env đã sẵn sàng.\n";

?>




