<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    protected $fillable = [
        'user_id',
        'order_code',
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
        'final_amount',
        'customer_name',
        'customer_email',
        'customer_phone',
        'delivered_at',
        'shipping_date',
        'estimated_delivery_date',
        'tracking_number',
        'shipping_company',
        'voucher_id', // giữ lại từ code cũ
        'created_at',
        'updated_at',
    ];

    /**
     * Thêm 'total_quantity' và 'calculated_final_amount' vào mảng appends
     */
    protected $appends = ['total_quantity', 'calculated_final_amount'];

    /**
     * Boot method để tự động tạo order_code khi tạo order mới
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($order) {
            if (empty($order->order_code)) {
                // Sử dụng ngày đặt hàng thực tế để tạo mã
                $orderDate = $order->created_at ? \Carbon\Carbon::parse($order->created_at) : null;
                $order->order_code = self::generateOrderCode($orderDate);
            }
        });
    }

    /**
     * Tạo mã đơn hàng tự động
     * Format: ORD-YYYYMMDD-XXXX (VD: ORD-20250731-0001)
     */
    public static function generateOrderCode($orderDate = null)
    {
        $date = $orderDate ? $orderDate->format('Ymd') : now()->format('Ymd');
        $prefix = "ORD-{$date}-";

        $lastOrder = self::where('order_code', 'like', $prefix . '%')
            ->orderBy('order_code', 'desc')
            ->first();

        if ($lastOrder) {
            $lastNumber = (int) substr($lastOrder->order_code, -4);
            $nextNumber = $lastNumber + 1;
        } else {
            $nextNumber = 1;
        }

        return $prefix . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Accessor tính tổng số lượng sản phẩm trong đơn
     */
    public function getTotalQuantityAttribute()
    {
        return $this->items->sum('quantity');
    }

    /**
     * Accessor tính toán lại final_amount từ items
     */
    public function getCalculatedFinalAmountAttribute()
    {
        if ($this->items->isEmpty()) {
            return 0;
        }

        $totalFromItems = $this->items->sum(function ($item) {
            return $item->price * $item->quantity;
        });

        $calculatedAmount = $totalFromItems + $this->shipping_fee - $this->discount_amount;

        return max(0, $calculatedAmount);
    }

    /**
     * Quan hệ: Một đơn hàng có nhiều sản phẩm
     */
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Quan hệ: Một đơn hàng có nhiều thanh toán
     */
    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    /**
     * Quan hệ: Một đơn hàng có thể có một voucher
     */
    public function voucher()
    {
        return $this->belongsTo(Voucher::class);
    }
}
