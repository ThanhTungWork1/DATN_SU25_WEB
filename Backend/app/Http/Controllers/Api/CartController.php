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
    ) {
    }
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
        return response()->json($cart);
    }
   public function store(CreateCartRequest $request)
{
    return DB::transaction(function () use ($request) {
        $data = $request->validated();

        // Log dữ liệu nhận được để debug
        \Log::info('Cart Store Request Data:', $data);
        $userId = Auth::id();

        // 🔹 Tìm giỏ hàng hiện tại của user (chưa checkout)
        $cart = $this->model
            ->where('user_id', $userId)
            ->whereNull('status')
            ->latest()
            ->first();

        // 🔹 Nếu chưa có thì tạo mới
        if (!$cart) {
            $cart = $this->model->create(['user_id' => $userId]);
        }

        // 🔹 Xử lý các cartItems
        foreach ($data['cartItems'] as $item) {
            // Bỏ qua nếu thiếu product_id hoặc quantity
            if (empty($item['product_id']) || empty($item['quantity'])) {
                \Log::warning('Thiếu product_id hoặc quantity trong cartItems', ['item' => $item]);
                continue;
            }

            // So sánh variant_id cẩn thận (NULL cũng được tính riêng)
            $existingCartItem = $cart->cartItems()
                ->where('product_id', $item['product_id'])
                ->when(array_key_exists('variant_id', $item), function ($query) use ($item) {
                    $query->where('variant_id', $item['variant_id']);
                }, function ($query) {
                    $query->whereNull('variant_id');
                })
                ->first();

            if ($existingCartItem) {
                // Nếu đã tồn tại, tăng số lượng
                $existingCartItem->quantity += (int) $item['quantity'];
                $existingCartItem->save();
            } else {
                // Nếu chưa tồn tại, tạo mới
                $cart->cartItems()->create([
                    'product_id' => $item['product_id'],
                    'variant_id' => $item['variant_id'] ?? null,
                    'quantity'   => (int) $item['quantity'],
                    'price'      => $item['price'] ?? 0,
                ]);
            }
        }

        // 🔹 Load thông tin chi tiết giỏ hàng
        $cart->load('cartItems.product');

        return response()->json([
            'message' => 'Thêm giỏ hàng thành công!',
            'cart'    => $cart
        ], 200);
    });
}

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $userId = Auth::id();
        $cart = Cart::with('cartItems.product')->where('user_id', $userId)->where('id', $id)->first();
        if (!$cart) {
            return response()->json(['message' => 'Không tìm thấy giỏ hàng!'], 404);
        }
        return response()->json($cart);
    }


    public function update(Request $request, $id)
    {
        $userId = Auth::id();
        $cart = Cart::where('user_id', $userId)->where('id', $id)->first();
        if (!$cart) {
            return response()->json(['message' => 'Không tìm thấy giỏ hàng!'], 404);
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
        $cart = Cart::where('user_id', $userId)->where('id', $id)->first();
        if (!$cart) {
            return response()->json(['message' => 'Không tìm thấy giỏ hàng!'], 404);
        }
        $cart->cartItems()->delete();
        $cart->delete();
        return response()->json(['message' => 'Đã xóa giỏ hàng!']);
    }
}
