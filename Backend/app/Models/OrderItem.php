<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class OrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'variant_id', // SỬA LẠI TẠI ĐÂY
        'quantity',
        'price',
        'product_name',
        'variant_color_name',
        'variant_size_name',
        'variant_sku',
        'variant_image',
    ];

    protected $appends = ['variant_image_url'];

    public function getVariantImageUrlAttribute()
    {
        if ($this->variant_image && Storage::disk('public')->exists($this->variant_image)) {
            return asset('storage/' . $this->variant_image);
        }
        return null;
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function variant(): BelongsTo
    {
        // SỬA LẠI TẠI ĐÂY: Chỉ định rõ khóa ngoại là 'variant_id'
        return $this->belongsTo(ProductVariant::class, 'variant_id');
    }
}