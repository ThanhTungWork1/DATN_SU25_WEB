@echo off
echo ========================================
echo    STRIDEX EMAIL QUICK SETUP
echo ========================================
echo.

echo 🚀 Chạy các lệnh cần thiết để setup email...
echo.

REM Kiểm tra file .env
echo 📋 Bước 1: Kiểm tra file .env...
if not exist ".env" (
    echo ❌ File .env chưa tồn tại!
    echo 📝 Vui lòng tạo file .env theo hướng dẫn trong EMAIL_CONFIG_GUIDE.md
    echo.
    pause
    exit /b 1
) else (
    echo ✅ File .env đã tồn tại
)
echo.

REM Generate app key nếu chưa có
echo 🔑 Bước 2: Generate Laravel App Key...
php artisan key:generate --force
echo.

REM Clear cache
echo 🧹 Bước 3: Clear cache...
php artisan config:clear
php artisan cache:clear
echo.

REM Test email
echo 🧪 Bước 4: Test email...
echo ⚠️  Nhớ sửa email trong test_email.php trước khi chạy!
echo 📧 Nhấn Enter để chạy test email...
pause
php test_email.php
echo.

echo ========================================
echo ✅ Setup hoàn tất!
echo ========================================
echo.
echo 📋 Những gì đã làm:
echo - ✅ Tạo/kiểm tra file .env
echo - ✅ Generate Laravel app key
echo - ✅ Clear cache config
echo - ✅ Test gửi email
echo.
echo 🎯 Bước tiếp theo:
echo 1. Kiểm tra email test đã nhận được chưa
echo 2. Vào Admin Panel - Quản lý liên hệ
echo 3. Test phản hồi khách hàng thực tế
echo.
pause




