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
        ])
        ->where('user_id', $userId)
        ->orderBy('updated_at', 'desc')
        ->first();
        
        if (!$cart) {
            return response()->json(['message' => 'Chưa có giỏ hàng nào!'], 404);
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
    public function store(CreateCartRequest $request)
    {
        try {
            \Log::info('=== CART STORE DEBUG START ===');
            \Log::info('Request data', ['data' => $request->all()]);
            \Log::info('User ID', ['id' => Auth::id()]);
            \Log::info('User', ['user' => Auth::user()]);
            
            return DB::transaction(function () use ($request) {
                $data = $request->validated();
                $userId = Auth::id();
                
                \Log::info('Validated data', ['data' => $data]);
                \Log::info('User ID in transaction', ['id' => $userId]);

                // Tìm cart cập nhật gần nhất cho user, nếu chưa có thì tạo mới
                $cart = Cart::where('user_id', $userId)
                    ->orderBy('updated_at', 'desc')
                    ->first();
                if (!$cart) {
                    $cart = Cart::create(['user_id' => $userId]);
                }
                \Log::info('Cart created/found:', ['cart_id' => $cart->id, 'user_id' => $cart->user_id]);

                foreach ($data['cartItems'] as $item) {
                    \Log::info('Processing cart item', ['item' => $item]);
                    
                    // Ưu tiên sử dụng variant_id nếu có, nếu không thì tìm từ product_id
                    if (isset($item['variant_id']) && $item['variant_id']) {
                        \Log::info('Using variant_id', ['variant_id' => $item['variant_id']]);
                        $variant = \App\Models\ProductVariant::find($item['variant_id']);
                    } else {
                        \Log::info('Fallback: Finding first variant for product_id', ['product_id' => $item['product_id']]);
                        // Fallback: Lấy variant đầu tiên của product
                        $variant = \App\Models\ProductVariant::where('product_id', $item['product_id'])->first();
                    }
                    
                    \Log::info('Found variant', ['variant' => $variant ? $variant->toArray() : null]);
                    
                    if (!$variant) {
                        \Log::error('Variant not found for product_id', ['product_id' => $item['product_id']]);
                        return response()->json([
                            'success' => false,
                            'message' => 'Không tìm thấy variant cho sản phẩm ID: ' . $item['product_id']
                        ], 400);
                    }

                    // Kiểm tra xem item đã có trong cart chưa (cùng variant_id)
                    $existingItem = $cart->cartItems()->where('variant_id', $variant->id)->first();
                    \Log::info('Existing cart item', ['item' => $existingItem ? $existingItem->toArray() : null]);
                    
                    if ($existingItem) {
                        // Cập nhật số lượng
                        \Log::info('Updating existing item quantity', ['from' => $existingItem->quantity, 'to' => $existingItem->quantity + $item['quantity']]);
                        $existingItem->update([
                            'quantity' => $existingItem->quantity + $item['quantity']
                        ]);
                        \Log::info('Updated item', ['item' => $existingItem->fresh()->toArray()]);
                    } else {
                        // Tạo item mới
                        \Log::info('Creating new cart item:', [
                            'variant_id' => $variant->id,
                            'quantity' => $item['quantity'],
                            'price' => $item['price'],
                        ]);
                        $newItem = $cart->cartItems()->create([
                            'variant_id' => $variant->id,
                            'quantity' => $item['quantity'],
                            'price' => $item['price'],
                        ]);
                        \Log::info('Created new item:', ['item' => $newItem->toArray()]);
                    }
                }

                // Cập nhật mốc thời gian cart để đảm bảo index() lấy đúng giỏ hàng vừa chỉnh sửa
                $cart->touch();

                \Log::info('=== CART STORE SUCCESS ===');
                \Log::info('Final cart items count', ['count' => $cart->cartItems()->count()]);
                // Sử dụng đúng tên quan hệ: productVariant.size, productVariant.color
                \Log::info('All cart items:', [
                    'items' => $cart->cartItems()
                        ->with('productVariant.size', 'productVariant.color')
                        ->get()
                        ->toArray()
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Thêm giỏ hàng thành công!',
                    'cart_id' => $cart->id
                ], 200);
            });
        } catch (\Exception $e) {
            \Log::error('=== CART STORE ERROR ===');
            \Log::error('Error message', ['message' => $e->getMessage()]);
            \Log::error('Error trace', ['trace' => $e->getTraceAsString()]);
            
            return response()->json([
                'success' => false,
                'message' => 'Lỗi thêm vào giỏ hàng: ' . $e->getMessage(),
                'line' => $e->getLine()
            ], 500);
        }
    }

    /**
     * Display the specified resource.
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
