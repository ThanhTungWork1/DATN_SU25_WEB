# Tóm Tắt API Tìm Kiếm, Lọc Sản Phẩm và Cart

## Tổng quan
Đây là tóm tắt các API đã được tạo cho phần user, bao gồm:
- API tìm kiếm và lọc sản phẩm
- API quản lý danh mục, màu sắc, kích thước
- API quản lý giỏ hàng

## Authentication
Tất cả API đều yêu cầu authentication thông qua Laravel Sanctum:
```
Authorization: Bearer {your_token}
```

## 1. API Danh Mục (Category)

### Lấy danh sách danh mục
```
GET /api/category/
```

### Lấy danh mục có sản phẩm
```
GET /api/category/with-products
```

### Lấy thống kê danh mục
```
GET /api/category/stats
```

### Lấy thông tin danh mục theo ID
```
GET /api/category/{id}
```

## 2. API Màu Sắc (Color)

### Lấy danh sách màu sắc
```
GET /api/color/
```

### Lấy màu sắc có sản phẩm
```
GET /api/color/with-products
```

### Lấy thông tin màu sắc theo ID
```
GET /api/color/{id}
```

## 3. API Kích Thước (Size)

### Lấy danh sách kích thước
```
GET /api/size/
```

### Lấy kích thước có sản phẩm
```
GET /api/size/with-products
```

### Lấy thông tin kích thước theo ID
```
GET /api/size/{id}
```

## 4. API Sản Phẩm (Product)

### Lấy danh sách sản phẩm
```
GET /api/product/
```

### Tìm kiếm và lọc sản phẩm
```
GET /api/product/search
```

**Query Parameters:**
- `search`: Từ khóa tìm kiếm
- `category_id`: ID danh mục
- `min_price`: Giá tối thiểu
- `max_price`: Giá tối đa
- `status`: Trạng thái (0/1)
- `color_id`: ID màu sắc
- `size_id`: ID kích thước
- `has_discount`: Có giảm giá hay không (0/1)
- `min_discount`: Giảm giá tối thiểu
- `max_discount`: Giảm giá tối đa
- `in_stock`: Còn hàng hay không (0/1)
- `sort_by`: Sắp xếp theo (name, price, discount, created_at, updated_at)
- `sort_order`: Thứ tự (asc, desc)
- `per_page`: Số item mỗi trang (1-100)

### Lấy sản phẩm nổi bật
```
GET /api/product/featured?limit=8
```

### Lấy sản phẩm giảm giá
```
GET /api/product/on-sale?per_page=12
```

### Lấy sản phẩm theo danh mục
```
GET /api/product/category/{categoryId}
```

**Query Parameters:**
- `sort_by`: Sắp xếp theo (name, price, discount, created_at)
- `sort_order`: Thứ tự (asc, desc)
- `per_page`: Số item mỗi trang (1-50)

### Lấy chi tiết sản phẩm
```
GET /api/product/detail/{id}
```

### Lấy thông tin sản phẩm cơ bản
```
GET /api/product/{id}
```

## 5. API Giỏ Hàng (Cart)

### Xem giỏ hàng
```
GET /api/cart/
```

### Thêm sản phẩm vào giỏ hàng
```
POST /api/cart/add
```

**Body:**
```json
{
    "product_id": 1,
    "quantity": 2
}
```

### Cập nhật số lượng sản phẩm
```
PUT /api/cart/update
```

**Body:**
```json
{
    "product_id": 1,
    "quantity": 3
}
```

### Xóa sản phẩm khỏi giỏ hàng
```
DELETE /api/cart/remove
```

**Body:**
```json
{
    "product_id": 1
}
```

### Xóa toàn bộ giỏ hàng
```
DELETE /api/cart/clear
```

## Cấu trúc Response

### Response thành công
```json
{
    "success": true,
    "message": "Thông báo thành công",
    "data": [...],
    "pagination": {
        "current_page": 1,
        "per_page": 20,
        "total": 100,
        "total_pages": 5,
        "has_next_page": true,
        "has_prev_page": false
    }
}
```

### Response lỗi
```json
{
    "message": "Thông báo lỗi",
    "errors": {
        "field": ["Chi tiết lỗi"]
    }
}
```

## Tính năng đặc biệt

### 1. Tính toán giá sau discount
Tất cả API sản phẩm đều trả về `final_price` - giá sau khi áp dụng discount:
```json
{
    "id": 1,
    "name": "Sản phẩm",
    "price": "100000.00",
    "discount": "10.00",
    "final_price": "90000.00"
}
```

### 2. Thông tin variants
Sản phẩm bao gồm thông tin variants với màu sắc và kích thước:
```json
{
    "variants": [
        {
            "id": 1,
            "stock": 10,
            "price": "100000.00",
            "color": {
                "id": 1,
                "name": "Red",
                "hex_code": "#FF0000"
            },
            "size": {
                "id": 1,
                "name": "M"
            }
        }
    ]
}
```

### 3. Thông tin đánh giá
Chi tiết sản phẩm bao gồm thông tin đánh giá:
```json
{
    "average_rating": 4.5,
    "total_reviews": 10,
    "comments": [
        {
            "id": 1,
            "content": "Sản phẩm tốt",
            "rating": 5,
            "user": {
                "id": 1,
                "name": "User Name"
            }
        }
    ]
}
```

## Test API

Sử dụng file `test_api_final.php` để test tất cả các API:
```bash
php test_api_final.php
```

**Lưu ý:** Cần thay đổi `$token` trong file test bằng token thực tế từ API login.

## Database Schema

API này hoạt động với các bảng chính:
- `products`: Thông tin sản phẩm
- `categories`: Danh mục sản phẩm
- `colors`: Màu sắc
- `sizes`: Kích thước
- `product_variants`: Biến thể sản phẩm
- `comments`: Đánh giá sản phẩm
- `users`: Người dùng

## Lưu ý quan trọng

1. **Authentication**: Tất cả API đều yêu cầu token hợp lệ
2. **Validation**: Tất cả input đều được validate
3. **Pagination**: Các API danh sách đều hỗ trợ phân trang
4. **Eager Loading**: Sử dụng eager loading để tối ưu performance
5. **Status Filter**: Chỉ trả về sản phẩm có status = true 
