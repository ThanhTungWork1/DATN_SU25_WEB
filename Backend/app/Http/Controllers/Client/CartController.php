<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;

class CartController extends Controller
{
    // Lấy giỏ hàng của user
    public function index(Request $request)
    {
        $user = $request->user();
        $cart = session()->get("cart_{$user->id}", []);

        $cartItems = [];
        $total = 0;

        foreach ($cart as $productId => $quantity) {
            $product = Product::where('status', 1)->find($productId);
            if ($product) {
                $price = $product->discount ? $product->price * (1 - $product->discount / 100) : $product->price;
                $cartItems[] = [
                    'product_id' => $product->id,
                    'name' => $product->name,
                    'price' => $product->price,
                    'discount' => $product->discount,
                    'final_price' => $price,
                    'quantity' => $quantity,
                    'subtotal' => $price * $quantity,
                    'image' => $product->image
                ];
                $total += $price * $quantity;
            }
        }

        return Response::json([
            'data' => [
                'items' => $cartItems,
                'total' => $total,
                'item_count' => count($cartItems)
            ],
            'message' => 'Success',
            'status_code' => 200
        ], 200);
    }

    // Thêm sản phẩm vào giỏ hàng
    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1'
        ]);

        $user = $request->user();
        $productId = $request->product_id;
        $quantity = $request->quantity;

        // Kiểm tra sản phẩm có active không
        $product = Product::where('status', 1)->find($productId);
        if (!$product) {
            return Response::json([
                'message' => 'Sản phẩm không tồn tại hoặc đã bị ẩn',
                'status_code' => 404
            ], 404);
        }

        $cart = session()->get("cart_{$user->id}", []);

        if (isset($cart[$productId])) {
            $cart[$productId] += $quantity;
        } else {
            $cart[$productId] = $quantity;
        }

        session()->put("cart_{$user->id}", $cart);

        return Response::json([
            'message' => 'Sản phẩm đã được thêm vào giỏ hàng',
            'status_code' => 200
        ], 200);
    }

    // Cập nhật số lượng sản phẩm trong giỏ hàng
    public function update(Request $request, $productId)
    {
        $request->validate([
            'quantity' => 'required|integer|min:1'
        ]);

        $user = $request->user();
        $quantity = $request->quantity;

        $cart = session()->get("cart_{$user->id}", []);

        if (isset($cart[$productId])) {
            $cart[$productId] = $quantity;
            session()->put("cart_{$user->id}", $cart);

            return Response::json([
                'message' => 'Cập nhật số lượng thành công',
                'status_code' => 200
            ], 200);
        }

        return Response::json([
            'message' => 'Sản phẩm không có trong giỏ hàng',
            'status_code' => 404
        ], 404);
    }

    // Xóa sản phẩm khỏi giỏ hàng
    public function destroy(Request $request, $productId)
    {
        $user = $request->user();
        $cart = session()->get("cart_{$user->id}", []);

        if (isset($cart[$productId])) {
            unset($cart[$productId]);
            session()->put("cart_{$user->id}", $cart);

            return Response::json([
                'message' => 'Đã xóa sản phẩm khỏi giỏ hàng',
                'status_code' => 200
            ], 200);
        }

        return Response::json([
            'message' => 'Sản phẩm không có trong giỏ hàng',
            'status_code' => 404
        ], 404);
    }

    // Xóa toàn bộ giỏ hàng
    public function clear(Request $request)
    {
        $user = $request->user();
        session()->forget("cart_{$user->id}");

        return Response::json([
            'message' => 'Đã xóa toàn bộ giỏ hàng',
            'status_code' => 200
        ], 200);
    }
}
