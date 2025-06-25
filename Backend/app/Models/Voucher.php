<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Voucher extends Model
{
    protected $fillable = [
        'title', 'code', 'value', 'max_value', 'quantity',
        'description', 'start_date', 'end_date', 'status'
    ];
}
