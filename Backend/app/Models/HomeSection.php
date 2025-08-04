<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class HomeSection extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'title',
        'description',
        'status',
    ];

    protected $casts = [
        'status' => 'boolean',
    ];

    public function products()
    {
        return $this->belongsToMany(Product::class, 'home_section_products')
            ->withPivot('sort_order')
            ->withTimestamps();
    }
}
