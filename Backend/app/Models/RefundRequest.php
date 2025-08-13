<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class RefundRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'user_id',
        'amount',
        'reason',
        'bank_account_name',
        'bank_account_number',
        'bank_name',
        'evidence_image',
        'status',
    ];
}
