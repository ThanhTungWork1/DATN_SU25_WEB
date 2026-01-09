# Hướng dẫn Test ZaloPay - Tránh mã "r"

## 🔍 **Nguyên nhân mã "r" xuất hiện:**

Mã "r" thường xuất hiện khi:

1. **Cấu hình ZaloPay thiếu** trong file .env
2. **Lỗi validation** dữ liệu đầu vào
3. **Lỗi kết nối** với ZaloPay API
4. **Response không hợp lệ** từ ZaloPay

## ✅ **Các cải tiến đã thực hiện:**

### 1. **Validation chặt chẽ hơn**

-   Kiểm tra `order_id` có tồn tại không
-   Kiểm tra order status có hợp lệ không
-   Kiểm tra số tiền > 0

### 2. **Xử lý lỗi chi tiết**

-   Log đầy đủ thông tin lỗi
-   Phân loại lỗi HTTP status
-   Xử lý timeout connection

### 3. **Kiểm tra response ZaloPay**

-   Kiểm tra `return_code` === 1
-   Kiểm tra có `order_url` không
-   Log chi tiết response

## 🧪 **Cách test để tránh mã "r":**

### **Bước 1: Kiểm tra file .env**

```env
ZALOPAY_APP_ID=your_app_id
ZALOPAY_KEY1=your_key1
ZALOPAY_KEY2=your_key2
ZALOPAY_SANDBOX_URL=https://sb-openapi.zalopay.vn/v2/create
FRONTEND_URL=http://localhost:3000
```

### **Bước 2: Kiểm tra logs**

```bash
tail -f storage/logs/laravel.log
```

### **Bước 3: Test API endpoint**

```bash
# Test tạo đơn hàng
curl -X POST http://localhost:8000/api/payments/zalopay/create \
  -H "Content-Type: application/json" \
  -d '{"order_id": 1}'
```

## 🔧 **Debug khi gặp mã "r":**

### **1. Kiểm tra cấu hình**

```php
// Trong ZaloPayService
Log::info('ZaloPay config check', [
    'app_id' => $this->app_id,
    'key1' => !empty($this->key1),
    'key2' => !empty($this->key2),
    'endpoint' => $this->endpoint
]);
```

### **2. Kiểm tra request data**

```php
// Log request data (không log sensitive info)
Log::info('ZaloPay request', [
    'app_id' => $data['app_id'],
    'amount' => $data['amount'],
    'app_trans_id' => $data['app_trans_id']
]);
```

### **3. Kiểm tra response**

```php
// Log full response từ ZaloPay
Log::info('ZaloPay full response', $result);
```

## 📋 **Checklist trước khi test:**

-   [ ] File .env có đầy đủ ZALOPAY\_\* variables
-   [ ] ZaloPay sandbox đang hoạt động
-   [ ] Order có status hợp lệ (không phải 'paid' hoặc 'cancelled')
-   [ ] Số tiền > 0
-   [ ] Database migration đã chạy
-   [ ] Logs có thể ghi được

## 🚨 **Các lỗi thường gặp:**

### **Lỗi 1: "Cấu hình ZaloPay không đầy đủ"**

-   **Nguyên nhân**: Thiếu biến môi trường
-   **Giải pháp**: Kiểm tra file .env

### **Lỗi 2: "Không thể kết nối với ZaloPay"**

-   **Nguyên nhân**: Endpoint sai hoặc network issue
-   **Giải pháp**: Kiểm tra ZALOPAY_SANDBOX_URL

### **Lỗi 3: "ZaloPay không trả về URL thanh toán"**

-   **Nguyên nhân**: Response từ ZaloPay không hợp lệ
-   **Giải pháp**: Kiểm tra logs và cấu hình ZaloPay

## 📞 **Liên hệ hỗ trợ:**

Nếu vẫn gặp mã "r", hãy:

1. Kiểm tra logs trong `storage/logs/laravel.log`
2. Chụp màn hình lỗi
3. Cung cấp thông tin order_id và amount
