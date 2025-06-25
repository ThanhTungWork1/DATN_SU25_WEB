<?php

namespace App\Http\Controllers\Client;

use Illuminate\Http\Request;
use App\Models\Product;

class CartController extends \App\Http\Controllers\Controller
{
    public function index(Request $request)
    {
        $cart = session()->get('cart', []);

        return response()->json(['cart' => $cart]);
    }

    public function add(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
        ]);
        $product = Product::findOrFail($request->product_id);
        $cart = session()->get('cart', []);

        if (isset($cart[$product->id])) {
            $cart[$product->id]['quantity'] += $request->quantity;
        } else {
            $cart[$product->id] = [
                "name" => $product->name,
                "price" => $product->price,
                "quantity" => $request->quantity,
            ];
        }

        session()->put('cart', $cart);
        return response()->json(['message' => 'Đã thêm vào giỏ hàng!', 'cart' => $cart]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
        ]);
        $cart = session()->get('cart', []);
        $productId = $request->product_id;
        $quantity = $request->quantity;

        if (isset($cart[$productId])) {
            $cart[$productId]['quantity'] = $quantity;
            session()->put('cart', $cart);
        }
        return response()->json(['message' => 'Cập nhật giỏ hàng thành công!', 'cart' => $cart]);
    }

    public function remove(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
        ]);
        $cart = session()->get('cart', []);
        $productId = $request->product_id;

        if (isset($cart[$productId])) {
            unset($cart[$productId]);
            session()->put('cart', $cart);
        }
        return response()->json(['message' => 'Đã xóa sản phẩm khỏi giỏ hàng!', 'cart' => $cart]);
    }
}
