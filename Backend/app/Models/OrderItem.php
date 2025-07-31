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
        'variant_id',
        'quantity',
        'price',
        'product_name',
        'variant_color_name',
        'variant_size_name',
        'variant_sku',
        'variant_image',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'price' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    protected $appends = ['variant_image_url', 'subtotal'];

    /**
     * Get the full URL for variant image
     */
    public function getVariantImageUrlAttribute()
    {
        if ($this->variant_image && Storage::disk('public')->exists($this->variant_image)) {
            return asset('storage/' . $this->variant_image);
        }
        return null;
    }

    /**
     * Calculate subtotal for this item (price * quantity)
     */
    public function getSubtotalAttribute()
    {
        return $this->price * $this->quantity;
    }

    /**
     * Get the order that owns this item
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Get the product variant (if still exists)
     */
    public function variant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class, 'variant_id');
    }

    /**
     * Check if the variant still exists and is available
     */
    public function isVariantAvailable(): bool
    {
        return $this->variant && $this->variant->stock > 0;
    }

    /**
     * Get variant display name combining product, color, and size
     */
    public function getVariantDisplayNameAttribute(): string
    {
        $parts = array_filter([
            $this->product_name,
            $this->variant_color_name ? "Màu: {$this->variant_color_name}" : null,
            $this->variant_size_name ? "Size: {$this->variant_size_name}" : null
        ]);

        return implode(' - ', $parts);
    }
}