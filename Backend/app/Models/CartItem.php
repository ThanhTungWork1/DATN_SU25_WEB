<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CartItem extends Model
{
    use HasFactory;

  // Thêm dòng này để Laravel biết tên bảng chính xác
    protected $table = 'cartitems';

    protected $fillable = [
        'cart_id',
        'variant_id',
        'quantity',
        'price'
    ];

    // Add appends to include computed attributes
    protected $appends = ['name', 'image'];

    public function cart()
    {
        return $this->belongsTo(Cart::class);
    }

    public function productVariant()
    {
        return $this->belongsTo(ProductVariant::class, 'variant_id');
    }

    // Add accessor to get product name from variant's product
    public function getNameAttribute()
    {
        if ($this->productVariant && $this->productVariant->product) {
            return $this->productVariant->product->name;
        }
        return 'Unknown Product';
    }

    // Add accessor to get product image from variant or product
    public function getImageAttribute()
    {
        // First try to get image from variant
        if ($this->productVariant && $this->productVariant->image_url) {
            return $this->productVariant->image_url;
        }
        // Then try to get image from product
        if ($this->productVariant && $this->productVariant->product && $this->productVariant->product->image_url) {
            return $this->productVariant->product->image_url;
        }
        return null;
    }
}
