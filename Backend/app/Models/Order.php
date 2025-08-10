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
        'notes',
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
        'created_at',
        'updated_at',
    ];
   /**
     * THÊM MỚI: Thêm 'total_quantity' vào mảng appends.
     * Điều này sẽ tự động thêm trường 'total_quantity' vào mỗi khi
     * một đối tượng Order được chuyển thành JSON để gửi về frontend.
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
     * Sử dụng ngày đặt hàng thực tế, không phải ngày hiện tại
     */
    public static function generateOrderCode($orderDate = null)
    {
        // Sử dụng ngày đặt hàng nếu có, không thì dùng ngày hiện tại
        $date = $orderDate ? $orderDate->format('Ymd') : now()->format('Ymd');
        $prefix = "ORD-{$date}-";
        
        // Tìm số thứ tự cuối cùng của ngày đó
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
     * THÊM MỚI: Accessor để tính toán tổng số lượng sản phẩm.
     * Tên hàm phải là get...Attribute và theo dạng camelCase.
     */
    public function getTotalQuantityAttribute()
    {
        // Hàm này sẽ tính tổng của cột 'quantity' từ tất cả các 'items'
        // liên quan đến đơn hàng này.
        return $this->items->sum('quantity');
    }

    /**
     * THÊM MỚI: Accessor để tính toán lại final_amount từ items.
     * Sử dụng khi final_amount trong database không chính xác.
     */
    public function getCalculatedFinalAmountAttribute()
    {
        // Nếu không có items, trả về 0
        if ($this->items->isEmpty()) {
            return 0;
        }
        
        // Tính tổng tiền từ items
        $totalFromItems = $this->items->sum(function($item) {
            return $item->price * $item->quantity;
        });
        
        // Thêm phí vận chuyển và trừ giảm giá
        $calculatedAmount = $totalFromItems + $this->shipping_fee - $this->discount_amount;
        
        return max(0, $calculatedAmount); // Đảm bảo không âm
    }

    /**
     * Một đơn hàng có nhiều sản phẩm (items).
     */
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}