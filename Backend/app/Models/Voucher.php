<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Voucher extends Model
{
    protected $fillable = [
        'title',
        'code',
        'value',
        'max_value',
        'min_order_amount',
        'quantity',
        'usage_limit',
        'used_count',
        'user_type',
        'product_categories',
        'excluded_products',
        'discount_type',
        'description',
        'start_date',
        'end_date',
        'status'
    ];

    protected $casts = [
        'product_categories' => 'array',
        'excluded_products' => 'array',
        'start_date' => 'date',
        'end_date' => 'date',
        'status' => 'boolean',
    ];

    // Kiểm tra voucher có thể sử dụng không
    public function isUsable()
    {
        $now = now()->toDateString();

        return $this->status &&
            $now >= $this->start_date &&
            $now <= $this->end_date &&
            $this->used_count < $this->usage_limit;
    }

    // Tính toán giảm giá
    public function calculateDiscount($orderAmount)
    {
        if ($this->discount_type === 'percentage') {
            $discount = ($orderAmount * $this->value) / 100;
            return min($discount, $this->max_value);
        } else {
            return min($this->value, $orderAmount);
        }
    }

    // Kiểm tra điều kiện áp dụng
    public function canApplyToOrder($orderAmount, $userType = 'existing', $productIds = [])
    {
        // Kiểm tra giá trị đơn hàng tối thiểu
        if ($orderAmount < $this->min_order_amount) {
            return false;
        }

        // Kiểm tra loại khách hàng
        if ($this->user_type !== 'all' && $this->user_type !== $userType) {
            return false;
        }

        // Kiểm tra sản phẩm bị loại trừ
        if (
            !empty($this->excluded_products) &&
            array_intersect($productIds, $this->excluded_products)
        ) {
            return false;
        }

        return true;
    }
}
