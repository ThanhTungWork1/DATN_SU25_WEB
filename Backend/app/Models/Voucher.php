<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Voucher extends Model
{
    use HasFactory;

    protected $table = 'vouchers';

    protected $fillable = [
        'title',
        'code',
        'value',
        'max_value',
        'description',
        'start_date',
        'end_date',
        'status',
        'min_order_amount',
        'max_usage',
        'used_count',
        'discount_type',
        'quantity'
    ];

    protected $casts = [
        'status' => 'boolean',
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'min_order_amount' => 'decimal:2',
        'max_usage' => 'integer',
        'used_count' => 'integer',
        'value' => 'decimal:2',
        'max_value' => 'decimal:2',
        'discount_type' => 'string'
    ];

    /**
     * Quan hệ: Voucher có nhiều lần sử dụng
     */
    public function usage()
    {
        return $this->hasMany(VoucherUsage::class, 'voucher_id');
    }

    /**
     * Quan hệ: Voucher có thể gắn với nhiều đơn hàng qua VoucherUsage
     */
    public function orders()
    {
        return $this->hasManyThrough(
            Order::class,
            VoucherUsage::class,
            'voucher_id', // Khóa ngoại trên bảng voucher_usage
            'id',         // Khóa chính trên bảng orders
            'id',         // Khóa chính trên bảng vouchers
            'order_id'    // Khóa ngoại trên bảng voucher_usage
        );
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
        if (!$this->status)
            return false;
        if ($this->start_date && now()->lt($this->start_date))
            return false;
        if ($this->end_date && now()->gt($this->end_date))
            return false;
        if ($this->used_count >= $this->max_usage)
            return false;
        if ($this->isUsedByUser($userId))
            return false;

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
     * Lấy trạng thái voucher
     */
    public function getVoucherStatusAttribute()
    {
        $now = now();

        if (!$this->status)
            return 'locked';
        if ($this->start_date && $now->lt($this->start_date))
            return 'not_started';
        if ($this->end_date && $now->gt($this->end_date))
            return 'expired';
        if ($this->used_count >= $this->max_usage)
            return 'used_up';

        return 'active';
    }

    /**
     * Nhãn trạng thái voucher
     */
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

    /**
     * Màu trạng thái voucher
     */
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

    /**
     * Tính toán số tiền giảm giá
     */
    public function calculateDiscount($orderAmount)
    {
        if ($this->discount_type === 'percentage') {
            $discount = $orderAmount * ($this->value / 100);
            if ($this->max_value > 0) {
                return min($discount, $this->max_value);
            }
            return $discount;
        }

        return $this->value;
    }

    /**
     * Accessor for discount_type.
     * Converts 'fixed' to 'amount' and 'percent' to 'percentage'.
     */
    public function getDiscountTypeAttribute($value)
    {
        if ($value === 'fixed') {
            return 'amount';
        }
        if ($value === 'percent') {
            return 'percentage';
        }
        return $value;
    }

    /**
     * Mutator for discount_type.
     * Converts 'amount' to 'fixed' and 'percentage' to 'percent' before saving.
     */
    public function setDiscountTypeAttribute($value)
    {
        if ($value === 'amount') {
            $this->attributes['discount_type'] = 'fixed';
        } elseif ($value === 'percentage') {
            $this->attributes['discount_type'] = 'percent';
        } else {
            $this->attributes['discount_type'] = $value;
        }
    }
}
