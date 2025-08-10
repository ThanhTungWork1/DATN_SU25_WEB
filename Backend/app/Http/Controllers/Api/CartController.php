<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class CartController extends Controller
{
    public function __construct(
        protected Cart $model,
        protected CartItem $cartItemModel,
    ) {}

    /**
     * Lấy thông tin giỏ hàng của người dùng đang đăng nhập.
     */
    public function index()
    {
        $userId = Auth::id();
        $cart = Cart::with(['cartItems.variant.product', 'cartItems.variant.color', 'cartItems.variant.size'])->where('user_id', $userId)->latest()->first();
        if (!$cart) {
            // Trả về một giỏ hàng trống thay vì lỗi 404 để frontend xử lý dễ dàng hơn
            return response()->json([
                'message' => 'Giỏ hàng trống.',
                'cart' => null
            ], 200);
        }

        // Đảm bảo image_url được include trong response
        if ($cart && $cart->cartItems) {
            foreach ($cart->cartItems as $cartItem) {
                if ($cartItem->variant && $cartItem->variant->product) {
                    // Force load image_url accessors
                    $cartItem->variant->product->makeVisible(['image_url', 'hover_image_url']);
                }
            }
        }

        return response()->json(['cart' => $cart]);
    }

    /**
     * Thêm một hoặc nhiều sản phẩm vào giỏ hàng.
     * Xử lý một mảng 'cartItems' từ request.
     */
    public function store(Request $request)
    {
        return DB::transaction(function () use ($request) {
            $userId = Auth::id();
            if (!$userId) {
                return response()->json(['message' => 'Người dùng chưa đăng nhập!'], 401);
            }

            // Validate input - xử lý một mảng các sản phẩm
            $data = $request->validate([
                'cartItems' => 'required|array|min:1',
                'cartItems.*.variant_id' => 'required|exists:product_variants,id',
                'cartItems.*.quantity' => 'required|integer|min:1',
                'cartItems.*.price' => 'required|numeric|min:0'
            ]);

            // Tìm hoặc tạo mới giỏ hàng cho người dùng
            $cart = Cart::firstOrCreate(['user_id' => $userId]);
            
            // Log để debug
            \Log::info('Cart store request', [
                'user_id' => $userId,
                'cart_id' => $cart->id,
                'items_to_add' => $data['cartItems'],
                'existing_items_count' => $cart->cartItems()->count()
            ]);

            foreach ($data['cartItems'] as $item) {
                // Kiểm tra xem sản phẩm đã tồn tại trong giỏ hàng chưa
                $existingItem = $cart->cartItems()->where('variant_id', $item['variant_id'])->first();

                if ($existingItem) {
                    // Nếu đã tồn tại, cập nhật số lượng
                    $existingItem->quantity += $item['quantity'];
                    $existingItem->save();
                } else {
                    // Nếu chưa, tạo mới cart item
                    $cart->cartItems()->create([
                        'variant_id' => $item['variant_id'],
                        'quantity' => $item['quantity'],
                        'price' => $item['price']
                    ]);
                }
            }

            // Tải lại toàn bộ thông tin giỏ hàng sau khi cập nhật
            $cart->load(['cartItems.variant.product', 'cartItems.variant.color', 'cartItems.variant.size']);

            return response()->json([
                'message' => 'Thêm sản phẩm vào giỏ hàng thành công!',
                'cart' => $cart
            ], 200);
        });
    }

    /**
     * Route phụ để tương thích với các định nghĩa route cũ hơn.
     */
    public function addToCart(Request $request)
    {
        return $this->store($request);
    }

    /**
     * Hiển thị một giỏ hàng cụ thể.
     */
    public function show($id)
    {
        $userId = Auth::id();
        $cart = Cart::with('cartItems.variant.product')->where('user_id', $userId)->where('id', $id)->first();
        if (!$cart) {
            return response()->json(['message' => 'Không tìm thấy giỏ hàng!'], 404);
        }
        return response()->json($cart);
    }

    /**
     * Xóa một giỏ hàng cụ thể.
     */
    public function destroy($id)
    {
        $userId = Auth::id();
        $cart = Cart::where('user_id', $userId)->where('id', $id)->first();
        if (!$cart) {
            return response()->json(['message' => 'Không tìm thấy giỏ hàng!'], 404);
        }
        $cart->cartItems()->delete();
        $cart->delete();
        return response()->json(['message' => 'Đã xóa giỏ hàng!']);
    }

    /**
     * Xóa toàn bộ sản phẩm khỏi giỏ hàng của người dùng.
     */
    public function clearCart()
    {
        $userId = Auth::id();
        if (!$userId) {
            return response()->json(['message' => 'Người dùng chưa đăng nhập!'], 401);
        }

        $cart = Cart::where('user_id', $userId)->first();
        if ($cart) {
            $cart->cartItems()->delete();
            return response()->json(['message' => 'Đã xóa toàn bộ giỏ hàng!']);
        }
        
        return response()->json(['message' => 'Giỏ hàng đã trống!']);
    }

    /**
     * Cập nhật số lượng của một sản phẩm trong giỏ hàng.
     */
    public function updateCartItem(Request $request, $id)
    {
        $userId = Auth::id();
        if (!$userId) {
            return response()->json(['message' => 'Người dùng chưa đăng nhập!'], 401);
        }

        $data = $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        $cartItem = CartItem::whereHas('cart', function($query) use ($userId) {
            $query->where('user_id', $userId);
        })->where('id', $id)->first();

        if (!$cartItem) {
            return response()->json(['message' => 'Không tìm thấy sản phẩm trong giỏ hàng!'], 404);
        }

        $cartItem->quantity = $data['quantity'];
        $cartItem->save();

        return response()->json([
            'message' => 'Cập nhật số lượng thành công!',
            'cartItem' => $cartItem
        ]);
    }

    /**
     * Xóa một sản phẩm cụ thể khỏi giỏ hàng.
     */
    public function removeCartItem($id)
    {
        $userId = Auth::id();
        if (!$userId) {
            return response()->json(['message' => 'Người dùng chưa đăng nhập!'], 401);
        }

        $cartItem = CartItem::whereHas('cart', function($query) use ($userId) {
            $query->where('user_id', $userId);
        })->where('id', $id)->first();

        if (!$cartItem) {
            return response()->json(['message' => 'Không tìm thấy sản phẩm trong giỏ hàng!'], 404);
        }

        $cartItem->delete();
        return response()->json(['message' => 'Đã xóa sản phẩm khỏi giỏ hàng!']);
    }


}