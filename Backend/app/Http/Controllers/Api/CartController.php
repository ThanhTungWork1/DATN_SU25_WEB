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

    /**
     * Lấy thông tin giỏ hàng của người dùng đang đăng nhập.
     */
    public function index()
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
    public function store(CreateCartRequest $request)
    {
        try {
            return DB::transaction(function () use ($request) {
                $data = $request->validated();
                $userId = Auth::id();

                // Tìm hoặc tạo cart cho user
                $cart = Cart::firstOrCreate(['user_id' => $userId]);

                foreach ($data['cartItems'] as $item) {
                    // Ưu tiên nhận trực tiếp variant_id từ frontend; nếu không có thì tìm theo product_id
                    $variantId = $item['variant_id'] ?? null;
                    if (!$variantId) {
                        if (!empty($item['product_id'])) {
                            $variant = \App\Models\ProductVariant::where('product_id', $item['product_id'])->first();
                            if ($variant) {
                                $variantId = $variant->id;
                            }
                        }
                    }

                    if (!$variantId) {
                        return response()->json([
                            'success' => false,
                            'message' => 'Không tìm thấy biến thể (variant_id hoặc product_id không hợp lệ)'
                        ], 400);
                    }

                    // Kiểm tra xem item đã có trong cart chưa
                    $existingItem = $cart->cartItems()->where('variant_id', $variantId)->first();
                    
                    if ($existingItem) {
                        // Cập nhật số lượng
                        $existingItem->update([
                            'quantity' => $existingItem->quantity + $item['quantity']
                        ]);
                    } else {
                        // Tạo item mới
                        $cart->cartItems()->create([
                            'variant_id' => $variantId,
                            'quantity' => $item['quantity'],
                            'price' => $item['price'],
                        ]);
                    }
                }

                return response()->json([
                    'success' => true,
                    'message' => 'Thêm giỏ hàng thành công!',
                    'cart_id' => $cart->id
                ], 200);
            });
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi thêm vào giỏ hàng: ' . $e->getMessage(),
                'line' => $e->getLine()
            ], 500);
        }

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
// =======
//     /**
//      * Xóa toàn bộ sản phẩm khỏi giỏ hàng của người dùng.
//      */
//     public function clearCart()
//     {
//         $userId = Auth::id();
//         if (!$userId) {
//             return response()->json(['message' => 'Người dùng chưa đăng nhập!'], 401);
//         }

//         $cart = Cart::where('user_id', $userId)->first();
//         if ($cart) {
//             $cart->cartItems()->delete();
//             return response()->json(['message' => 'Đã xóa toàn bộ giỏ hàng!']);
//         }
        
//         return response()->json(['message' => 'Giỏ hàng đã trống!']);
//     }

//     /**
//      * Cập nhật số lượng của một sản phẩm trong giỏ hàng.
//      */
//     public function updateCartItem(Request $request, $id)
//     {
//         $userId = Auth::id();
//         if (!$userId) {
//             return response()->json(['message' => 'Người dùng chưa đăng nhập!'], 401);
//         }

//         $data = $request->validate([
//             'quantity' => 'required|integer|min:1',
//         ]);

//         $cartItem = CartItem::whereHas('cart', function($query) use ($userId) {
//             $query->where('user_id', $userId);
//         })->where('id', $id)->first();

//         if (!$cartItem) {
//             return response()->json(['message' => 'Không tìm thấy sản phẩm trong giỏ hàng!'], 404);
//         }

//         $cartItem->quantity = $data['quantity'];
//         $cartItem->save();

//         return response()->json([
//             'message' => 'Cập nhật số lượng thành công!',
//             'cartItem' => $cartItem
//         ]);
//     }

//     /**
//      * Xóa một sản phẩm cụ thể khỏi giỏ hàng.
//      */
//     public function removeCartItem($id)
//     {
//         $userId = Auth::id();
//         if (!$userId) {
//             return response()->json(['message' => 'Người dùng chưa đăng nhập!'], 401);
//         }

//         $cartItem = CartItem::whereHas('cart', function($query) use ($userId) {
//             $query->where('user_id', $userId);
//         })->where('id', $id)->first();

//         if (!$cartItem) {
//             return response()->json(['message' => 'Không tìm thấy sản phẩm trong giỏ hàng!'], 404);
//         }

//         $cartItem->delete();
//         return response()->json(['message' => 'Đã xóa sản phẩm khỏi giỏ hàng!']);
//     }


// }
// >>>>>>> origin/hung-feature/product-and-order
