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
        'shipping_fee'
    ];

<<<<<<< HEAD

=======
>>>>>>> origin/feat/auth
    public function items()
    {
        return $this->hasMany(\App\Models\OrderItem::class);
    }
}
