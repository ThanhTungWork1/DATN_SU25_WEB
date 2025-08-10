<?php

/**
 * 🔧 Add Email Config to Existing .env
 */

echo "🔧 Adding email config to existing .env...\n\n";

$envFile = '.env';
$envContent = file_get_contents($envFile);

// Kiểm tra nếu đã có email config
if (strpos($envContent, 'MAIL_MAILER') !== false) {
    echo "📧 Email config đã tồn tại, đang cập nhật...\n";
    // Cập nhật existing config
    $envContent = preg_replace('/^MAIL_MAILER=.*$/m', 'MAIL_MAILER=log', $envContent);
    
    if (strpos($envContent, 'MAIL_FROM_ADDRESS') === false) {
        $envContent .= "\nMAIL_FROM_ADDRESS=noreply@stridex.com\n";
    } else {
        $envContent = preg_replace('/^MAIL_FROM_ADDRESS=.*$/m', 'MAIL_FROM_ADDRESS=noreply@stridex.com', $envContent);
    }
    
    if (strpos($envContent, 'MAIL_FROM_NAME') === false) {
        $envContent .= 'MAIL_FROM_NAME="StrideX Support Team"' . "\n";
    } else {
        $envContent = preg_replace('/^MAIL_FROM_NAME=.*$/m', 'MAIL_FROM_NAME="StrideX Support Team"', $envContent);
    }
} else {
    echo "📧 Thêm email config mới...\n";
    // Thêm email config mới
    $emailConfig = '
# ===== EMAIL CONFIGURATION =====
MAIL_MAILER=log
MAIL_FROM_ADDRESS=noreply@stridex.com
MAIL_FROM_NAME="StrideX Support Team"

# Gmail config (uncomment khi cần gửi thật)
# MAIL_MAILER=smtp
# MAIL_HOST=smtp.gmail.com
# MAIL_PORT=587
# MAIL_USERNAME=your-email@gmail.com
# MAIL_PASSWORD=your-gmail-app-password
# MAIL_ENCRYPTION=tls
';
    
    $envContent .= $emailConfig;
}

// Ghi lại file
file_put_contents($envFile, $envContent);

echo "✅ Email config đã được thêm!\n";
echo "📧 MAIL_MAILER=log (test mode)\n";
echo "📝 Email sẽ ghi vào storage/logs/laravel.log\n\n";

// Clear cache
echo "🧹 Clear config cache...\n";
passthru('php artisan config:clear', $return_code);

echo "\n🎯 Sẵn sàng test login!\n";

?>




