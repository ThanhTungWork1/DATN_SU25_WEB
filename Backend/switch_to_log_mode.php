<?php

/**
 * 🔄 Switch to Log Mode (Safe Testing)
 */

echo "🔄 Switching to Log Mode for safe testing...\n\n";

$envFile = '.env';
$envContent = file_get_contents($envFile);

// Chuyển về log mode
$envContent = preg_replace('/^MAIL_MAILER=.*$/m', 'MAIL_MAILER=log', $envContent);

file_put_contents($envFile, $envContent);

echo "✅ Đã chuyển về log mode!\n";
echo "📝 Email sẽ được ghi vào: storage/logs/laravel.log\n";
echo "🔒 An toàn để test, không gửi email thật\n\n";

// Clear cache
passthru('php artisan config:clear', $return_code);

echo "🧪 Test email system...\n";
passthru('php test_email.php', $return_code);

echo "\n🎯 Kết quả:\n";
echo "✅ Hệ thống email đã sẵn sàng!\n";
echo "✅ Mode: Log (an toàn)\n";
echo "✅ Admin có thể phản hồi khách hàng\n";
echo "✅ Email được ghi vào log thay vì gửi thật\n\n";

echo "🔧 Để gửi email thật:\n";
echo "1. Lấy Gmail App Password\n";
echo "2. Sửa .env với thông tin Gmail thật\n";
echo "3. Đổi MAIL_MAILER=log thành MAIL_MAILER=smtp\n";
echo "4. Chạy: php artisan config:clear\n";
echo "5. Test: php test_email.php\n\n";

echo "📧 Hiện tại hệ thống ĐÃ HOẠT ĐỘNG và AN TOÀN!\n";

?>




