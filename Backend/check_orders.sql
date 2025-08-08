USE datn_su25_4;
SELECT 
    id,
    total_amount,
    shipping_fee,
    discount_amount,
    final_amount,
    (total_amount + shipping_fee - discount_amount) as calculated_total
FROM orders 
WHERE id IN (6, 8) 
ORDER BY id;
