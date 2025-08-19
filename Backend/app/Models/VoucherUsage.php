<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VoucherUsage extends Model
{
    use HasFactory;

    protected $table = 'voucher_usage';
    public $timestamps = false;

    protected $fillable = [
        'voucher_id',
        'user_id',
        'order_id',
        'discount_amount',
        'used_at'
    ];

    protected $casts = [
        'used_at' => 'datetime',
        'discount_amount' => 'decimal:2'
    ];

    public function voucher()
    {
        return $this->belongsTo(Voucher::class, 'voucher_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function order()
    {
        return $this->belongsTo(Order::class, 'order_id');
    }
}
