# Tích hợp VNPay vào Laravel Backend

## 🚀 Tính năng đã thêm

### 1. **VNPayService** (`app/Services/VNPayService.php`)
- Tạo URL thanh toán VNPay
- Xác thực callback từ VNPay
- Xử lý kết quả thanh toán

### 2. **VNPayController** (`app/Http/Controllers/Api/VNPayController.php`)
- `POST /api/payments/vnpay/create` - Tạo URL thanh toán
- `GET /api/payments/vnpay/callback` - Xử lý callback
- `POST /api/payments/vnpay/ipn` - Xử lý IPN

### 3. **Config** (`config/vnpay.php`)
- Cấu hình VNPay settings
- Hỗ trợ môi trường sandbox và production

## 📋 Cấu hình

### 1. Thêm vào file `.env`:
```env
# VNPay Configuration
VNPAY_TMN_CODE=DEMO000
VNPAY_HASH_SECRET=QNGJWMSFHT
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=http://localhost:8000/api/payments/vnpay/callback
VNPAY_IPN_URL=http://localhost:8000/api/payments/vnpay/ipn
VNPAY_ENVIRONMENT=sandbox
```

### 2. Cấu hình Production:
```env
VNPAY_TMN_CODE=YOUR_TMN_CODE
VNPAY_HASH_SECRET=YOUR_HASH_SECRET
VNPAY_URL=https://pay.vnpay.vn/vpcpay.html
VNPAY_RETURN_URL=https://yourdomain.com/api/payments/vnpay/callback
VNPAY_IPN_URL=https://yourdomain.com/api/payments/vnpay/ipn
VNPAY_ENVIRONMENT=production
```

## 🔧 Cách sử dụng

### 1. Tạo thanh toán VNPay:
```bash
POST /api/payments/vnpay/create
Content-Type: application/json
Authorization: Bearer {token}

{
    "order_id": 1,
    "amount": 100000
}
```

**Response:**
```json
{
    "payment_url": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?...",
    "order_id": 1,
    "amount": 100000
}
```

### 2. Redirect user đến VNPay:
```javascript
// Frontend
const response = await fetch('/api/payments/vnpay/create', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
        order_id: orderId,
        amount: amount
    })
});

const data = await response.json();
window.location.href = data.payment_url;
```

### 3. Xử lý callback:
- VNPay sẽ redirect user về `VNPAY_RETURN_URL`
- Hệ thống tự động cập nhật trạng thái thanh toán
- Payment status: `pending` → `completed`
- Order status: `is_paid = true`

## 📊 Database Schema

### Bảng `payments`:
```sql
- id (primary key)
- order_id (foreign key)
- method (VNPay, Credit Card, etc.)
- status (pending, completed, failed)
- amount (decimal)
- paid_at (datetime)
- created_at, updated_at
```

### Bảng `orders`:
```sql
- id (primary key)
- user_id (foreign key)
- total_amount (decimal)
- shipping_fee (decimal)
- is_paid (boolean)
- status (string)
- created_at, updated_at
```

## 🔒 Bảo mật

1. **Xác thực callback**: Sử dụng HMAC-SHA512 để verify callback
2. **Logging**: Tất cả giao dịch được log để audit
3. **Validation**: Kiểm tra dữ liệu đầu vào
4. **Error handling**: Xử lý lỗi và rollback khi cần

## 🧪 Testing

### Sandbox Environment:
- TMN Code: `DEMO000`
- Hash Secret: `QNGJWMSFHT`
- Test cards: VNPay cung cấp thẻ test

### Test Flow:
1. Tạo order
2. Gọi API tạo payment URL
3. Redirect đến VNPay sandbox
4. Thanh toán với thẻ test
5. Kiểm tra callback và cập nhật DB

## 📝 Logs

Hệ thống log các sự kiện:
- Payment creation
- Callback verification
- Payment success/failure
- IPN processing
- Error handling

## 🚨 Lưu ý quan trọng

1. **Production**: Thay đổi URL và credentials
2. **SSL**: Bắt buộc sử dụng HTTPS cho production
3. **IPN**: Cấu hình IPN URL trong VNPay merchant portal
4. **Testing**: Luôn test kỹ trước khi deploy production
5. **Monitoring**: Theo dõi logs và transaction status

## 🔗 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payments/vnpay/create` | Tạo URL thanh toán |
| GET | `/api/payments/vnpay/callback` | Xử lý callback |
| POST | `/api/payments/vnpay/ipn` | Xử lý IPN |

## 📞 Support

Nếu có vấn đề, kiểm tra:
1. Logs trong `storage/logs/laravel.log`
2. VNPay merchant portal
3. Network connectivity
4. SSL certificates (production) 
