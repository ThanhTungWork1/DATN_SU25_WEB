<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

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
         'final_amount',
        'created_at',
        'updated_at',
    ];
   /**
     * THÊM MỚI: Thêm 'total_quantity' vào mảng appends.
     * Điều này sẽ tự động thêm trường 'total_quantity' vào mỗi khi
     * một đối tượng Order được chuyển thành JSON để gửi về frontend.
     */
    protected $appends = ['total_quantity'];

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
     * Một đơn hàng có nhiều sản phẩm (items).
     */
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}