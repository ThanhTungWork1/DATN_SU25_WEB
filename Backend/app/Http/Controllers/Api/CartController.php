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
        $cart = Cart::with('cartItems.product')->where('user_id', $userId)->latest()->first();
        if (!$cart) {
            return response()->json(['message' => 'Chưa có giỏ hàng nào!'], 404);
        }
        return response()->json($cart);
    }
    public function store(CreateCartRequest $request)
    {
        return DB::transaction(function () use ($request) {
            $data = $request->validated();

            $cart = [
                'user_id' => Auth::id(),
            ];

            $record = $this->model->create($cart);

            $cartItem = collect($data['cartItems'])->map(function ($item) {
                return [
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                ];
            })->toArray();

            $record->cartItems()->createMany($cartItem);

            return response()->json(['message' => 'Thêm giỏ hàng thành công!'], 200);
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
