# API Tìm Kiếm và Lọc Sản Phẩm - Hướng Dẫn Sử Dụng

## Tổng quan
Đây là hệ thống API tìm kiếm và lọc sản phẩm được xây dựng trên Laravel với các tính năng:
- Tìm kiếm full-text trong tên và mô tả sản phẩm
- Lọc theo danh mục, khoảng giá, trạng thái
- Sắp xếp theo nhiều tiêu chí
- Phân trang kết quả
- Lấy sản phẩm nổi bật
- Quản lý danh mục

## Cài đặt và Chạy

### 1. Cài đặt dependencies
```bash
composer install
npm install
```

### 2. Cấu hình môi trường
```bash
cp .env.example .env
php artisan key:generate
```

### 3. Cấu hình database
Chỉnh sửa file `.env`:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=your_database_name
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

### 4. Chạy migration và seeder
```bash
php artisan migrate
php artisan db:seed
```

### 5. Chạy server
```bash
php artisan serve
```

## Các API Endpoints

### Authentication
Trước khi sử dụng các API, bạn cần đăng nhập để lấy token:

```bash
POST /api/login
Content-Type: application/json

{
    "email": "ph@gmail.com",
    "password": "123"
}
```

### 1. Tìm kiếm và lọc sản phẩm
```bash
GET /api/product/search?search=áo&category_id=1&min_price=100000&max_price=500000&sort_by=price&sort_order=asc&per_page=20
```

**Parameters:**
- `search`: Từ khóa tìm kiếm (optional)
- `category_id`: ID danh mục (optional)
- `min_price`: Giá tối thiểu (optional)
- `max_price`: Giá tối đa (optional)
- `status`: Trạng thái (0/1, optional)
- `sort_by`: Sắp xếp theo (name, price, created_at, updated_at)
- `sort_order`: Thứ tự (asc, desc)
- `per_page`: Số item mỗi trang (1-100)

### 2. Sản phẩm nổi bật
```bash
GET /api/product/featured?limit=8
```

### 3. Sản phẩm theo danh mục
```bash
GET /api/product/category/1?sort_by=price&sort_order=desc&per_page=12
```

### 4. Danh sách danh mục
```bash
GET /api/category/
GET /api/category/with-products
GET /api/category/1
```

## Ví dụ sử dụng với JavaScript

### Tìm kiếm sản phẩm
```javascript
async function searchProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`/api/product/search?${queryString}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    return await response.json();
}

// Sử dụng
const results = await searchProducts({
    search: 'áo thun',
    category_id: 1,
    min_price: 100000,
    max_price: 500000,
    sort_by: 'price',
    sort_order: 'asc',
    per_page: 20
});
```

### Lấy sản phẩm nổi bật
```javascript
async function getFeaturedProducts(limit = 8) {
    const response = await fetch(`/api/product/featured?limit=${limit}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    return await response.json();
}
```

### Lấy danh mục
```javascript
async function getCategories() {
    const response = await fetch('/api/category/', {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    return await response.json();
}
```

## Test API

Sử dụng file `test_api_search.php` để test các API:

```bash
php test_api_search.php
```

**Lưu ý:** Cần thay đổi `$token` trong file test bằng token thực tế.

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

## Tính năng nâng cao

### 1. Tìm kiếm nâng cao
- Tìm kiếm full-text trong tên và mô tả
- Hỗ trợ tìm kiếm theo từ khóa một phần

### 2. Lọc đa tiêu chí
- Lọc theo danh mục
- Lọc theo khoảng giá
- Lọc theo trạng thái sản phẩm

### 3. Sắp xếp linh hoạt
- Sắp xếp theo tên, giá, ngày tạo
- Hỗ trợ sắp xếp tăng/giảm

### 4. Phân trang thông minh
- Giới hạn số item mỗi trang
- Thông tin phân trang chi tiết
- Hỗ trợ điều hướng trang

## Bảo mật

- Tất cả API đều yêu cầu authentication
- Sử dụng Laravel Sanctum cho token-based authentication
- Validation đầy đủ cho tất cả input parameters
- Giới hạn rate limiting (có thể cấu hình thêm)

## Performance

- Sử dụng eager loading để tránh N+1 query
- Index database cho các trường tìm kiếm
- Phân trang để giảm tải database
- Cache có thể được thêm vào để tăng performance

## Mở rộng

Để mở rộng tính năng, có thể thêm:

1. **Tìm kiếm theo tag**: Thêm bảng tags và relationship
2. **Filter theo rating**: Thêm bảng reviews và rating
3. **Tìm kiếm theo location**: Thêm thông tin địa lý
4. **Auto-complete**: API gợi ý từ khóa tìm kiếm
5. **Search history**: Lưu lịch sử tìm kiếm của user

## Troubleshooting

### Lỗi thường gặp

1. **401 Unauthorized**: Kiểm tra token authentication
2. **404 Not Found**: Kiểm tra URL endpoint
3. **422 Validation Error**: Kiểm tra format parameters
4. **500 Internal Server Error**: Kiểm tra log Laravel

### Debug

```bash
# Xem log Laravel
tail -f storage/logs/laravel.log

# Clear cache
php artisan cache:clear
php artisan config:clear
php artisan route:clear
```

## Liên hệ

Nếu có vấn đề hoặc cần hỗ trợ, vui lòng tạo issue hoặc liên hệ team phát triển. 
