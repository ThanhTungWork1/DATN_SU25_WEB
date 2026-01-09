<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'order_code',
        'user_id',
        'total_amount',
        'shipping_fee',
        'is_paid',
        'status',
        'customer_name',
        'customer_email',
        'customer_phone',
        'delivered_at',
        'shipping_date',
        'estimated_delivery_date',
        'tracking_number',
        'shipping_company',
        'order_source',
        'priority',
        'shipping_address',
        'shipping_phone',
        'shipping_name',
        'note', // ghi chú khách hàng
        'notes', // ghi chú nội bộ
        'payment_method',
        'discount_amount',
        'final_amount',
        'voucher_id'
    ];

    public function items()
    {
        return $this->hasMany(\App\Models\OrderItem::class);
    }
    public function voucher()
    {
        return $this->belongsTo(Voucher::class);
    }

}
