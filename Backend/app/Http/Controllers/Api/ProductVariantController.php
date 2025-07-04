<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProductVariant;

class ProductVariantController extends Controller
{
    public function byProduct($productId)
    {
        $variants = ProductVariant::where('product_id', $productId)->with(['color', 'size'])->get();
        return response()->json($variants);
    }
}
