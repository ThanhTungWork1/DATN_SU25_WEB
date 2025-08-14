<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Cart\CreateCartRequest;
use App\Models\Cart;
use App\Models\CartItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\ProductVariant;
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
        // Luôn tìm hoặc tạo một giỏ hàng duy nhất cho người dùng
        $cart = Cart::firstOrCreate(['user_id' => $userId]);

        // Tải các quan hệ cần thiết
        $cart->load('cartItems.productVariant.product', 'cartItems.productVariant.color', 'cartItems.productVariant.size');

        if ($cart->cartItems->isEmpty()) {
            return response()->json(['message' => 'Giỏ hàng trống.', 'cart' => $cart], 200);
        }

        $formattedCartItems = $cart->cartItems->map(function ($item) {
            $variant = $item->productVariant;
            $product = $variant ? $variant->product : null;
            
            $currentPrice = $variant->price ?? $product->price ?? $item->price;
            
            return [
                'id' => $item->id,
                'product_id' => $product ? $product->id : null,
                'variant_id' => $item->variant_id,
                'name' => $product ? $product->name : 'Unknown Product',
                'price' => $currentPrice,
                'quantity' => $item->quantity,
                'image' => $this->getProductImage($item, $variant, $product),
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

    public function getCartForUser()
    {
        $userId = Auth::id();
        $cart = Cart::with([
            'cartItems.productVariant.product',
            'cartItems.productVariant.color',
            'cartItems.productVariant.size'
        ])->where('user_id', $userId)->latest()->first();
        

        if (!$cart) {
            // Trả về một giỏ hàng trống thay vì lỗi 404 để frontend xử lý dễ dàng hơn
            return response()->json([
                'message' => 'Giỏ hàng trống.',
                'cart' => null
            ], 200);
        }

        // Format cart items with complete product information
        $formattedCartItems = $cart->cartItems->map(function ($item) {
            $variant = $item->productVariant;
            $product = $variant ? $variant->product : null;
            
            // Get current price from variant or product (prioritize current price over stored price)
            $currentPrice = null;
            if ($variant && $variant->price) {
                $currentPrice = $variant->price;
            } elseif ($product && $product->price) {
                $currentPrice = $product->price;
            } else {
                $currentPrice = $item->price; // fallback to stored price
            }
            
            return [
                'id' => $item->id,
                'product_id' => $product ? $product->id : null,
                'variant_id' => $item->variant_id,
                'name' => $product ? $product->name : 'Unknown Product',
                'price' => $currentPrice,
                'quantity' => $item->quantity,
                'image' => $this->getProductImage($item, $variant, $product),
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

    private function getProductImage($cartItem, $variant, $product)
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

    /**
     * Thêm một hoặc nhiều sản phẩm vào giỏ hàng.
     * Xử lý một mảng 'cartItems' từ request.
     */
        public function store(Request $request)
    {
        // Validate the incoming request to expect the 'cartItems' array structure
        $request->validate([
            'cartItems' => 'required|array|min:1',
            'cartItems.*.variant_id' => 'required|exists:product_variants,id',
            'cartItems.*.quantity' => 'required|integer|min:1',
        ]);

        $userId = Auth::id();
        if (!$userId) {
            return response()->json(['message' => 'Người dùng chưa đăng nhập.'], 401);
        }

        // Since the frontend sends one item at a time, we process the first one.
        $cartItemData = $request->input('cartItems')[0];
        $variantId = $cartItemData['variant_id'];
        $quantity = $cartItemData['quantity'];

        // Check for sufficient stock and get product data
        $variant = ProductVariant::with('product')->find($variantId);
        if (!$variant || $variant->stock < $quantity) {
            return response()->json(['message' => 'Số lượng sản phẩm trong kho không đủ.'], 400);
        }

        // Determine the price, prioritizing variant price, then product price
        $price = $variant->price ?? ($variant->product ? $variant->product->price : null);

        // If price is still null, there's a data issue with the product
        if ($price === null) {
            return response()->json(['message' => 'Không thể xác định giá của sản phẩm.'], 400);
        }

        // Find or create a single cart for the user
        $cart = Cart::firstOrCreate(['user_id' => $userId]);

        // Find if the item already exists in the cart
        $cartItem = $cart->cartItems()->where('variant_id', $variantId)->first();

        if ($cartItem) {
            // If item exists, update quantity
            $newQuantity = $cartItem->quantity + $quantity;
            if ($variant->stock < $newQuantity) {
                return response()->json(['message' => 'Số lượng sản phẩm trong kho không đủ.'], 400);
            }
            $cartItem->quantity = $newQuantity;
            $cartItem->save();
        } else {
            // If item does not exist, create it with the determined price
            $cart->cartItems()->create([
                'variant_id' => $variantId,
                'quantity' => $quantity,
                'price' => $price
            ]);
        }

        return response()->json(['message' => 'Sản phẩm đã được thêm vào giỏ hàng.'], 200);
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
        $cart = Cart::with([
            'cartItems.productVariant.product',
            'cartItems.productVariant.color',
            'cartItems.productVariant.size',
            'cartItems.product'
        ])->where('user_id', $userId)->where('id', $id)->first();

        if (!$cart) {
            return response()->json(['message' => 'Không tìm thấy giỏ hàng!'], 404);
        }

        // Format cart items with complete product information
        $formattedCartItems = $cart->cartItems->map(function ($item) {
            $product = $item->productVariant ? $item->productVariant->product : $item->product;
            $variant = $item->productVariant;
            
            return [
                'id' => $item->id,
                'product_id' => $product ? $product->id : null,
                'variant_id' => $item->variant_id,
                'name' => $product ? $product->name : 'Unknown Product',
                'price' => $item->price,
                'quantity' => $item->quantity,
                'image' => $this->getProductImage($item, $variant, $product),
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
        ]);
    }
}
//   $cart->load('cartItems.productVariant.product');

//     return response()->json(['message' => 'Sản phẩm đã được thêm vào giỏ hàng.', 'cart' => $cart], 200);
// {
//     $userId = Auth::id();
//     $cart = Cart::with([
//         'cartItems.productVariant.product',
//         'cartItems.productVariant.color',
//         'cartItems.productVariant.size'
//     ])->where('user_id', $userId)->latest()->first();
    

//     if (!$cart) {
//         // Trả về một giỏ hàng trống thay vì lỗi 404 để frontend xử lý dễ dàng hơn
//         return response()->json([
//             'message' => 'Giỏ hàng trống.',
//             'cart' => null
//         ], 200);
//     }

//     // Format cart items with complete product information
//     $formattedCartItems = $cart->cartItems->map(function ($item) {
//         $variant = $item->productVariant;
//         $product = $variant ? $variant->product : null;
        
//         // Get current price from variant or product (prioritize current price over stored price)
//         $currentPrice = null;
//         if ($variant && $variant->price) {
//             $currentPrice = $variant->price;
//         } elseif ($product && $product->price) {
//             $currentPrice = $product->price;
//         } else {
//             $currentPrice = $item->price; // fallback to stored price
//         })->where('id', $id)->first();
        
//         if ($cartItem) {
//             // Cập nhật cart item
//             $data = $request->validate([
//                 'quantity' => 'required|integer|min:1',
//             ]);
//             $cartItem->quantity = $data['quantity'];
//             $cartItem->save();
//             return response()->json(['message' => 'Cập nhật số lượng thành công!']);
//         }
        
//         // Nếu không phải cart item, thử cập nhật cart
//         $cart = Cart::where('user_id', $userId)->where('id', $id)->first();
//         if (!$cart) {
//             return response()->json(['message' => 'Không tìm thấy giỏ hàng hoặc sản phẩm!'], 404);
//         }
        
//         $data = $request->validate([
//             'cartItems' => 'required|array',
//             'cartItems.*.id' => 'required|exists:cart_items,id',
//             'cartItems.*.quantity' => 'required|integer|min:1',
//         ]);
//         foreach ($data['cartItems'] as $item) {
//             $cartItem = $cart->cartItems()->where('id', $item['id'])->first();
//             if ($cartItem) {
//                 $cartItem->quantity = $item['quantity'];
//                 $cartItem->save();
//             }
//         }
//         return response()->json(['message' => 'Cập nhật giỏ hàng thành công!']);
//     }


//     public function destroy($id)
//     {
//         $userId = Auth::id();
        
//         // Kiểm tra xem $id có phải là cart item ID không
//         $cartItem = CartItem::whereHas('cart', function($query) use ($userId) {
//             $query->where('user_id', $userId);
//         })->where('id', $id)->first();
        
//         if ($cartItem) {
//             // Xóa cart item
//             $cartItem->delete();
//             return response()->json(['message' => 'Đã xóa sản phẩm khỏi giỏ hàng!']);
//         }
        
//         // Nếu không phải cart item, thử xóa cart
//         $cart = Cart::where('user_id', $userId)->where('id', $id)->first();
//         if (!$cart) {
//             return response()->json(['message' => 'Không tìm thấy giỏ hàng hoặc sản phẩm!'], 404);
//         }
//         $cart->cartItems()->delete();
//         $cart->delete();
//         return response()->json(['message' => 'Đã xóa giỏ hàng!']);
//     }

//     public function clearCart()
//     {
//         $userId = Auth::id();
//         $cart = Cart::where('user_id', $userId)->latest()->first();
        
//         if (!$cart) {
//             return response()->json(['message' => 'Không có giỏ hàng để xóa!'], 404);
//         }
        
//         $cart->cartItems()->delete();
//         $cart->delete();
        
//         return response()->json(['message' => 'Đã xóa toàn bộ giỏ hàng!']);
//     }
