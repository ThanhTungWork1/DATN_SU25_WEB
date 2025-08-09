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
        // Log::info('---[PRODUCT MODEL] Gọi quan hệ variants');
        return $this->hasMany(ProductVariant::class);
    }

    /**
     * SỬA LỖI: Dùng hàm asset() để tạo URL đầy đủ và chính xác.
     * Đây là cách làm đúng chuẩn của Laravel.
     */
    public function getImageUrlAttribute()
    {
        // Log::info('🔍 [MODEL DEBUG] getImageUrlAttribute called for product ID: ' . $this->id);
        // Log::info('🔍 [MODEL DEBUG] Raw image field: ' . $this->image);
        
        if ($this->image) {
            // Kiểm tra nếu là URL external (bắt đầu bằng http/https)
            if (filter_var($this->image, FILTER_VALIDATE_URL)) {
                // Log::info('🔍 [MODEL DEBUG] External URL detected, returning as is: ' . $this->image);
                return $this->image;
            }
            
            // Xử lý file local trong storage
            $exists = Storage::disk('public')->exists($this->image);
            // Log::info('🔍 [MODEL DEBUG] Storage exists check: ' . ($exists ? 'true' : 'false'));
            
            if ($exists) {
                $url = asset('storage/' . $this->image);
                // Log::info('🔍 [MODEL DEBUG] Local image exists, URL generated: ' . $url);
                return $url;
            } else {
                // Log::info('🔍 [MODEL DEBUG] Local image file not found in storage');
            }
        }
        
        // Log::info('🔍 [MODEL DEBUG] Image not found or null, returning null');
        return null;
    }

    /**
     * SỬA LỖI: Dùng hàm asset() cho cả ảnh hover.
     */
    public function getHoverImageUrlAttribute()
    {
        // Log::info('🔍 [MODEL DEBUG] getHoverImageUrlAttribute called for product ID: ' . $this->id);
        // Log::info('🔍 [MODEL DEBUG] Raw hover_image field: ' . $this->hover_image);
        
        if ($this->hover_image) {
            // Kiểm tra nếu là URL external (bắt đầu bằng http/https)
            if (filter_var($this->hover_image, FILTER_VALIDATE_URL)) {
                // Log::info('🔍 [MODEL DEBUG] External hover URL detected, returning as is: ' . $this->hover_image);
                return $this->hover_image;
            }
            
            // Xử lý file local trong storage
            if (Storage::disk('public')->exists($this->hover_image)) {
                $url = asset('storage/' . $this->hover_image);
                // Log::info('🔍 [MODEL DEBUG] Local hover image exists, URL generated: ' . $url);
                return $url;
            } else {
                // Log::info('🔍 [MODEL DEBUG] Local hover image file not found in storage');
            }
        }
        
        // Log::info('🔍 [MODEL DEBUG] Hover image not found or null, returning null');
        return null;
    }

    public function category()
    {
        // Log::info('---[PRODUCT MODEL] Gọi quan hệ category');
        return $this->belongsTo(Category::class);
    }
}