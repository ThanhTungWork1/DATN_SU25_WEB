<?php

/**
 * 🔧 Update Email Configuration for StrideX
 * 
 * Script này sẽ cập nhật cấu hình email trong .env
 */

echo "🔧 Updating email configuration...\n\n";

// Đọc file .env hiện tại
$envFile = '.env';
if (!file_exists($envFile)) {
    echo "❌ File .env không tồn tại!\n";
    echo "📝 Vui lòng chạy: php create_env.php trước\n";
    exit(1);
}

$envContent = file_get_contents($envFile);

// Cấu hình email mới (log mode để test)
$newEmailConfig = '# ===== EMAIL CONFIGURATION FOR STRIDEX =====
# HIỆN TẠI: Dùng log mode để test (không gửi email thật)
MAIL_MAILER=log
MAIL_FROM_ADDRESS=noreply@stridex.com
MAIL_FROM_NAME="StrideX Support Team"

# Option 1: Gmail (Production) - Uncomment khi có App Password
# MAIL_MAILER=smtp
# MAIL_HOST=smtp.gmail.com
# MAIL_PORT=587
# MAIL_USERNAME=your-email@gmail.com
# MAIL_PASSWORD=your-gmail-app-password
# MAIL_ENCRYPTION=tls
# MAIL_FROM_ADDRESS=your-email@gmail.com
# MAIL_FROM_NAME="StrideX Support Team"

# Option 2: Mailtrap (Development) - Uncomment để dùng
# MAIL_MAILER=smtp
# MAIL_HOST=sandbox.smtp.mailtrap.io
# MAIL_PORT=2525
# MAIL_USERNAME=your-mailtrap-username
# MAIL_PASSWORD=your-mailtrap-password
# MAIL_ENCRYPTION=tls
# MAIL_FROM_ADDRESS=noreply@stridex.com
# MAIL_FROM_NAME="StrideX Support Team"';

// Tìm và thay thế phần email configuration
$pattern = '/# ===== EMAIL CONFIGURATION FOR STRIDEX =====.*?(?=\n[A-Z_]+=[^\n]*\n|\nAWS_|$)/s';
$newContent = preg_replace($pattern, $newEmailConfig . "\n\n", $envContent);

// Ghi lại file .env
file_put_contents($envFile, $newContent);

echo "✅ Email configuration đã được cập nhật!\n\n";

echo "📋 Cấu hình mới:\n";
echo "- MAIL_MAILER: log (test mode)\n";
echo "- MAIL_FROM_ADDRESS: noreply@stridex.com\n";
echo "- MAIL_FROM_NAME: StrideX Support Team\n\n";

echo "🎯 Ở chế độ log, email sẽ được ghi vào:\n";
echo "- storage/logs/laravel.log\n";
echo "- Không gửi email thật\n";
echo "- An toàn để test\n\n";

echo "🔧 Để dùng Gmail thật:\n";
echo "1. Uncomment phần Gmail trong .env\n";
echo "2. Thay your-email@gmail.com\n";
echo "3. Thay your-gmail-app-password\n";
echo "4. Comment dòng MAIL_MAILER=log\n\n";

echo "🚀 Sẵn sàng test!\n";

?>
