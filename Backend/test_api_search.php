<?php

/**
 * File test API tìm kiếm và lọc sản phẩm
 * Sử dụng để test các endpoint API
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

/**
 * Test 1: Tìm kiếm sản phẩm cơ bản
 */
echo "=== Test 1: Tìm kiếm sản phẩm cơ bản ===\n";
$result = callApi($baseUrl . '/product/search?search=áo&per_page=5');
echo "Status: " . $result['status'] . "\n";
echo "Response: " . json_encode($result['data'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n\n";

/**
 * Test 2: Tìm kiếm với nhiều filter
 */
echo "=== Test 2: Tìm kiếm với nhiều filter ===\n";
$result = callApi($baseUrl . '/product/search?search=áo&category_id=1&min_price=100000&max_price=500000&sort_by=price&sort_order=asc&per_page=10');
echo "Status: " . $result['status'] . "\n";
echo "Response: " . json_encode($result['data'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n\n";

/**
 * Test 3: Lấy sản phẩm nổi bật
 */
echo "=== Test 3: Lấy sản phẩm nổi bật ===\n";
$result = callApi($baseUrl . '/product/featured?limit=5');
echo "Status: " . $result['status'] . "\n";
echo "Response: " . json_encode($result['data'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n\n";

/**
 * Test 4: Lấy sản phẩm theo danh mục
 */
echo "=== Test 4: Lấy sản phẩm theo danh mục ===\n";
$result = callApi($baseUrl . '/product/category/1?sort_by=created_at&sort_order=desc&per_page=8');
echo "Status: " . $result['status'] . "\n";
echo "Response: " . json_encode($result['data'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n\n";

/**
 * Test 5: Lấy danh sách danh mục
 */
echo "=== Test 5: Lấy danh sách danh mục ===\n";
$result = callApi($baseUrl . '/category/');
echo "Status: " . $result['status'] . "\n";
echo "Response: " . json_encode($result['data'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n\n";

/**
 * Test 6: Lấy danh mục có sản phẩm
 */
echo "=== Test 6: Lấy danh mục có sản phẩm ===\n";
$result = callApi($baseUrl . '/category/with-products');
echo "Status: " . $result['status'] . "\n";
echo "Response: " . json_encode($result['data'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n\n";

/**
 * Test 7: Lấy thông tin danh mục cụ thể
 */
echo "=== Test 7: Lấy thông tin danh mục cụ thể ===\n";
$result = callApi($baseUrl . '/category/1');
echo "Status: " . $result['status'] . "\n";
echo "Response: " . json_encode($result['data'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "\n\n";

echo "=== Hoàn thành test ===\n";
