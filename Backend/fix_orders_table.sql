-- Fix Orders Table - Add missing columns
-- Chạy script này để thêm các trường thiếu trong bảng orders

USE datn_su25_4;

-- Thêm các trường thiếu
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS shipping_address TEXT AFTER shipping_fee,
ADD COLUMN IF NOT EXISTS shipping_phone VARCHAR(20) AFTER shipping_address,
ADD COLUMN IF NOT EXISTS shipping_name VARCHAR(255) AFTER shipping_phone,
ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255) AFTER shipping_name,
ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255) AFTER customer_email,
ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(20) AFTER customer_name,
ADD COLUMN IF NOT EXISTS note TEXT AFTER customer_phone,
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'COD' AFTER note,
ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10,2) DEFAULT 0 AFTER payment_method,
ADD COLUMN IF NOT EXISTS final_amount DECIMAL(10,2) DEFAULT 0 AFTER discount_amount;

-- Cập nhật final_amount cho các đơn hàng hiện có
UPDATE orders 
SET final_amount = total_amount + shipping_fee - discount_amount 
WHERE final_amount = 0 OR final_amount IS NULL;

-- Kiểm tra kết quả
SELECT id, total_amount, shipping_fee, discount_amount, final_amount 
FROM orders 
ORDER BY id DESC 
LIMIT 10;




