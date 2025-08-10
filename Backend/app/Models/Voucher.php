<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Voucher extends Model
{
    protected $fillable = [
        'title', 'code', 'value', 'max_value', 'quantity',
        'description', 'start_date', 'end_date', 'status',
        'min_order_amount', 'max_usage', 'used_count', 'discount_type'
    ];

    protected $casts = [
        'status' => 'boolean',
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'min_order_amount' => 'decimal:2',
        'max_usage' => 'integer',
        'used_count' => 'integer',
        'value' => 'decimal:2'
    ];

    /**
     * Relationship với VoucherUsage
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
        // Kiểm tra voucher còn hoạt động không
        if (!$this->status) {
            return false;
        }

        // Kiểm tra chưa đến ngày bắt đầu
        if ($this->start_date && now() < $this->start_date) {
            return false;
        }

        // Kiểm tra đã hết hạn
        if ($this->end_date && now() > $this->end_date) {
            return false;
        }

        // Kiểm tra đã hết lượt
        if ($this->used_count >= $this->max_usage) {
            return false;
        }

        // Kiểm tra user đã dùng chưa
        if ($this->isUsedByUser($userId)) {

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

        // Tạo record usage
        $this->usage()->create([
            'user_id' => $userId,
            'order_id' => $orderId,
            'discount_amount' => $discountAmount ?? $this->value,
            'used_at' => now()
        ]);

        // Tăng used_count
        $this->increment('used_count');

        return true;
    }

    /**
     * Get voucher status based on dates and usage
     */
    public function getVoucherStatusAttribute()
    {
        $now = now();
        
        // Nếu voucher bị khóa thủ công
        if (!$this->status) {
            return 'locked';
        }
        
        // Nếu chưa đến ngày bắt đầu
        if ($this->start_date && $now < $this->start_date) {
            return 'not_started';
        }
        
        // Nếu đã hết hạn
        if ($this->end_date && $now > $this->end_date) {
            return 'expired';
        }
        
        // Nếu đã sử dụng hết số lần
        if ($this->used_count >= $this->max_usage) {
            return 'used_up';
        }
        
        return 'active';
    }

    /**
     * Get status label for display
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
     * Get status color for display
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
}