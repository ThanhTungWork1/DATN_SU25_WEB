<?php

/**
 * 🔧 Fix Email to Log Mode
 */

echo "🔧 Fixing email configuration to log mode...\n\n";

$envFile = '.env';
$envContent = file_get_contents($envFile);

// Đảm bảo MAIL_MAILER=log
$envContent = preg_replace('/^MAIL_MAILER=.*$/m', 'MAIL_MAILER=log', $envContent);

// Thêm/sửa MAIL_FROM_ADDRESS và MAIL_FROM_NAME
if (!preg_match('/^MAIL_FROM_ADDRESS=/m', $envContent)) {
    $envContent .= "\nMAIL_FROM_ADDRESS=noreply@stridex.com\n";
} else {
    $envContent = preg_replace('/^MAIL_FROM_ADDRESS=.*$/m', 'MAIL_FROM_ADDRESS=noreply@stridex.com', $envContent);
}

if (!preg_match('/^MAIL_FROM_NAME=/m', $envContent)) {
    $envContent .= "MAIL_FROM_NAME=\"StrideX Support Team\"\n";
} else {
    $envContent = preg_replace('/^MAIL_FROM_NAME=.*$/m', 'MAIL_FROM_NAME="StrideX Support Team"', $envContent);
}

// Ghi lại file
file_put_contents($envFile, $envContent);

echo "✅ Email config đã được fix!\n";
echo "📋 Đã set: MAIL_MAILER=log\n";
echo "📧 From: noreply@stridex.com\n";
echo "👥 Name: StrideX Support Team\n\n";

// Kiểm tra
echo "🔍 Kiểm tra config hiện tại:\n";
echo "- MAIL_MAILER: " . getenv('MAIL_MAILER') . " -> Đang reload...\n";

// Clear config cache
passthru('php artisan config:clear 2>&1', $return_code);

echo "\n🎯 Sẵn sàng test!\n";

?>
