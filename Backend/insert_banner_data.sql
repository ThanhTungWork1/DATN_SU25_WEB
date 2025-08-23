-- Tạo dữ liệu banner mẫu trực tiếp vào database
INSERT INTO banners (image_url, public_id, status, created_at, updated_at) VALUES
('https://picsum.photos/1200/400?random=1', 'placeholder_banner_1', 1, NOW(), NOW()),
('https://picsum.photos/1200/400?random=2', 'placeholder_banner_2', 1, NOW(), NOW()),
('https://picsum.photos/1200/400?random=3', 'placeholder_banner_3', 0, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
    image_url = VALUES(image_url),
    status = VALUES(status),
    updated_at = NOW();
