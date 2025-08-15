<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Cart\CreateCartRequest;
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
    
    public function index()
    {
        $userId = Auth::id();
        $cart = Cart::with([
            'cartItems.productVariant.product',
            'cartItems.productVariant.color',
            'cartItems.productVariant.size'
        ])->where('user_id', $userId)->latest()->first();
        
        if (!$cart) {
            return response()->json(['message' => 'Chưa có giỏ hàng nào!'], 404);
        }

        // Format cart items with complete product information
        $formattedCartItems = $cart->cartItems->map(function ($item) {
            $variant = $item->productVariant;
            $product = $variant ? $variant->product : null;
            
            return [
                'id' => $item->id,
                'product_id' => $product ? $product->id : null,
                'variant_id' => $item->variant_id,
                'name' => $product ? $product->name : 'Unknown Product',
                'price' => $item->price,
                'quantity' => $item->quantity,
                'image' => $this->getProductImage($variant, $product),
                'color' => $variant && $variant->color ? $variant->color->name : null,
                'size' => $variant && $variant->size ? $variant->size->name : null,
                'sku' => $variant ? $variant->sku : null,
                'stock' => $variant ? $variant->stock : null,
            ];
        });

        return response()->json([
            'id' => $cart->id,
            'user_id' => $cart->user_id,
            'cart_items' => $formattedCartItems,
            'created_at' => $cart->created_at,
            'updated_at' => $cart->updated_at,
        ]);
    }

    private function getProductImage($variant, $product)
    {
        // First try to get image from variant
        if ($variant && $variant->image_url) {
            return $variant->image_url;
        }
        // Then try to get image from product
        if ($product && $product->image_url) {
            return $product->image_url;
        }
        return null;
    }
    
     public function store(CreateCartRequest $request)
{
    return DB::transaction(function () use ($request) {
        $data = $request->validated();
        $userId = Auth::id();

        // 🔹 Lấy giỏ hàng hiện tại (nếu chưa có thì tạo mới)
        $cart = $this->model
            ->where('user_id', $userId)
            ->whereNull('status')
            ->latest()
            ->first();

        if (!$cart) {
            $cart = $this->model->create(['user_id' => $userId]);
        }

        // 🔹 Xử lý từng cartItem
        foreach ($data['cartItems'] as $item) {

            // Đảm bảo luôn có key variant_id
            $variantId = $item['variant_id'] ?? null;

            // Kiểm tra sản phẩm đã tồn tại chưa
            $existingCartItem = $cart->cartItems()
                ->where('product_id', $item['product_id'])
                ->where('variant_id', $variantId)
                ->first();

            if ($existingCartItem) {
                // Nếu có rồi -> cộng dồn số lượng
                $existingCartItem->quantity += $item['quantity'];
                $existingCartItem->save();
            } else {
                // Nếu chưa có -> tạo mới
                $cart->cartItems()->create([
                    'product_id' => $item['product_id'],
                    'variant_id' => $variantId,
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                ]);
            }
        }

        // Load lại dữ liệu giỏ hàng
        $cart->load('cartItems.product');

        return response()->json([
            'message' => 'Thêm giỏ hàng thành công!',
            'cart' => $cart
        ], 200);
    });
}


    public function show($id)
    {
        $userId = Auth::id();
        $cart = Cart::with([
            'cartItems.productVariant.product',
            'cartItems.productVariant.color',
            'cartItems.productVariant.size'
        ])->where('user_id', $userId)->where('id', $id)->first();
        
        if (!$cart) {
            return response()->json(['message' => 'Không tìm thấy giỏ hàng!'], 404);
        }

        // Format cart items with complete product information
        $formattedCartItems = $cart->cartItems->map(function ($item) {
            $variant = $item->productVariant;
            $product = $variant ? $variant->product : null;
            
            return [
                'id' => $item->id,
                'product_id' => $product ? $product->id : null,
                'variant_id' => $item->variant_id,
                'name' => $product ? $product->name : 'Unknown Product',
                'price' => $item->price,
                'quantity' => $item->quantity,
                'image' => $this->getProductImage($variant, $product),
                'color' => $variant && $variant->color ? $variant->color->name : null,
                'size' => $variant && $variant->size ? $variant->size->name : null,
                'sku' => $variant ? $variant->sku : null,
                'stock' => $variant ? $variant->stock : null,
            ];
        });

        return response()->json([
            'id' => $cart->id,
            'user_id' => $cart->user_id,
            'cart_items' => $formattedCartItems,
            'created_at' => $cart->created_at,
            'updated_at' => $cart->updated_at,
        ]);
    }

    public function update(Request $request, $id)
    {
        $userId = Auth::id();
        
        // Kiểm tra xem $id có phải là cart item ID không
        $cartItem = CartItem::whereHas('cart', function($query) use ($userId) {
            $query->where('user_id', $userId);
        })->where('id', $id)->first();
        
        if ($cartItem) {
            // Cập nhật cart item
            $data = $request->validate([
                'quantity' => 'required|integer|min:1',
            ]);
            $cartItem->quantity = $data['quantity'];
            $cartItem->save();
            return response()->json(['message' => 'Cập nhật số lượng thành công!']);
        }
        
        // Nếu không phải cart item, thử cập nhật cart
        $cart = Cart::where('user_id', $userId)->where('id', $id)->first();
        if (!$cart) {
            return response()->json(['message' => 'Không tìm thấy giỏ hàng hoặc sản phẩm!'], 404);
        }
        
        $data = $request->validate([
            'cartItems' => 'required|array',
            'cartItems.*.id' => 'required|exists:cart_items,id',
            'cartItems.*.quantity' => 'required|integer|min:1',
        ]);
        foreach ($data['cartItems'] as $item) {
            $cartItem = $cart->cartItems()->where('id', $item['id'])->first();
            if ($cartItem) {
                $cartItem->quantity = $item['quantity'];
                $cartItem->save();
            }
        }
        return response()->json(['message' => 'Cập nhật giỏ hàng thành công!']);
    }

    public function destroy($id)
    {
        $userId = Auth::id();
        
        // Kiểm tra xem $id có phải là cart item ID không
        $cartItem = CartItem::whereHas('cart', function($query) use ($userId) {
            $query->where('user_id', $userId);
        })->where('id', $id)->first();
        
        if ($cartItem) {
            // Xóa cart item
            $cartItem->delete();
            return response()->json(['message' => 'Đã xóa sản phẩm khỏi giỏ hàng!']);
        }
        
        // Nếu không phải cart item, thử xóa cart
        $cart = Cart::where('user_id', $userId)->where('id', $id)->first();
        if (!$cart) {
            return response()->json(['message' => 'Không tìm thấy giỏ hàng hoặc sản phẩm!'], 404);
        }
        $cart->cartItems()->delete();
        $cart->delete();
        return response()->json(['message' => 'Đã xóa giỏ hàng!']);
    }

    public function clearCart()
    {
        $userId = Auth::id();
        $cart = Cart::where('user_id', $userId)->latest()->first();
        
        if (!$cart) {
            return response()->json(['message' => 'Không có giỏ hàng để xóa!'], 404);
        }
        
        $cart->cartItems()->delete();
        $cart->delete();
        
        return response()->json(['message' => 'Đã xóa toàn bộ giỏ hàng!']);
    }
}
