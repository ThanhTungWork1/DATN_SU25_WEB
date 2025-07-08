<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Color extends Model
{
    use HasFactory;

    protected $fillable = [
<<<<<<< HEAD
        'name'
=======
        'name',
        'hex_code'
>>>>>>> origin/feat/auth
    ];

    public function productVariants()
    {
        return $this->hasMany(ProductVariant::class);
    }
<<<<<<< HEAD
=======

    public function variants()
    {
        return $this->hasMany(ProductVariant::class);
    }
>>>>>>> origin/feat/auth
}
