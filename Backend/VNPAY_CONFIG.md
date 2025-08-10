# 🏦 **Hướng dẫn cấu hình VNPay**

## 📋 **Cấu hình file .env**

Thêm các biến môi trường sau vào file `.env`:

```env
# ========== VNPay Configuration ==========
VNPAY_TMN_CODE=your_tmn_code_here
VNPAY_HASH_SECRET=your_hash_secret_here
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=http://localhost:8000/api/payments/vnpay/callback
VNPAY_IPN_URL=http://localhost:8000/api/payments/vnpay/ipn
VNPAY_ENVIRONMENT=sandbox

# ========== Frontend URL ==========
FRONTEND_URL=http://localhost:3000
```

## 🔑 **Lấy thông tin từ VNPay**

### **1. TMN Code (Merchant ID)**

-   Đăng nhập vào [VNPay Merchant Portal](https://merchant.vnpayment.vn/)
-   Vào **Thông tin tài khoản** → **Thông tin kết nối**
-   Copy **TMN Code**

### **2. Hash Secret**

-   Trong cùng trang **Thông tin kết nối**
-   Copy **Hash Secret**

### **3. URLs**

-   **Sandbox**: `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html`
-   **Production**: `https://pay.vnpay.vn/vpcpay.html`

## 🧪 **Test VNPay**

### **Bước 1: Tạo thanh toán**

```bash
curl -X POST http://localhost:8000/api/payments/vnpay/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "order_id": 1
  }'

# Response sẽ có transaction_id duy nhất:
# {
#   "success": true,
#   "payment_url": "https://sandbox.vnpayment.vn/...",
#   "order_id": 1,
#   "transaction_id": "VNPAY_1733123456_1_5678",
#   "amount": 50000,
#   ...
# }
```

### **Bước 2: Kiểm tra trạng thái**

```bash
curl -X POST http://localhost:8000/api/payments/vnpay/check-status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "transaction_no": "VNPAY_TRANSACTION_NUMBER"
  }'
```

## 📊 **Response Codes**

| Code | Mô tả                         |
| ---- | ----------------------------- |
| 00   | Giao dịch thành công          |
| 07   | Giao dịch bị nghi ngờ         |
| 09   | Chưa đăng ký Internet Banking |
| 65   | Tài khoản không đủ số dư      |
| 75   | Ngân hàng đang bảo trì        |
| 79   | Sai mật khẩu quá số lần       |
| 85   | Tài khoản không đủ số dư      |
| 97   | Không đúng thông tin          |
| 99   | Lỗi khác                      |

## 🔧 **Troubleshooting**

### **Lỗi 1: "Cấu hình VNPay không đầy đủ"**

-   Kiểm tra `VNPAY_TMN_CODE` và `VNPAY_HASH_SECRET` trong file `.env`
-   Đảm bảo không có khoảng trắng thừa

### **Lỗi 2: "Callback verification failed"**

-   Kiểm tra `VNPAY_HASH_SECRET` có đúng không
-   Đảm bảo URL callback có thể truy cập được từ internet

### **Lỗi 3: "Số tiền thanh toán phải tối thiểu 1,000 VND"**

-   VNPay yêu cầu số tiền tối thiểu 1,000 VND
-   Kiểm tra `amount` trong request

## 📝 **Logs**

Kiểm tra logs trong `storage/logs/laravel.log`:

```bash
tail -f storage/logs/laravel.log | grep VNPay
```

## 🚀 **Deploy Production**

Khi deploy production, thay đổi:

```env
VNPAY_ENVIRONMENT=production
VNPAY_URL=https://pay.vnpay.vn/vpcpay.html
VNPAY_RETURN_URL=https://yourdomain.com/api/payments/vnpay/callback
VNPAY_IPN_URL=https://yourdomain.com/api/payments/vnpay/ipn
FRONTEND_URL=https://yourdomain.com
```

## 📞 **Hỗ trợ**

Nếu gặp vấn đề:

1. Kiểm tra logs Laravel
2. Kiểm tra cấu hình VNPay
3. Test với sandbox trước
4. Liên hệ VNPay support nếu cần
