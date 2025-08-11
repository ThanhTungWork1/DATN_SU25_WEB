<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Color;
use App\Models\Size;
use Illuminate\Support\Facades\Storage;

class ProductVariant extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'color_id',
        'size_id',
        'stock',
        'stock_reserved',
        'stock_available',
        'price',
        'old_price',
        'image',
        'sku'
    ];

    // protected static function booted()
    // {
    //     static::creating(function ($variant) {
    //         \Log::info('🔍 [MODEL DEBUG] Creating ProductVariant with data:', $variant->toArray());
    //     });

    //     static::created(function ($variant) {
    //         \Log::info('🔍 [MODEL DEBUG] ProductVariant created successfully with ID: ' . $variant->id);
    //     });
    // }

     protected $appends = ['image_url'];

    public function getImageUrlAttribute()
    {
        if ($this->image) {
            // Nếu là URL tuyệt đối, trả nguyên vẹn
            if (filter_var($this->image, FILTER_VALIDATE_URL)) {
                return $this->image;
            }
            // Nếu là path lưu trong storage/public
            if (Storage::disk('public')->exists($this->image)) {
                // asset() sẽ tự động lấy APP_URL từ .env và tạo ra đường dẫn hoàn chỉnh
                return asset('storage/' . $this->image);
            }
        }
        return null;
    }


    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function color()
    {
        return $this->belongsTo(Color::class);
    }

    public function size()
    {
        return $this->belongsTo(Size::class);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class, 'variant_id');
    }
    public function cartItems()
    {
        return $this->hasMany(CartItem::class);
    }
    /**
     * Update stock available based on stock and reserved
     */
    public function updateStockAvailable()
    {
        $this->stock_available = $this->stock - $this->stock_reserved;
        $this->save();
    }

    /**
     * Reserve stock for an order
     */
    public function reserveStock($quantity)
    {
        if ($this->stock_available >= $quantity) {
            $this->stock_reserved += $quantity;
            $this->updateStockAvailable();
            return true;
        }
        return false;
    }

    /**
     * Release reserved stock (when order is cancelled)
     */
    public function releaseStock($quantity)
    {
        if ($this->stock_reserved >= $quantity) {
            $this->stock_reserved -= $quantity;
            $this->updateStockAvailable();
            return true;
        }
        return false;
    }

    /**
     * Deduct stock (when order is confirmed)
     */
    public function deductStock($quantity)
    {
        if ($this->stock >= $quantity && $this->stock_reserved >= $quantity) {
            $this->stock -= $quantity;
            $this->stock_reserved -= $quantity;
            $this->updateStockAvailable();
            return true;
        }
        return false;
    }
}