<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HomeSectionProduct extends Model
{
    protected $fillable = ['home_section_id', 'product_id', 'sort_order'];

    public function section()
    {
        return $this->belongsTo(HomeSection::class, 'home_section_id');
    }

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id');
    }
}
