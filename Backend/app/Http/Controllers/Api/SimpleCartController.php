<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class SimpleCartController extends Controller
{
    public function index()
    {
        try {
            $userId = Auth::id();
            if (!$userId) {
                return response()->json(['message' => 'User not authenticated'], 401);
            }

            $cart = Cart::with([
                'cartItems.productVariant.product',
                'cartItems.productVariant.color',
                'cartItems.productVariant.size'
            ])->where('user_id', $userId)->latest()->first();

            if (!$cart) {
                return response()->json([
                    'message' => 'No cart found',
                    'cart_items' => []
                ]);
            }

            $cartItems = $cart->cartItems->map(function ($item) {
                $variant = $item->productVariant;
                $product = $variant ? $variant->product : null;

                return [
                    'id' => $item->id,
                    'product_id' => $product ? $product->id : null,
                    'variant_id' => $item->variant_id,
                    'name' => $product ? $product->name : 'Unknown Product',
                    'price' => $variant ? $variant->price : $item->price,
                    'quantity' => $item->quantity,
                    'image' => $product ? $product->image_url : null,
                    'color' => $variant && $variant->color ? $variant->color->name : null,
                    'size' => $variant && $variant->size ? $variant->size->name : null,
                ];
            });

            return response()->json([
                'id' => $cart->id,
                'user_id' => $cart->user_id,
                'cart_items' => $cartItems,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Server error',
                'message' => $e->getMessage(),
                'line' => $e->getLine()
            ], 500);
        }
    }

    public function addToCart(Request $request)
    {
        try {
            $userId = Auth::id();
            if (!$userId) {
                return response()->json(['message' => 'User not authenticated'], 401);
            }

            $variantId = $request->input('variant_id', 1); // Default to 1
            $quantity = $request->input('quantity', 1);

            // Find or create cart
            $cart = Cart::firstOrCreate(['user_id' => $userId]);

            // Check if item already exists
            $existingItem = CartItem::where('cart_id', $cart->id)
                ->where('variant_id', $variantId)
                ->first();

            if ($existingItem) {
                $existingItem->quantity += $quantity;
                $existingItem->save();
            } else {
                CartItem::create([
                    'cart_id' => $cart->id,
                    'variant_id' => $variantId,
                    'quantity' => $quantity,
                    'price' => 94.00 // Default price
                ]);
            }

            return response()->json(['message' => 'Added to cart successfully']);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Server error',
                'message' => $e->getMessage(),
                'line' => $e->getLine()
            ], 500);
        }
    }
}
