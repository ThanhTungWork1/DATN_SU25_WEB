# 📧 Hướng dẫn cấu hình Email cho StrideX

## 🎯 Mục tiêu
Khi admin phản hồi khách hàng trong "Quản lý liên hệ", email sẽ được gửi tự động đến khách hàng.

## 📝 Bước 1: Tạo file .env
Tạo file `.env` trong thư mục `Backend/` với nội dung sau:

```env
APP_NAME="StrideX"
APP_ENV=local
APP_KEY=base64:YourLaravelAppKeyHere
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

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=datn_su25_web
DB_USERNAME=root
DB_PASSWORD=

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
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=your-email@gmail.com
MAIL_FROM_NAME="StrideX Support Team"

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=
AWS_USE_PATH_STYLE_ENDPOINT=false

VITE_APP_NAME="${APP_NAME}"

# CORS Configuration
SANCTUM_STATEFUL_DOMAINS=localhost:3000,localhost:3001,127.0.0.1:3000
SESSION_DOMAIN=localhost
```

## 🔑 Bước 2: Cấu hình Gmail App Password

### 2.1 Bật 2-Factor Authentication
1. Vào Google Account Settings
2. Security → 2-Step Verification → Bật

### 2.2 Tạo App Password
1. Security → App passwords
2. Chọn "Mail" và "Other (custom name)"
3. Nhập "StrideX Laravel App"
4. Copy mật khẩu 16 ký tự (dạng: abcd efgh ijkl mnop)

### 2.3 Cập nhật .env
Thay thế trong file `.env`:
```env
MAIL_USERNAME=your-gmail@gmail.com
MAIL_PASSWORD=abcd efgh ijkl mnop
MAIL_FROM_ADDRESS=your-gmail@gmail.com
```

## 📋 Bước 3: Generate Laravel App Key
```bash
cd DATN_SU25_WEB/Backend
php artisan key:generate
```

## 🧪 Bước 4: Test Email
Tạo file test tạm thời `test_email.php`:

```php
<?php
require_once 'vendor/autoload.php';

use Illuminate\Support\Facades\Mail;
use App\Mail\SendReplyMail;

// Test gửi email
$testContact = (object) [
    'name' => 'Test User',
    'email' => 'recipient@gmail.com'
];

$testMessage = 'Đây là email test từ StrideX!';

try {
    Mail::to($testContact->email)->send(new SendReplyMail($testContact, $testMessage));
    echo "✅ Email sent successfully!";
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage();
}
?>
```

## 🎯 Bước 5: Test thực tế
1. Khách hàng gửi liên hệ từ website
2. Admin vào "Quản lý liên hệ"
3. Click "Phản hồi" → Nhập nội dung → "Gửi phản hồi"
4. Kiểm tra email khách hàng

## 🔧 Troubleshooting

### Lỗi "Connection refused"
```env
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_ENCRYPTION=tls
```

### Lỗi "Authentication failed"
- Kiểm tra lại Gmail App Password
- Đảm bảo 2FA đã bật
- Thử tạo App Password mới

### Lỗi "Could not authenticate"
```env
MAIL_MAILER=log  # Tạm thời để test
```

### Email vào Spam
- Thêm DKIM/SPF records
- Sử dụng domain email chính thức
- Nội dung email không spam

## 📱 Các tùy chọn Email Provider khác

### Mailtrap (Development)
```env
MAIL_MAILER=smtp
MAIL_HOST=sandbox.smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your-mailtrap-username
MAIL_PASSWORD=your-mailtrap-password
MAIL_ENCRYPTION=tls
```

### SendGrid
```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USERNAME=apikey
MAIL_PASSWORD=your-sendgrid-api-key
MAIL_ENCRYPTION=tls
```

### Mailgun
```env
MAIL_MAILER=mailgun
MAILGUN_DOMAIN=your-domain.com
MAILGUN_SECRET=your-mailgun-secret
```

## ✅ Kết quả mong đợi
- Admin phản hồi → Email gửi tự động
- Khách hàng nhận email với template đẹp
- Trạng thái "Đã phản hồi" được cập nhật
- Log email trong Laravel log files
