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
     * Định nghĩa mối quan hệ "một-nhiều" với ProductVariant.
     */
    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class);
    }

    /**
     * Accessor: Lấy URL ảnh chính.
     */
    public function getImageUrlAttribute()
    {
        if ($this->image) {
            // Nếu là link ngoài
            if (filter_var($this->image, FILTER_VALIDATE_URL)) {
                return $this->image;
            }
            // Nếu là file local trong storage
            if (Storage::disk('public')->exists($this->image)) {
                return asset('storage/' . $this->image);
            }
        }
        return null;
    }

    /**
     * Accessor: Lấy URL ảnh hover.
     */
    public function getHoverImageUrlAttribute()
    {
        if ($this->hover_image) {
            // Nếu là link ngoài
            if (filter_var($this->hover_image, FILTER_VALIDATE_URL)) {
                return $this->hover_image;
            }
            // Nếu là file local trong storage
            if (Storage::disk('public')->exists($this->hover_image)) {
                return asset('storage/' . $this->hover_image);
            }
        }
        return null;
    }

    /**
     * Quan hệ: Product thuộc một Category.
     */
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Quan hệ: Product có nhiều Comment.
     */
    public function comments()
    {
        return $this->hasMany(Comment::class);
    }

    /**
     * Quan hệ: User yêu thích Product.
     */
    public function favoritedByUsers()
    {
        return $this->belongsToMany(User::class, 'favorites')->withTimestamps();
    }

    /**
     * Quan hệ: Product thuộc nhiều HomeSection.
     */
    public function homeSections()
    {
        return $this->belongsToMany(HomeSection::class, 'home_section_products')
            ->withPivot('sort_order')
            ->withTimestamps();
    }
}
