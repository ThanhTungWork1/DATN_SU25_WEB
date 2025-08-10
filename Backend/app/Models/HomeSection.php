<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HomeSection extends Model
{
    protected $fillable = ['name', 'title', 'description', 'status'];


    public function products()
    {
        return $this->belongsToMany(Product::class, 'home_section_products')
            ->withPivot('sort_order')
            ->orderBy('sort_order');
    }
}


