<?php

/**
 * 🚀 Setup Gmail Real Email for StrideX
 * 
 * Script tương tác để setup Gmail gửi email thật
 */

echo "🚀 Setup Gmail Real Email for StrideX\n";
echo "=====================================\n\n";

$envFile = '.env';

// Kiểm tra .env
if (!file_exists($envFile)) {
    echo "❌ File .env không tồn tại!\n";
    exit(1);
}

echo "📧 Nhập thông tin Gmail của bạn:\n\n";

// Nhập Gmail
echo "1️⃣  Gmail address (ví dụ: stridex.support@gmail.com): ";
$handle = fopen("php://stdin", "r");
$gmail = trim(fgets($handle));

if (!filter_var($gmail, FILTER_VALIDATE_EMAIL)) {
    echo "❌ Email không hợp lệ!\n";
    exit(1);
}

// Nhập App Password
echo "\n2️⃣  Gmail App Password (16 ký tự, dạng: abcd efgh ijkl mnop): ";
$appPassword = trim(fgets($handle));

if (strlen(str_replace(' ', '', $appPassword)) !== 16) {
    echo "❌ App Password phải có 16 ký tự!\n";
    echo "💡 Hướng dẫn tạo App Password: https://support.google.com/accounts/answer/185833\n";
    exit(1);
}

// Nhập tên hiển thị
echo "\n3️⃣  Tên hiển thị (ví dụ: StrideX Support Team): ";
$fromName = trim(fgets($handle));
if (empty($fromName)) {
    $fromName = "StrideX Support Team";
}

fclose($handle);

echo "\n🔧 Đang cập nhật .env...\n";

// Đọc file .env
$envContent = file_get_contents($envFile);

// Cập nhật email config
$envContent = preg_replace('/^MAIL_MAILER=.*$/m', 'MAIL_MAILER=smtp', $envContent);
$envContent = preg_replace('/^MAIL_HOST=.*$/m', 'MAIL_HOST=smtp.gmail.com', $envContent);
$envContent = preg_replace('/^MAIL_PORT=.*$/m', 'MAIL_PORT=587', $envContent);
$envContent = preg_replace('/^MAIL_USERNAME=.*$/m', 'MAIL_USERNAME=' . $gmail, $envContent);
$envContent = preg_replace('/^MAIL_PASSWORD=.*$/m', 'MAIL_PASSWORD=' . $appPassword, $envContent);
$envContent = preg_replace('/^MAIL_ENCRYPTION=.*$/m', 'MAIL_ENCRYPTION=tls', $envContent);
$envContent = preg_replace('/^MAIL_FROM_ADDRESS=.*$/m', 'MAIL_FROM_ADDRESS=' . $gmail, $envContent);
$envContent = preg_replace('/^MAIL_FROM_NAME=.*$/m', 'MAIL_FROM_NAME="' . $fromName . '"', $envContent);

// Thêm config nếu chưa có
$configs = [
    'MAIL_HOST=smtp.gmail.com',
    'MAIL_PORT=587',
    'MAIL_USERNAME=' . $gmail,
    'MAIL_PASSWORD=' . $appPassword,
    'MAIL_ENCRYPTION=tls'
];

foreach ($configs as $config) {
    $key = explode('=', $config)[0];
    if (!preg_match('/^' . preg_quote($key) . '=/m', $envContent)) {
        $envContent .= "\n" . $config;
    }
}

// Ghi lại file
file_put_contents($envFile, $envContent);

echo "✅ .env đã được cập nhật!\n\n";

echo "📋 Cấu hình Gmail:\n";
echo "- Email: $gmail\n";
echo "- Host: smtp.gmail.com\n";
echo "- Port: 587\n";
echo "- Encryption: TLS\n";
echo "- From Name: $fromName\n\n";

echo "🧹 Clear config cache...\n";
passthru('php artisan config:clear', $return_code);

echo "\n🧪 Test gửi email...\n";
echo "📝 Nhập email nhận test (Enter để skip): ";
$handle = fopen("php://stdin", "r");
$testEmail = trim(fgets($handle));
fclose($handle);

if (!empty($testEmail) && filter_var($testEmail, FILTER_VALIDATE_EMAIL)) {
    echo "📧 Đang gửi email test đến $testEmail...\n";
    
    // Tạo test email đơn giản
    $testScript = '
    require_once "vendor/autoload.php";
    $app = require_once "bootstrap/app.php";
    $app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();
    
    use Illuminate\Support\Facades\Mail;
    use App\Mail\SendReplyMail;
    
    $contact = (object) ["name" => "Test User", "email" => "' . $testEmail . '"];
    $message = "Đây là email test từ StrideX! Nếu bạn nhận được email này, hệ thống đã hoạt động tốt! 🎉";
    
    try {
        Mail::to("' . $testEmail . '")->send(new SendReplyMail($contact, $message));
        echo "✅ Email test đã được gửi!\n";
        echo "📬 Kiểm tra hộp thư: ' . $testEmail . '\n";
    } catch (Exception $e) {
        echo "❌ Lỗi: " . $e->getMessage() . "\n";
    }
    ';
    
    file_put_contents('test_gmail_temp.php', '<?php ' . $testScript);
    passthru('php test_gmail_temp.php', $return_code);
    unlink('test_gmail_temp.php');
}

echo "\n🎯 Setup hoàn tất!\n";
echo "=====================================\n";
echo "🎉 Gmail real email đã được kích hoạt!\n\n";

echo "📋 Cách sử dụng:\n";
echo "1. Vào Admin Panel → Quản lý liên hệ\n";
echo "2. Click 'Phản hồi' cho khách hàng bất kỳ\n";
echo "3. Nhập nội dung phản hồi\n";
echo "4. Click 'Gửi phản hồi'\n";
echo "5. Email sẽ được gửi TỰ ĐỘNG đến khách hàng!\n\n";

echo "⚠️  Lưu ý:\n";
echo "- Gmail giới hạn 500 emails/ngày\n";
echo "- Không share App Password với ai\n";
echo "- Kiểm tra Spam folder nếu không thấy email\n\n";

echo "🆘 Nếu gặp lỗi:\n";
echo "- Kiểm tra 2FA đã bật chưa\n";
echo "- Thử tạo App Password mới\n";
echo "- Xem file: SETUP_GMAIL_REAL_EMAIL.md\n\n";

?>
