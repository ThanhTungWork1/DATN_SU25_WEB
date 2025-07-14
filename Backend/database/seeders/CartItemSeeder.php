<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\CartItem;

class CartItemSeeder extends Seeder
{
    public function run()
    {
        CartItem::create([
            'cart_id' => 1,
            'variant_id' => 2,
            'product_id' => 1,
            'quantity' => 1,
            'price' => 199000  // hoặc giá phù hợp tùy sp
        ]);
    }
}
