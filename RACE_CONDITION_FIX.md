# 🔧 SỬA LỖI RACE CONDITION KHI MUA HÀNG ĐỒNG THỜI

## 🎯 **VẤN ĐỀ ĐÃ GẶP:**

### **Mô tả vấn đề:**

- Khi 2+ người dùng cùng mua sản phẩm có số lượng giới hạn
- Chỉ 1 đơn hàng được tạo thành công
- Stock không được cập nhật chính xác
- Có thể dẫn đến stock âm hoặc oversell

### **Ví dụ thực tế:**

```
Sản phẩm: Áo thun nam
Stock: 1
User A và User B cùng mua 1 cái

Kết quả:
- User A: Đặt hàng thành công, stock = 0 ✅
- User B: Đặt hàng thành công, stock = -1 ❌ (Phải báo hết hàng)
```

## 🔍 **NGUYÊN NHÂN:**

### **1. Race Condition (Điều kiện đua):**

```
Thời điểm T1: User A và User B cùng gửi request

User A: find() → stock = 1 → stock -= 1 → save() → stock = 0
User B: find() → stock = 1 → stock -= 1 → save() → stock = 0 ❌
```

### **2. Code cũ có vấn đề:**

```php
// ❌ CODE CŨ - CÓ RACE CONDITION
foreach ($data['items'] as $item) {
    $variant = ProductVariant::find($item['variant_id']);
    $variant->stock -= $item['quantity'];  // Race condition ở đây!
    $variant->save();
}
```

**Vấn đề:**

- Không có lock row
- Không có atomic operation
- Không kiểm tra lại stock trước khi giảm

## ✅ **GIẢI PHÁP ĐÃ THỰC HIỆN:**

### **1. Sử dụng Database Lock:**

```php
// ✅ CODE MỚI - FIX RACE CONDITION
$variant = ProductVariant::where('id', $item['variant_id'])
    ->where('stock', '>=', $item['quantity']) // Kiểm tra stock đủ
    ->lockForUpdate() // Lock row để tránh race condition
    ->first();
```

### **2. Atomic Update:**

```php
// ✅ Atomic update stock
$updatedRows = ProductVariant::where('id', $item['variant_id'])
    ->where('stock', '>=', $item['quantity'])
    ->update([
        'stock' => DB::raw("stock - {$item['quantity']}")
    ]);

if ($updatedRows === 0) {
    throw new \Exception('Sản phẩm không đủ tồn kho hoặc đã bị thay đổi.');
}
```

### **3. Double Validation:**

```php
// Kiểm tra stock ban đầu (UI validation)
if ($variant->stock < $item['quantity']) {
    throw new \Exception('Sản phẩm không đủ tồn kho.');
}

// Kiểm tra lại trong transaction (Server validation)
$variant = ProductVariant::where('id', $item['variant_id'])
    ->where('stock', '>=', $item['quantity'])
    ->lockForUpdate()
    ->first();
```

## 🚀 **LỢI ÍCH CỦA GIẢI PHÁP:**

### **1. Thread Safety:**

- ✅ Mỗi request được xử lý tuần tự
- ✅ Không có race condition
- ✅ Stock luôn chính xác

### **2. Data Consistency:**

- ✅ Không bao giờ có stock âm
- ✅ Không oversell sản phẩm
- ✅ Database integrity được đảm bảo

### **3. User Experience:**

- ✅ User thứ 2 sẽ nhận thông báo "Hết hàng"
- ✅ Không có đơn hàng "ma"
- ✅ Thông báo lỗi rõ ràng

## 📊 **KẾT QUẢ SAU KHI SỬA:**

### **Trước khi sửa:**

```
Stock = 1, 2 users cùng mua
- User A: Thành công, stock = 0
- User B: Thành công, stock = -1 ❌
```

### **Sau khi sửa:**

```
Stock = 1, 2 users cùng mua
- User A: Thành công, stock = 0
- User B: Thất bại, thông báo "Hết hàng" ✅
```

## 🔄 **CÁCH HOẠT ĐỘNG:**

### **1. User A mua hàng:**

```
1. Lock row product_variant (ID = 123)
2. Kiểm tra stock >= 1 → OK
3. Update stock = stock - 1
4. Commit transaction
5. Unlock row
```

### **2. User B mua hàng (cùng lúc):**

```
1. Chờ lock row product_variant (ID = 123)
2. Lock được row
3. Kiểm tra stock >= 1 → FAIL (stock = 0)
4. Throw exception "Hết hàng"
5. Rollback transaction
6. Unlock row
```

## 🛡️ **BẢO VỆ BỔ SUNG:**

### **1. Frontend Validation:**

- Kiểm tra stock trước khi cho phép đặt hàng
- Disable button khi stock = 0
- Real-time update stock

### **2. Backend Validation:**

- Double check stock trong transaction
- Atomic update operation
- Proper error handling

### **3. Database Constraints:**

```sql
-- Thêm constraint để đảm bảo stock >= 0
ALTER TABLE product_variants
ADD CONSTRAINT check_stock_non_negative
CHECK (stock >= 0);
```

## 📋 **TESTING:**

### **Cách test Race Condition:**

1. Tạo sản phẩm có stock = 1
2. Mở 2 tab browser với 2 tài khoản khác nhau
3. Cùng đặt hàng sản phẩm đó
4. Kiểm tra kết quả:
   - Tab 1: Thành công
   - Tab 2: Thông báo "Hết hàng"

---

**Trạng thái:** ✅ **HOÀN THÀNH**
**Ngày sửa:** 25/08/2025
**Loại lỗi:** Race Condition
**Mức độ:** Critical (ảnh hưởng đến business logic)
