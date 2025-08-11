<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $fillable = [
        'order_id', 
        'method', 
        'status', 
        'amount', 
        'paid_at',
        'transaction_id',
        'bank_code',
        'payment_method',
        'gateway_response'
    ];

    protected $casts = [
        'paid_at' => 'datetime',
        'gateway_response' => 'array'
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
