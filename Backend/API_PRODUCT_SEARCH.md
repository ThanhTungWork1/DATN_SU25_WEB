# API Tìm Kiếm và Lọc Sản Phẩm

## Tổng quan
API này cung cấp các endpoint để tìm kiếm, lọc và quản lý sản phẩm với nhiều tiêu chí khác nhau.

## Base URL
```
/api/product
```

## Endpoints

### 1. Tìm kiếm và lọc sản phẩm
**GET** `/api/product/search`

Tìm kiếm và lọc sản phẩm với nhiều tiêu chí.

#### Query Parameters:
- `search` (string, optional): Từ khóa tìm kiếm trong tên và mô tả sản phẩm
- `category_id` (integer, optional): ID danh mục sản phẩm
- `min_price` (numeric, optional): Giá tối thiểu
- `max_price` (numeric, optional): Giá tối đa
- `status` (boolean, optional): Trạng thái sản phẩm (0/1)
- `sort_by` (string, optional): Sắp xếp theo trường (name, price, created_at, updated_at)
- `sort_order` (string, optional): Thứ tự sắp xếp (asc, desc)
- `per_page` (integer, optional): Số sản phẩm mỗi trang (1-100, mặc định: 10)

#### Ví dụ Request:
```bash
GET /api/product/search?search=áo&category_id=1&min_price=100000&max_price=500000&sort_by=price&sort_order=asc&per_page=20
```

#### Response:
```json
{
    "success": true,
    "message": "Tìm kiếm sản phẩm thành công",
    "data": [
        {
            "id": 1,
            "name": "Áo thun nam",
            "description": "Áo thun nam chất liệu cotton",
            "price": "150000.00",
            "status": true,
            "category_id": 1,
            "created_at": "2025-06-18T06:36:19.000000Z",
            "updated_at": "2025-06-18T06:36:19.000000Z",
            "category": {
                "id": 1,
                "name": "Áo nam",
                "created_at": "2025-06-18T06:36:16.000000Z",
                "updated_at": "2025-06-18T06:36:16.000000Z"
            },
            "variants": []
        }
    ],
    "pagination": {
        "current_page": 1,
        "per_page": 20,
        "total": 15,
        "total_pages": 1,
        "has_next_page": false,
        "has_prev_page": false
    },
    "filters": {
        "search": "áo",
        "category_id": "1",
        "min_price": "100000",
        "max_price": "500000",
        "status": null,
        "sort_by": "price",
        "sort_order": "asc"
    }
}
```

### 2. Lấy sản phẩm nổi bật
**GET** `/api/product/featured`

Lấy danh sách sản phẩm nổi bật (mặc định là sản phẩm mới nhất).

#### Query Parameters:
- `limit` (integer, optional): Số lượng sản phẩm (1-20, mặc định: 8)

#### Ví dụ Request:
```bash
GET /api/product/featured?limit=10
```

#### Response:
```json
{
    "success": true,
    "message": "Lấy sản phẩm nổi bật thành công",
    "data": [
        {
            "id": 1,
            "name": "Áo thun nam",
            "description": "Áo thun nam chất liệu cotton",
            "price": "150000.00",
            "status": true,
            "category_id": 1,
            "created_at": "2025-06-18T06:36:19.000000Z",
            "updated_at": "2025-06-18T06:36:19.000000Z",
            "category": {
                "id": 1,
                "name": "Áo nam",
                "created_at": "2025-06-18T06:36:16.000000Z",
                "updated_at": "2025-06-18T06:36:16.000000Z"
            },
            "variants": []
        }
    ],
    "total": 8
}
```

### 3. Lấy sản phẩm theo danh mục
**GET** `/api/product/category/{categoryId}`

Lấy danh sách sản phẩm theo danh mục cụ thể.

#### Path Parameters:
- `categoryId` (integer, required): ID danh mục

#### Query Parameters:
- `sort_by` (string, optional): Sắp xếp theo trường (name, price, created_at)
- `sort_order` (string, optional): Thứ tự sắp xếp (asc, desc)
- `per_page` (integer, optional): Số sản phẩm mỗi trang (1-50, mặc định: 12)

#### Ví dụ Request:
```bash
GET /api/product/category/1?sort_by=price&sort_order=desc&per_page=15
```

#### Response:
```json
{
    "success": true,
    "message": "Lấy sản phẩm theo danh mục thành công",
    "data": [
        {
            "id": 1,
            "name": "Áo thun nam",
            "description": "Áo thun nam chất liệu cotton",
            "price": "150000.00",
            "status": true,
            "category_id": 1,
            "created_at": "2025-06-18T06:36:19.000000Z",
            "updated_at": "2025-06-18T06:36:19.000000Z",
            "category": {
                "id": 1,
                "name": "Áo nam",
                "created_at": "2025-06-18T06:36:16.000000Z",
                "updated_at": "2025-06-18T06:36:16.000000Z"
            },
            "variants": []
        }
    ],
    "pagination": {
        "current_page": 1,
        "per_page": 15,
        "total": 25,
        "total_pages": 2,
        "has_next_page": true,
        "has_prev_page": false
    }
}
```

## Authentication
Tất cả các API này yêu cầu authentication thông qua Laravel Sanctum. Thêm header:
```
Authorization: Bearer {your_token}
```

## Error Responses

### 401 Unauthorized
```json
{
    "message": "Unauthenticated."
}
```

### 404 Not Found
```json
{
    "message": "Không tìm thấy sản phẩm"
}
```

### 422 Validation Error
```json
{
    "message": "The given data was invalid.",
    "errors": {
        "category_id": [
            "Danh mục không tồn tại"
        ]
    }
}
```

## Ví dụ sử dụng với JavaScript/Fetch

```javascript
// Tìm kiếm sản phẩm
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

console.log(results.data); // Danh sách sản phẩm
console.log(results.pagination); // Thông tin phân trang
```

## Lưu ý
- Tất cả các API đều trả về sản phẩm có trạng thái `status = true` (trừ khi có filter cụ thể)
- Kết quả tìm kiếm được sắp xếp theo thứ tự mặc định (created_at desc)
- Phân trang được áp dụng cho tất cả các endpoint trả về danh sách
- API hỗ trợ tìm kiếm full-text trong tên và mô tả sản phẩm 
