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
        'quantity',
        'description',
        'start_date',
        'end_date',
        'status',
        'min_order_amount',
        'max_usage',
        'used_count',
        'discount_type',
        'usage_limit',
        'user_type',
        'product_categories',
        'excluded_products'
    ];

    protected $casts = [
        'status' => 'boolean',
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'min_order_amount' => 'decimal:2',
        'max_usage' => 'integer',
        'used_count' => 'integer',
        'value' => 'decimal:2',
        'product_categories' => 'array',
        'excluded_products' => 'array'
    ];

    /**
     * Quan hệ với VoucherUsage
     */
    public function usage()
    {
        return $this->hasMany(VoucherUsage::class);
    }

    /**
     * Kiểm tra user đã dùng voucher này chưa
     */
    public function isUsedByUser($userId)
    {
        return $this->usage()->where('user_id', $userId)->exists();
    }

    /**
     * Kiểm tra voucher có thể sử dụng bởi user không
     */
    public function canBeUsedBy($userId)
    {
        if (!$this->status) {
            return false;
        }

        if ($this->start_date && now() < $this->start_date) {
            return false;
        }

        if ($this->end_date && now() > $this->end_date) {
            return false;
        }

        if ($this->used_count >= $this->max_usage) {
            return false;
        }

        if ($this->isUsedByUser($userId)) {
            return false;
        }

        return true;
    }

    /**
     * Kiểm tra voucher có thể sử dụng không (theo ngày + usage limit)
     */
    public function isUsable()
    {
        $now = now()->toDateString();

        return $this->status &&
            $now >= $this->start_date &&
            $now <= $this->end_date &&
            $this->used_count < ($this->usage_limit ?? $this->max_usage);
    }

    /**
     * Tính toán giảm giá
     */
    public function calculateDiscount($orderAmount)
    {
        if ($this->discount_type === 'percent') {
            $discount = ($orderAmount * $this->value) / 100;
            return min($discount, $this->max_value);
        } else {
            return min($this->value, $orderAmount);
        }
    }

    /**
     * Kiểm tra điều kiện áp dụng
     */
    public function canApplyToOrder($orderAmount, $userType = 'existing', $productIds = [])
    {
        if ($orderAmount < $this->min_order_amount) {
            return false;
        }

        if ($this->user_type && $this->user_type !== 'all' && $this->user_type !== $userType) {
            return false;
        }

        if (!empty($this->excluded_products) &&
            array_intersect($productIds, $this->excluded_products)) {
            return false;
        }

        return true;
    }

    /**
     * Sử dụng voucher bởi user
     */
    public function useBy($userId, $orderId = null, $discountAmount = null)
    {
        if (!$this->canBeUsedBy($userId)) {
            throw new \Exception('Voucher không thể sử dụng');
        }

        $this->usage()->create([
            'user_id' => $userId,
            'order_id' => $orderId,
            'discount_amount' => $discountAmount ?? $this->value,
            'used_at' => now()
        ]);

        $this->increment('used_count');

        return true;
    }

    /**
     * Trạng thái voucher
     */
    public function getVoucherStatusAttribute()
    {
        $now = now();

        if (!$this->status) {
            return 'locked';
        }

        if ($this->start_date && $now < $this->start_date) {
            return 'not_started';
        }

        if ($this->end_date && $now > $this->end_date) {
            return 'expired';
        }

        if ($this->used_count >= $this->max_usage) {
            return 'used_up';
        }

        return 'active';
    }

    public function getStatusLabelAttribute()
    {
        $statusMap = [
            'active' => 'Hoạt động',
            'locked' => 'Đã khóa',
            'expired' => 'Hết hạn',
            'not_started' => 'Chưa bắt đầu',
            'used_up' => 'Đã sử dụng hết'
        ];

        return $statusMap[$this->voucher_status] ?? 'Không xác định';
    }

    public function getStatusColorAttribute()
    {
        $colorMap = [
            'active' => 'green',
            'locked' => 'red',
            'expired' => 'orange',
            'not_started' => 'blue',
            'used_up' => 'gray'
        ];

        return $colorMap[$this->voucher_status] ?? 'default';
    }
}
