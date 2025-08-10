<?php

/**
 * 🧪 Test Email Functionality for StrideX
 * 
 * Chạy file này để test xem email có gửi được không
 * 
 * Cách sử dụng:
 * 1. Cấu hình .env với thông tin email
 * 2. Chạy: php test_email.php
 */

require_once 'vendor/autoload.php';

// Load Laravel application
$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\Mail;
use App\Mail\SendReplyMail;

echo "🧪 Testing StrideX Email System...\n\n";

// Tạo dữ liệu test
$testContact = (object) [
    'name' => 'Nguyễn Văn Test',
    'email' => 'customer@stridex.com',
];

$testMessage = "Xin chào! Đây là email test từ hệ thống StrideX.\n\nChúng tôi đang kiểm tra chức năng gửi email phản hồi khách hàng.\n\nHệ thống email đã hoạt động tốt!\n\nCảm ơn bạn đã liên hệ! 🎉";

echo "📧 Testing email system...\n";
echo "👤 Tên người nhận: {$testContact->name}\n";
echo "📮 Email: {$testContact->email}\n";
echo "💬 Nội dung: " . substr($testMessage, 0, 50) . "...\n";
echo "🎯 Mode: " . env('MAIL_MAILER', 'unknown') . "\n\n";

try {
    // Gửi email test
    Mail::to($testContact->email)->send(new SendReplyMail($testContact, $testMessage));
    
    if (env('MAIL_MAILER') === 'log') {
        echo "✅ SUCCESS: Email đã được ghi vào log!\n";
        echo "📝 Kiểm tra file: storage/logs/laravel.log\n";
        echo "🔍 Tìm email content trong log file\n";
        echo "💡 Đây là chế độ test an toàn (không gửi email thật)\n\n";
        
        echo "🎯 Để gửi email thật:\n";
        echo "1. Sửa MAIL_MAILER=smtp trong .env\n";
        echo "2. Cấu hình Gmail hoặc Mailtrap\n";
        echo "3. Chạy lại test này\n\n";
    } else {
        echo "✅ SUCCESS: Email đã được gửi thành công!\n";
        echo "📬 Vui lòng kiểm tra hộp thư của {$testContact->email}\n";
        echo "📝 Kiểm tra cả thư mục Spam nếu không thấy email\n\n";
        
        echo "🎯 Bước tiếp theo:\n";
        echo "1. Kiểm tra email đã nhận được chưa\n";
        echo "2. Nếu có, email template có hiển thị đẹp không\n";
        echo "3. Test thực tế từ admin panel\n\n";
    }
    
} catch (\Exception $e) {
    echo "❌ ERROR: Không thể gửi email!\n";
    echo "🔍 Chi tiết lỗi: " . $e->getMessage() . "\n\n";
    
    echo "🛠️ Các bước khắc phục:\n";
    echo "1. Kiểm tra file .env có đúng cấu hình email không\n";
    echo "2. Kiểm tra MAIL_USERNAME và MAIL_PASSWORD\n";
    echo "3. Đảm bảo Gmail App Password đã được tạo\n";
    echo "4. Thử dùng MAIL_MAILER=log để test không gửi thật\n\n";
    
    echo "📋 Debug info:\n";
    echo "- MAIL_MAILER: " . env('MAIL_MAILER', 'không có') . "\n";
    echo "- MAIL_HOST: " . env('MAIL_HOST', 'không có') . "\n";
    echo "- MAIL_PORT: " . env('MAIL_PORT', 'không có') . "\n";
    echo "- MAIL_USERNAME: " . (env('MAIL_USERNAME') ? 'đã có' : 'chưa có') . "\n";
    echo "- MAIL_ENCRYPTION: " . env('MAIL_ENCRYPTION', 'không có') . "\n";
}

echo "\n🏁 Test completed!\n";
?>
