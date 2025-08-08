# ZaloPay Integration Guide

## Tổng quan
Hệ thống đã tích hợp thanh toán ZaloPay với các tính năng:
- Tạo đơn hàng thanh toán ZaloPay
- Xử lý callback từ ZaloPay
- Kiểm tra trạng thái thanh toán
- Cập nhật database tự động

## Cấu hình Backend

### 1. Environment Variables
Thêm vào file `.env`:
```env
# ZaloPay Configuration
ZALOPAY_APP_ID=2553
ZALOPAY_KEY1=PcY4iZIKFCIdgZvA6ueMcMHHUbRLYjPL
ZALOPAY_KEY2=kLtgPl8HHhfvMuDHPwKfgfsY4Ydm9eIz
ZALOPAY_SANDBOX_URL=https://sb-openapi.zalopay.vn/v2/create

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### 2. API Endpoints
- `POST /api/payments/zalopay/create` - Tạo đơn hàng thanh toán
- `POST /api/payments/zalopay/callback` - Webhook từ ZaloPay
- `GET /api/payments/zalopay/status/{order_id}` - Kiểm tra trạng thái

### 3. Database Schema
Bảng `payments` cần có các cột:
- `order_id` - ID đơn hàng
- `method` - Phương thức thanh toán ('zalopay')
- `status` - Trạng thái ('pending', 'completed', 'failed')
- `amount` - Số tiền
- `transaction_id` - Mã giao dịch từ ZaloPay
- `bank_code` - Mã ngân hàng
- `paid_at` - Thời gian thanh toán

## Cấu hình Frontend

### 1. Environment Variables
Thêm vào file `.env`:
```env
REACT_APP_API_URL=http://localhost:8000
```

### 2. Components
- `ZaloPayButton` - Component nút thanh toán
- `ZaloPayPayment` - Trang thanh toán
- `ZaloPayTest` - Trang test

## Luồng hoạt động

### 1. Tạo đơn hàng thanh toán
```javascript
// Frontend gọi API
const response = await axios.post('/api/payments/zalopay/create', {
  order_id: 123
});

// Backend tạo payment record và gọi ZaloPay API
// Trả về pay_url để redirect user
```

### 2. User thanh toán
```
1. User click vào ZaloPayButton
2. Mở cửa sổ thanh toán ZaloPay
3. User đăng nhập và thanh toán
4. ZaloPay gửi callback về server
```

### 3. Xử lý callback
```php
// ZaloPay gửi POST request đến /api/payments/zalopay/callback
// Server verify signature và cập nhật database
// Cập nhật trạng thái order và payment
```

### 4. Kiểm tra trạng thái
```javascript
// Frontend polling để kiểm tra trạng thái
const status = await axios.get(`/api/payments/zalopay/status/${orderId}`);
```

## Test với ZaloPay Sandbox

### 1. Thông tin test
- App ID: 2553 (sandbox)
- Môi trường: https://sb-openapi.zalopay.vn
- Tài khoản test: Sử dụng app ZaloPay trên điện thoại

### 2. Cách test
1. Truy cập `/zalopay-test` để test
2. Chọn đơn hàng cần thanh toán
3. Click "Thanh toán ZaloPay"
4. Sử dụng app ZaloPay để scan QR hoặc nhập thông tin

### 3. Webhook callback
ZaloPay sẽ gửi callback đến:
```
POST http://your-domain.com/api/payments/zalopay/callback
```

## Xử lý lỗi

### 1. Lỗi thường gặp
- **Invalid signature**: Kiểm tra KEY1, KEY2
- **Order not found**: Đảm bảo order_id tồn tại
- **Payment timeout**: Đặt timeout phù hợp
- **Callback failed**: Kiểm tra URL callback

### 2. Debug
- Kiểm tra log trong `storage/logs/laravel.log`
- Sử dụng `Log::info()` để debug
- Test với Postman/Insomnia

## Bảo mật

### 1. Verify callback
```php
// Luôn verify signature từ ZaloPay
$mac = hash_hmac("sha256", $data['data'], $this->key2);
return $mac === $data['mac'];
```

### 2. Validate order
```php
// Kiểm tra order thuộc về user hiện tại
// Kiểm tra order chưa được thanh toán
// Kiểm tra amount khớp với database
```

## Production Setup

### 1. Đăng ký ZaloPay Production
- Liên hệ ZaloPay để có thông tin production
- Cập nhật APP_ID, KEY1, KEY2 production
- Thay đổi endpoint sang production

### 2. SSL Certificate
- Đảm bảo website có SSL
- Callback URL phải HTTPS
- Test webhook trên production

### 3. Monitoring
- Monitor callback success rate
- Set up alerts cho failed payments
- Log tất cả transactions

## Tài liệu tham khảo
- [ZaloPay Developer Documentation](https://docs.zalopay.vn/)
- [ZaloPay Sandbox](https://sbgateway.zalopay.vn/)
