<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Size extends Model
{
    use HasFactory;

    protected $fillable = [
        'name'
    ];

    public function productVariants()
    {
        return $this->hasMany(ProductVariant::class);
    }

    public function variants()
    {
        return $this->hasMany(ProductVariant::class);
    }
}
