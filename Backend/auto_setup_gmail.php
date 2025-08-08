<?php

/**
 * 🚀 Auto Setup Gmail for StrideX (No Input Required)
 * 
 * Script này sẽ setup Gmail với thông tin mẫu, sau đó bạn chỉ cần sửa trong .env
 */

echo "🚀 Auto Setup Gmail for StrideX\n";
echo "===============================\n\n";

$envFile = '.env';

// Cấu hình Gmail mẫu (bạn sẽ sửa sau)
$gmailConfig = [
    'MAIL_MAILER' => 'smtp',
    'MAIL_HOST' => 'smtp.gmail.com',
    'MAIL_PORT' => '587',
    'MAIL_USERNAME' => 'stridex.support@gmail.com',
    'MAIL_PASSWORD' => 'your-gmail-app-password-here',
    'MAIL_ENCRYPTION' => 'tls',
    'MAIL_FROM_ADDRESS' => 'stridex.support@gmail.com',
    'MAIL_FROM_NAME' => '"StrideX Support Team"'
];

echo "📧 Đang setup Gmail config với thông tin mẫu...\n";

// Đọc file .env
$envContent = file_get_contents($envFile);

// Cập nhật từng config
foreach ($gmailConfig as $key => $value) {
    if (preg_match('/^' . preg_quote($key) . '=/m', $envContent)) {
        // Update existing
        $envContent = preg_replace('/^' . preg_quote($key) . '=.*$/m', $key . '=' . $value, $envContent);
        echo "✅ Updated: $key\n";
    } else {
        // Add new
        $envContent .= "\n$key=$value";
        echo "➕ Added: $key\n";
    }
}

// Ghi lại file
file_put_contents($envFile, $envContent);

echo "\n✅ Gmail config đã được setup!\n\n";

echo "📋 Config hiện tại:\n";
foreach ($gmailConfig as $key => $value) {
    $displayValue = ($key === 'MAIL_PASSWORD') ? '***hidden***' : $value;
    echo "- $key: $displayValue\n";
}

echo "\n🔧 Clear config cache...\n";
passthru('php artisan config:clear', $return_code);

echo "\n📝 QUAN TRỌNG: Bạn cần sửa thông tin Gmail trong .env:\n";
echo "================================\n";
echo "1. Mở file .env\n";
echo "2. Tìm dòng: MAIL_USERNAME=stridex.support@gmail.com\n";
echo "   → Đổi thành Gmail thật của bạn\n\n";
echo "3. Tìm dòng: MAIL_PASSWORD=your-gmail-app-password-here\n";
echo "   → Đổi thành App Password Gmail 16 ký tự\n\n";
echo "4. Tìm dòng: MAIL_FROM_ADDRESS=stridex.support@gmail.com\n";
echo "   → Đổi thành Gmail thật của bạn\n\n";

echo "🔑 Cách tạo Gmail App Password:\n";
echo "==============================\n";
echo "1. Vào: https://myaccount.google.com/\n";
echo "2. Security → 2-Step Verification (bật nếu chưa có)\n";
echo "3. Security → App passwords\n";
echo "4. Select app: Mail\n";
echo "5. Select device: Other (custom name)\n";
echo "6. Nhập: StrideX Laravel App\n";
echo "7. Copy password 16 ký tự\n";
echo "8. Paste vào .env\n\n";

echo "🧪 Sau khi sửa .env, test bằng:\n";
echo "php artisan config:clear\n";
echo "php test_email.php\n\n";

echo "🎯 Hoặc dùng log mode an toàn:\n";
echo "Trong .env, đổi MAIL_MAILER=smtp thành MAIL_MAILER=log\n\n";

echo "✅ Setup cơ bản hoàn tất!\n";

?>
