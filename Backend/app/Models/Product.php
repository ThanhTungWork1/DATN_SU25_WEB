<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

class Product extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'slug',
        'description',
        'price',
        'old_price',
        'status',
        'category_id',
        'material',
        // 'discount',
        'sold',
        'image',
        'hover_image',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'status' => 'boolean',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array
     */
    protected $appends = ['image_url', 'hover_image_url'];

    /**
     * Định nghĩa mối quan hệ "một-nhiều" với ProductVariant.
     */
    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class);
    }

    /**
     * Accessor để lấy URL đầy đủ của ảnh chính.
     */
    public function getImageUrlAttribute()
    {
        if ($this->image && Storage::disk('public')->exists($this->image)) {
            return Storage::url($this->image);
        }
        return null; // Hoặc trả về một ảnh placeholder
    }

    /**
     * Accessor để lấy URL đầy đủ của ảnh hover.
     */
    public function getHoverImageUrlAttribute()
    {
        if ($this->hover_image && Storage::disk('public')->exists($this->hover_image)) {
            return Storage::url($this->hover_image);
        }
        return null;
    }
}
