<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

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
        Log::info('---[PRODUCT MODEL] Gọi quan hệ variants');
        return $this->hasMany(ProductVariant::class);
    }

    /**
     * SỬA LỖI: Dùng hàm asset() để tạo URL đầy đủ và chính xác.
     * Đây là cách làm đúng chuẩn của Laravel.
     */
    public function getImageUrlAttribute()
    {
        if ($this->image && Storage::disk('public')->exists($this->image)) {
            // asset() sẽ tự động lấy APP_URL từ .env và tạo ra đường dẫn hoàn chỉnh.
            return asset('storage/' . $this->image);
        }
        return null;
    }

    /**
     * SỬA LỖI: Dùng hàm asset() cho cả ảnh hover.
     */
    public function getHoverImageUrlAttribute()
    {
        if ($this->hover_image && Storage::disk('public')->exists($this->hover_image)) {
            return asset('storage/' . $this->hover_image);
        }
        return null;
    }

    public function category()
    {
        Log::info('---[PRODUCT MODEL] Gọi quan hệ category');
        return $this->belongsTo(Category::class);
    }
}