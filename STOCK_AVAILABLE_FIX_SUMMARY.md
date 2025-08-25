# 🔧 SỬA LỖI STOCK_AVAILABLE = 0

## 🎯 **VẤN ĐỀ ĐÃ GẶP:**

### **Mô tả vấn đề:**

- Khi thêm variant mới, trường `stock_available` không được set → mặc định = 0
- Chức năng tồn kho đang kiểm tra `stock_available` thay vì `stock`
- Dẫn đến sản phẩm bị báo "Hết hàng" dù `stock` còn nhiều

### **Ví dụ từ dữ liệu thực tế:**

```
Variant ID 27: stock=117, stock_available=0 → "Hết hàng" ❌
Variant ID 32: stock=234, stock_available=0 → "Hết hàng" ❌
```

## ✅ **GIẢI PHÁP ĐÃ THỰC HIỆN:**

### **1. Sửa logic tạo variant (ProductController.php):**

**Trong method `store()`:**

```php
// 🔧 FIX: Set stock_available = stock khi tạo mới variant
if (!isset($variant['stock_available'])) {
    $variant['stock_available'] = $variant['stock'] ?? 0;
}
if (!isset($variant['stock_reserved'])) {
    $variant['stock_reserved'] = 0;
}
```

**Trong method `update()`:**

```php
// 🔧 FIX: Set stock_available = stock khi update variant (nếu không có)
if (!isset($variantData['stock_available']) && isset($variantData['stock'])) {
    $variantData['stock_available'] = $variantData['stock'];
}
if (!isset($variantData['stock_reserved'])) {
    $variantData['stock_reserved'] = 0;
}
```

### **2. Sửa logic kiểm tra tồn kho (InventoryService.php):**

**Thay đổi từ `stock_available` sang `stock`:**

```php
// Trước:
$lowStockProducts = ProductVariant::where('stock_available', '<', 10)
$outOfStockProducts = ProductVariant::where('stock_available', '<=', 0)

// Sau:
$lowStockProducts = ProductVariant::where('stock', '<', 10)
$outOfStockProducts = ProductVariant::where('stock', '<=', 0)
```

### **3. Cập nhật dữ liệu hiện tại:**

**Script `fix_stock_available.php`:**

- Tìm tất cả variants có `stock_available = 0` hoặc `null`
- Set `stock_available = stock` nếu `stock > 0`
- Đã sửa thành công **13 variants**

## 📊 **KẾT QUẢ:**

### **Trước khi sửa:**

- 13 variants có `stock > 0` nhưng `stock_available = 0`
- Sản phẩm bị báo "Hết hàng" không chính xác

### **Sau khi sửa:**

- ✅ Tất cả variants đã có `stock_available = stock`
- ✅ Chức năng tồn kho kiểm tra đúng trường `stock`
- ✅ Sản phẩm hiển thị trạng thái chính xác

### **Thống kê:**

```
- Tổng variants: 26
- Variants có stock_available = 0: 0
- Variants có stock > 0 nhưng stock_available = 0: 0
```

## 🚀 **LỢI ÍCH:**

1. **Chính xác:** Trạng thái tồn kho hiển thị đúng
2. **Nhất quán:** Logic kiểm tra thống nhất
3. **Tự động:** Variants mới sẽ được set đúng từ đầu
4. **Dễ bảo trì:** Code rõ ràng, dễ hiểu

## 🔄 **CÁCH SỬ DỤNG:**

### **Cho variants mới:**

- Khi thêm variant, `stock_available` sẽ tự động = `stock`
- Không cần nhập thêm trường `stock_available`

### **Cho variants hiện tại:**

- Đã được sửa tự động bằng script
- Không cần thao tác thêm

---

**Trạng thái:** ✅ **HOÀN THÀNH**
**Ngày sửa:** 25/08/2025
