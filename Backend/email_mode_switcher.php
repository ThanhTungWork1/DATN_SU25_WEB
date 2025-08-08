<?php

/**
 * 🔄 Email Mode Switcher for StrideX
 * 
 * Dễ dàng chuyển đổi giữa log mode và Gmail mode
 */

echo "🔄 StrideX Email Mode Switcher\n";
echo "=============================\n\n";

$envFile = '.env';
$envContent = file_get_contents($envFile);

// Kiểm tra mode hiện tại
if (preg_match('/^MAIL_MAILER=(.*)$/m', $envContent, $matches)) {
    $currentMode = trim($matches[1]);
    echo "📧 Mode hiện tại: $currentMode\n\n";
} else {
    $currentMode = 'unknown';
    echo "❓ Không xác định được mode hiện tại\n\n";
}

echo "📋 Chọn mode:\n";
echo "1. Log Mode (An toàn, ghi vào file log)\n";
echo "2. Gmail Mode (Gửi email thật)\n";
echo "3. Xem config hiện tại\n";
echo "4. Test email\n\n";

echo "Nhập lựa chọn (1-4): ";
$handle = fopen("php://stdin", "r");
$choice = trim(fgets($handle));
fclose($handle);

switch ($choice) {
    case '1':
        // Switch to log mode
        $envContent = preg_replace('/^MAIL_MAILER=.*$/m', 'MAIL_MAILER=log', $envContent);
        file_put_contents($envFile, $envContent);
        
        echo "\n✅ Đã chuyển sang Log Mode!\n";
        echo "📝 Email sẽ ghi vào: storage/logs/laravel.log\n";
        echo "🔒 An toàn để test\n";
        break;
        
    case '2':
        // Switch to Gmail mode
        $envContent = preg_replace('/^MAIL_MAILER=.*$/m', 'MAIL_MAILER=smtp', $envContent);
        file_put_contents($envFile, $envContent);
        
        echo "\n✅ Đã chuyển sang Gmail Mode!\n";
        echo "📧 Email sẽ gửi thật qua Gmail\n";
        echo "⚠️  Đảm bảo đã cấu hình Gmail App Password\n";
        break;
        
    case '3':
        // Show current config
        echo "\n📋 Config email hiện tại:\n";
        echo "========================\n";
        $emailVars = ['MAIL_MAILER', 'MAIL_HOST', 'MAIL_PORT', 'MAIL_USERNAME', 'MAIL_FROM_ADDRESS'];
        
        foreach ($emailVars as $var) {
            if (preg_match('/^' . preg_quote($var) . '=(.*)$/m', $envContent, $matches)) {
                $value = trim($matches[1]);
                if ($var === 'MAIL_USERNAME' && !empty($value)) {
                    echo "- $var: $value\n";
                } else if ($var === 'MAIL_PASSWORD') {
                    echo "- $var: ***hidden***\n";
                } else {
                    echo "- $var: $value\n";
                }
            } else {
                echo "- $var: (chưa set)\n";
            }
        }
        break;
        
    case '4':
        // Test email
        echo "\n🧪 Testing email...\n";
        passthru('php artisan config:clear');
        passthru('php test_email.php');
        break;
        
    default:
        echo "\n❌ Lựa chọn không hợp lệ!\n";
        exit(1);
}

if (in_array($choice, ['1', '2'])) {
    echo "\n🧹 Clear config cache...\n";
    passthru('php artisan config:clear');
    
    echo "\n🎯 Thành công!\n";
    echo "✅ Mode đã được thay đổi\n";
    echo "✅ Config cache đã clear\n";
    echo "📧 Sẵn sàng sử dụng!\n\n";
    
    echo "🧪 Test ngay bây giờ? (y/n): ";
    $handle = fopen("php://stdin", "r");
    $testNow = trim(fgets($handle));
    fclose($handle);
    
    if (strtolower($testNow) === 'y') {
        echo "\n🧪 Running test...\n";
        passthru('php test_email.php');
    }
}

echo "\n🏁 Hoàn tất!\n";

?>
