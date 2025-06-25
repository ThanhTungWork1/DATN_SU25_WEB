<?php

/**
 * File test API tìm kiếm, lọc sản phẩm và cart
 * Sử dụng để test các endpoint API với database thực tế
 */

// Cấu hình
$baseUrl = 'http://localhost:8000/api'; // Thay đổi URL theo môi trường
$token = 'your_token_here'; // Thay bằng token thực tế

// Headers
$headers = [
    'Authorization: Bearer ' . $token,
    'Content-Type: application/json',
    'Accept: application/json'
];

/**
 * Hàm gọi API
 */
function callApi($url, $method = 'GET', $data = null)
{
    global $headers;

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);

    if ($data && $method !== 'GET') {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    }

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    return [
        'status' => $httpCode,
        'data' => json_decode($response, true)
    ];
}

echo "=== TEST API TÌM KIẾM, LỌC SẢN PHẨM VÀ CART ===\n\n";

/**
 * Test 1: Lấy danh sách danh mục
 */
echo "=== Test 1: Lấy danh sách danh mục ===\n";
$result = callApi($baseUrl . '/category/');
echo "Status: " . $result['status'] . "\n";
echo "Response: " . json_encode($result['data'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n\n";

/**
 * Test 2: Lấy danh mục có sản phẩm
 */
echo "=== Test 2: Lấy danh mục có sản phẩm ===\n";
$result = callApi($baseUrl . '/category/with-products');
echo "Status: " . $result['status'] . "\n";
echo "Response: " . json_encode($result['data'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n\n";

/**
 * Test 3: Lấy thống kê danh mục
 */
echo "=== Test 3: Lấy thống kê danh mục ===\n";
$result = callApi($baseUrl . '/category/stats');
echo "Status: " . $result['status'] . "\n";
echo "Response: " . json_encode($result['data'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n\n";

/**
 * Test 4: Lấy danh sách màu sắc
 */
echo "=== Test 4: Lấy danh sách màu sắc ===\n";
$result = callApi($baseUrl . '/color/');
echo "Status: " . $result['status'] . "\n";
echo "Response: " . json_encode($result['data'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n\n";

/**
 * Test 5: Lấy danh sách kích thước
 */
echo "=== Test 5: Lấy danh sách kích thước ===\n";
$result = callApi($baseUrl . '/size/');
echo "Status: " . $result['status'] . "\n";
echo "Response: " . json_encode($result['data'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n\n";

/**
 * Test 6: Tìm kiếm sản phẩm cơ bản
 */
echo "=== Test 6: Tìm kiếm sản phẩm cơ bản ===\n";
$result = callApi($baseUrl . '/product/search?per_page=5');
echo "Status: " . $result['status'] . "\n";
echo "Response: " . json_encode($result['data'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n\n";

/**
 * Test 7: Tìm kiếm với filter theo danh mục
 */
echo "=== Test 7: Tìm kiếm với filter theo danh mục ===\n";
$result = callApi($baseUrl . '/product/search?category_id=1&per_page=5');
echo "Status: " . $result['status'] . "\n";
echo "Response: " . json_encode($result['data'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n\n";

/**
 * Test 8: Tìm kiếm với filter theo khoảng giá
 */
echo "=== Test 8: Tìm kiếm với filter theo khoảng giá ===\n";
$result = callApi($baseUrl . '/product/search?min_price=10&max_price=1000&per_page=5');
echo "Status: " . $result['status'] . "\n";
echo "Response: " . json_encode($result['data'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n\n";

/**
 * Test 9: Tìm kiếm với sắp xếp
 */
echo "=== Test 9: Tìm kiếm với sắp xếp ===\n";
$result = callApi($baseUrl . '/product/search?sort_by=price&sort_order=asc&per_page=5');
echo "Status: " . $result['status'] . "\n";
echo "Response: " . json_encode($result['data'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n\n";

/**
 * Test 10: Lấy sản phẩm nổi bật
 */
echo "=== Test 10: Lấy sản phẩm nổi bật ===\n";
$result = callApi($baseUrl . '/product/featured?limit=5');
echo "Status: " . $result['status'] . "\n";
echo "Response: " . json_encode($result['data'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n\n";

/**
 * Test 11: Lấy sản phẩm giảm giá
 */
echo "=== Test 11: Lấy sản phẩm giảm giá ===\n";
$result = callApi($baseUrl . '/product/on-sale?per_page=5');
echo "Status: " . $result['status'] . "\n";
echo "Response: " . json_encode($result['data'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n\n";

/**
 * Test 12: Lấy sản phẩm theo danh mục
 */
echo "=== Test 12: Lấy sản phẩm theo danh mục ===\n";
$result = callApi($baseUrl . '/product/category/1?per_page=5');
echo "Status: " . $result['status'] . "\n";
echo "Response: " . json_encode($result['data'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n\n";

/**
 * Test 13: Lấy chi tiết sản phẩm
 */
echo "=== Test 13: Lấy chi tiết sản phẩm ===\n";
$result = callApi($baseUrl . '/product/detail/1');
echo "Status: " . $result['status'] . "\n";
echo "Response: " . json_encode($result['data'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n\n";

/**
 * Test 14: Cart - Xem giỏ hàng
 */
echo "=== Test 14: Cart - Xem giỏ hàng ===\n";
$result = callApi($baseUrl . '/cart/');
echo "Status: " . $result['status'] . "\n";
echo "Response: " . json_encode($result['data'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n\n";

/**
 * Test 15: Cart - Thêm sản phẩm vào giỏ hàng
 */
echo "=== Test 15: Cart - Thêm sản phẩm vào giỏ hàng ===\n";
$result = callApi($baseUrl . '/cart/add', 'POST', [
    'product_id' => 1,
    'quantity' => 2
]);
echo "Status: " . $result['status'] . "\n";
echo "Response: " . json_encode($result['data'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n\n";

/**
 * Test 16: Cart - Cập nhật số lượng
 */
echo "=== Test 16: Cart - Cập nhật số lượng ===\n";
$result = callApi($baseUrl . '/cart/update', 'PUT', [
    'product_id' => 1,
    'quantity' => 3
]);
echo "Status: " . $result['status'] . "\n";
echo "Response: " . json_encode($result['data'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n\n";

/**
 * Test 17: Cart - Xóa sản phẩm khỏi giỏ hàng
 */
echo "=== Test 17: Cart - Xóa sản phẩm khỏi giỏ hàng ===\n";
$result = callApi($baseUrl . '/cart/remove', 'DELETE', [
    'product_id' => 1
]);
echo "Status: " . $result['status'] . "\n";
echo "Response: " . json_encode($result['data'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n\n";

/**
 * Test 18: Cart - Xóa toàn bộ giỏ hàng
 */
echo "=== Test 18: Cart - Xóa toàn bộ giỏ hàng ===\n";
$result = callApi($baseUrl . '/cart/clear', 'DELETE');
echo "Status: " . $result['status'] . "\n";
echo "Response: " . json_encode($result['data'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n\n";

echo "=== HOÀN THÀNH TEST ===\n";
echo "Lưu ý: Đảm bảo đã thay đổi \$token bằng token thực tế từ API login\n";
