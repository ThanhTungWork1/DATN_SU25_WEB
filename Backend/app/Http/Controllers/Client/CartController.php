<?php

namespace App\Http\Controllers\Client;

use Illuminate\Http\Request;
use App\Models\Product;
use App\Models\Cart;
use App\Models\CartItem;
use Illuminate\Support\Facades\Auth;

class CartController extends \App\Http\Controllers\Controller
{
    // Lấy giỏ hàng
    public function index(Request $request)
    {
        $userId = Auth::id();
        $cart = Cart::where('user_id', $userId)->first();

        $items = [];
        if ($cart) {
            $items = CartItem::with('product')->where('cart_id', $cart->id)->get();
        }

        return response()->json(['cart_items' => $items]);
    }

    // Thêm sản phẩm vào giỏ hàng
    public function add(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
        ]);
        $userId = Auth::id();

        // Tìm hoặc tạo cart cho user
        $cart = Cart::firstOrCreate(['user_id' => $userId]);

        // Kiểm tra sản phẩm đã có trong cart chưa
        $cartItem = CartItem::where('cart_id', $cart->id)
            ->where('product_id', $request->product_id)
            ->first();

        $product = Product::findOrFail($request->product_id);

        if ($cartItem) {
            $cartItem->quantity += $request->quantity;
            $cartItem->save();
        } else {
            CartItem::create([
                'cart_id' => $cart->id,
                'product_id' => $product->id,
                'quantity' => $request->quantity,
                'price' => $product->price,
            ]);
        }

        $items = CartItem::with('product')->where('cart_id', $cart->id)->get();

        return response()->json(['message' => 'Đã thêm vào giỏ hàng!', 'cart_items' => $items]);
    }

    // Cập nhật số lượng sản phẩm trong giỏ hàng
    public function update(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
        ]);
        $userId = Auth::id();
        $cart = Cart::where('user_id', $userId)->first();

        if (!$cart) {
            return response()->json(['message' => 'Giỏ hàng trống!'], 404);
        }

        $cartItem = CartItem::where('cart_id', $cart->id)
            ->where('product_id', $request->product_id)
            ->first();

        if ($cartItem) {
            $cartItem->quantity = $request->quantity;
            $cartItem->save();
        }

        $items = CartItem::with('product')->where('cart_id', $cart->id)->get();

        return response()->json(['message' => 'Cập nhật giỏ hàng thành công!', 'cart_items' => $items]);
    }

    // Xóa sản phẩm khỏi giỏ hàng
    public function remove(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
        ]);
        $userId = Auth::id();
        $cart = Cart::where('user_id', $userId)->first();

        if ($cart) {
            CartItem::where('cart_id', $cart->id)
                ->where('product_id', $request->product_id)
                ->delete();
        }

        $items = $cart ? CartItem::with('product')->where('cart_id', $cart->id)->get() : [];

        return response()->json(['message' => 'Đã xóa sản phẩm khỏi giỏ hàng!', 'cart_items' => $items]);
    }
}
