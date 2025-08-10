# 📧 Hướng dẫn setup Gmail để gửi email thật cho StrideX

## 🎯 Mục tiêu
Cho phép admin phản hồi khách hàng và email sẽ được gửi thật đến hộp thư của khách hàng.

## 📋 Các bước thực hiện

### Bước 1: Chuẩn bị Gmail Account
1. **Sử dụng Gmail riêng** cho StrideX (khuyến khích)
   - Ví dụ: `stridex.support@gmail.com`
   - Hoặc dùng Gmail cá nhân

### Bước 2: Bật 2-Factor Authentication
1. Vào [Google Account](https://myaccount.google.com/)
2. Chọn **"Security"** (Bảo mật)
3. Tìm **"2-Step Verification"** → Click **"Get started"**
4. Làm theo hướng dẫn (SMS hoặc Google Authenticator)
5. **Bắt buộc phải bật 2FA** để tạo App Password

### Bước 3: Tạo App Password
1. Vào [Google Account](https://myaccount.google.com/)
2. **Security** → **App passwords**
3. Select app: **"Mail"**
4. Select device: **"Other (custom name)"**
5. Nhập tên: **"StrideX Laravel App"**
6. Click **"Generate"**
7. **Copy password 16 ký tự** (dạng: `abcd efgh ijkl mnop`)

### Bước 4: Cập nhật .env
Sửa file `.env` trong thư mục `Backend/`:

```env
# Đổi từ log mode sang Gmail
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-gmail@gmail.com
MAIL_PASSWORD=abcd efgh ijkl mnop
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=your-gmail@gmail.com
MAIL_FROM_NAME="StrideX Support Team"
```

**Thay thế:**
- `your-gmail@gmail.com` → Email Gmail thật của bạn
- `abcd efgh ijkl mnop` → App Password 16 ký tự

### Bước 5: Test Email
```bash
cd Backend
php artisan config:clear
php test_email.php
```

## 🔧 Script tự động setup

Tôi đã tạo script để bạn setup nhanh:

```bash
cd Backend
php setup_gmail_real.php
```

## ⚠️ Lưu ý quan trọng

### Security:
- **Không share** App Password với ai
- **Không commit** .env lên Git
- **Sử dụng email riêng** cho business

### Gmail Limits:
- **500 emails/day** (free Gmail)
- **2000 emails/day** (Gmail Workspace)
- Nếu vượt limit → email bị defer

### Alternative Options:
1. **Mailtrap** (Development)
2. **SendGrid** (Production)
3. **AWS SES** (Production)
4. **Mailgun** (Production)

## 🎯 Kết quả mong đợi

Sau khi setup:
1. Admin phản hồi khách hàng
2. Email gửi **tự động** đến hộp thư khách hàng
3. Khách hàng nhận email với **template đẹp**
4. Trạng thái **"Đã phản hồi"** được cập nhật

## 🆘 Troubleshooting

### "Authentication failed"
- Kiểm tra App Password đã đúng chưa
- Đảm bảo 2FA đã bật
- Thử tạo App Password mới

### "Connection refused"
- Kiểm tra internet connection
- Thử port 465 với SSL thay vì 587 với TLS

### Email vào Spam
- Thêm StrideX vào whitelist
- Sử dụng domain email chính thức
- Cải thiện email content

## 📞 Contact Support
Nếu gặp khó khăn, liên hệ:
- Email: support@stridex.com
- Hoặc tạo issue trên GitHub


