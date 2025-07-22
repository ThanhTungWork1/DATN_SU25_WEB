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
        'created_at',
        'updated_at',
    ];
    protected $casts = [
        'is_paid' => 'boolean',
        'sold_number' => 'decimal:10,2', // Định dạng số thập phân
    ];
    public function items()
    {
        return $this->hasMany(\App\Models\OrderItem::class);
    }
}