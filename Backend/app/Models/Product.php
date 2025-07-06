<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Laravel\Sanctum\HasApiTokens;
use App\Models\Category;

class Product extends Model
{

    protected $fillable = [
        'name',
        'slug',
        'description',
        'price',
        'discount',
        'image',
        'hover_image',
        'status',
        'category_id'
    ];
    protected $casts = [
        'status' => 'boolean',
        'price' => 'decimal:2',
        'discount' => 'decimal:2',
    ];
    public function variants()
    {
        return $this->hasMany(ProductVariant::class);
    }


    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }
    public function favoritedByUsers()
    {
        return $this->belongsToMany(User::class, 'favorites')->withTimestamps();
    }

}
