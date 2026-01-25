<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Contact extends Model
{
    protected $fillable = ['name', 'email', 'phone', 'message', 'status'];

    public function getStatusTextAttribute()
    {
        return match ($this->status) {
            0 => 'Chưa xử lý',
            1 => 'Đang xử lý',
            2 => 'Đã xử lý',
            default => 'Không rõ',
        };
    }
}
