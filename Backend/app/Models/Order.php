<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

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
    ];

    public function items()
    {
        return $this->hasMany(\App\Models\OrderItem::class);
    }
}
