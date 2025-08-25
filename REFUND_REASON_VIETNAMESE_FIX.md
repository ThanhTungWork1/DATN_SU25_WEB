# 🔧 SỬA LỖI REFUND REASON TIẾNG ANH THÀNH TIẾNG VIỆT

## 🎯 **VẤN ĐỀ ĐÃ GẶP:**

### **Mô tả vấn đề:**

- Trường `reason` trong bảng `refund_requests` đang lưu tiếng Anh như "wrong_item", "not_as_described", "quality_issue"
- Khi hiển thị trong admin dashboard, các reason này vẫn hiển thị tiếng Anh
- Cần việt hóa để hiển thị tiếng Việt trực tiếp

### **Ví dụ từ dữ liệu thực tế:**

```
Refund ID 16: reason = "wrong_item" → Hiển thị "wrong_item" ❌
Refund ID 12: reason = "not_as_described" → Hiển thị "not_as_described" ❌
```

## ✅ **GIẢI PHÁP ĐÃ THỰC HIỆN:**

### **1. Sửa Frontend - RefundRequestModal.tsx:**

**Thay đổi option values từ tiếng Anh sang tiếng Việt:**

**Trước:**

```html
<option value="wrong_item">Giao sai sản phẩm</option>
<option value="not_as_described">Không đúng mô tả</option>
<option value="quality_issue">Chất lượng không tốt</option>
```

**Sau:**

```html
<option value="Giao sai sản phẩm">Giao sai sản phẩm</option>
<option value="Không đúng mô tả">Không đúng mô tả</option>
<option value="Chất lượng không tốt">Chất lượng không tốt</option>
```

### **2. Sửa Frontend - RefundRequestList.tsx (Admin):**

**Cập nhật mapping để hỗ trợ cả dữ liệu cũ và mới:**

```typescript
const reasonMap: { [key: string]: string } = {
  quality_issue: "Chất lượng không tốt",
  not_as_described: "Không đúng mô tả",
  wrong_item: "Giao sai sản phẩm",
  defective: "Sản phẩm bị lỗi/hỏng",
  changed_mind: "Đổi ý không muốn mua nữa",
  found_better_price: "Tìm được giá tốt hơn",
  wrong_order: "Đặt nhầm sản phẩm",
  damaged: "Sản phẩm bị hỏng",
  wrong_size: "Sai kích thước",
  delivery_issue: "Vấn đề giao hàng",
  other: "Lý do khác",
};
```

### **3. Cập nhật dữ liệu hiện tại:**

**Script `fix_refund_reasons.php`:**

- Mapping từ tiếng Anh sang tiếng Việt
- Cập nhật tất cả refund requests có reason tiếng Anh
- Đã sửa thành công **5 refund requests**

## 📊 **KẾT QUẢ:**

### **Trước khi sửa:**

- 5 refund requests có reason tiếng Anh
- Hiển thị "wrong_item", "not_as_described", "quality_issue" trong admin

### **Sau khi sửa:**

- ✅ Tất cả refund requests đã có reason tiếng Việt
- ✅ Hiển thị "Giao sai sản phẩm", "Không đúng mô tả", "Chất lượng không tốt"
- ✅ Dữ liệu mới sẽ lưu trực tiếp tiếng Việt

### **Thống kê:**

```
- Tổng refund requests: 5
- Reason tiếng Anh còn lại: 0
- Reason tiếng Việt: 5

Danh sách reason hiện tại:
- 'Không đúng mô tả': 2 requests
- 'Chất lượng không tốt': 1 requests
- 'Giao sai sản phẩm': 1 requests
- 'Lý do khác': 1 requests
```

## 🚀 **LỢI ÍCH:**

1. **Nhất quán:** Tất cả reason đều hiển thị tiếng Việt
2. **Dễ hiểu:** Admin không cần nhớ mapping tiếng Anh
3. **Tự động:** Dữ liệu mới sẽ lưu trực tiếp tiếng Việt
4. **Tương thích:** Vẫn hỗ trợ dữ liệu cũ (nếu có)

## 🔄 **CÁCH SỬ DỤNG:**

### **Cho refund requests mới:**

- Khi tạo refund request, reason sẽ được lưu trực tiếp tiếng Việt
- Không cần mapping thêm

### **Cho refund requests hiện tại:**

- Đã được sửa tự động bằng script
- Hiển thị tiếng Việt trong admin dashboard

## 📋 **DANH SÁCH REASON TIẾNG VIỆT:**

### **Cho hủy đơn hàng:**

- "Đổi ý không muốn mua nữa"
- "Tìm được giá tốt hơn"
- "Đặt nhầm sản phẩm"
- "Lý do khác"

### **Cho trả hàng:**

- "Sản phẩm bị lỗi/hỏng"
- "Giao sai sản phẩm"
- "Không đúng mô tả"
- "Chất lượng không tốt"
- "Lý do khác"

---

**Trạng thái:** ✅ **HOÀN THÀNH**
**Ngày sửa:** 25/08/2025
