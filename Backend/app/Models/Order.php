<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Order extends Model
{
    protected $fillable = [
        'user_id',
        'status',
        'is_paid',
        'total_amount',
        'shipping_fee',
        'shipping_address',
        'shipping_phone',
        'shipping_name',
        'note',
        'payment_method',
        'discount_amount',
        'final_amount'
    ];

    protected $casts = [
        'is_paid' => 'boolean',
        'total_amount' => 'decimal:2',
        'shipping_fee' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'final_amount' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    /**
     * Automatically append computed attributes when converting to JSON
     */
    protected $appends = ['total_quantity'];

    /**
     * Calculate total quantity of items in this order
     */
    public function getTotalQuantityAttribute()
    {
        return $this->items->sum('quantity');
    }

    /**
     * Calculate total price including shipping fee and discounts
     */
    public function getTotalPriceAttribute()
    {
        $total = $this->total_amount + $this->shipping_fee - $this->discount_amount;
        return max(0, $total); // Ensure total is never negative
    }

    /**
     * Get the user that owns the order
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get all items for this order
     */
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Get all payments for this order
     */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    /**
     * Get all notifications for this order
     */
    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class);
    }

    /**
     * Get all complaints for this order
     */
    public function complaints(): HasMany
    {
        return $this->hasMany(Complaint::class);
    }

    /**
     * Scope to filter orders by status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope to filter paid orders
     */
    public function scopePaid($query)
    {
        return $query->where('is_paid', true);
    }

    /**
     * Scope to filter unpaid orders
     */
    public function scopeUnpaid($query)
    {
        return $query->where('is_paid', false);
    }

    /**
     * Check if order can be cancelled
     */
    public function canBeCancelled(): bool
    {
        return in_array($this->status, ['pending', 'processing']);
    }

    /**
     * Check if order can be modified
     */
    public function canBeModified(): bool
    {
        return in_array($this->status, ['pending']);
    }

    /**
     * Get status display name in Vietnamese
     */
    public function getStatusDisplayAttribute(): string
    {
        $statusMap = [
            'pending' => 'Chờ xử lý',
            'processing' => 'Đang xử lý',
            'shipped' => 'Đã gửi hàng',
            'delivered' => 'Đã giao hàng',
            'cancelled' => 'Đã hủy',
            'completed' => 'Hoàn thành'
        ];

        return $statusMap[$this->status] ?? $this->status;
    }
}