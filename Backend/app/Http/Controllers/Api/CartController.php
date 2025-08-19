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
        'cartItems.productVariant.product', // Đường dẫn đúng
        'cartItems.productVariant.color',
        'cartItems.productVariant.size'
    ])->where('user_id', $userId)->where('status', 1)->latest()->first();

    if (!$cart) {
        return response()->json(['message' => 'Chưa có giỏ hàng nào!'], 404);
    }

    \Log::info('Cart Data at ' . now(), ['cart' => $cart->toArray()]);

    return response()->json($cart);
}

public function store(CreateCartRequest $request)
{
    return DB::transaction(function () use ($request) {
        $data = $request->validated();

        // Log dữ liệu nhận được để debug
        \Log::info('Cart Store Request Data:', $data);
        $userId = Auth::id();

        // 🔹 Đảm bảo chỉ có một giỏ hàng đang hoạt động cho user
        $cart = $this->model->updateOrCreate(
            ['user_id' => $userId, 'status' => 1], // Điều kiện tìm
            ['user_id' => $userId, 'status' => 1]   // Giá trị để tạo mới nếu không tìm thấy
        );

        // Nếu có nhiều giỏ hàng với status = 1, cập nhật các bản khác về status = 0
        $this->model->where('user_id', $userId)
                    ->where('id', '!=', $cart->id)
                    ->where('status', 1)
                    ->update(['status' => 0]);

        // 🔹 Xử lý các cartItems
        foreach ($data['cartItems'] as $item) {
            if (empty($item['product_id']) || empty($item['variant_id']) || empty($item['quantity'])) {
                \Log::warning('Thiếu thông tin cần thiết trong cart item', ['item' => $item]);
                continue; // Bỏ qua item không hợp lệ
            }

            // 🔹 VALIDATION: Kiểm tra xem variant có thực sự thuộc về product không
            $variant = \App\Models\ProductVariant::find($item['variant_id']);

            if (!$variant || $variant->product_id != $item['product_id']) {
                \Log::error('Lỗi dữ liệu: Biến thể không thuộc về sản phẩm.', [
                    'request_item' => $item,
                    'variant_found' => $variant ? $variant->toArray() : null
                ]);
                continue; // Bỏ qua, không thêm vào giỏ hàng
            }

            $existingCartItem = $cart->cartItems()
                // Chỉ cần tìm theo variant_id là đủ vì nó là duy nhất
                ->where('variant_id', $item['variant_id'])
                ->first();

            if ($existingCartItem) {
                // Nếu sản phẩm đã có, chỉ cập nhật số lượng
                $existingCartItem->quantity += (int) $item['quantity'];
                $existingCartItem->save();
            } else {
                // Nếu chưa có, tạo mới và LẤY GIÁ TỪ DATABASE
                $cart->cartItems()->create([
                    'product_id' => $item['product_id'],
                    'variant_id' => $variant->id,
                    'quantity'   => (int) $item['quantity'],
                    'price'      => $variant->sale_price > 0 ? $variant->sale_price : $variant->price, // Lấy giá chính xác (bao gồm cả giá sale)
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

    public function updateItem(Request $request, CartItem $cartItem)
    {
        // Authorization: Ensure the cart item belongs to the authenticated user.
        if ($cartItem->cart->user_id !== Auth::id()) {
            return response()->json(['message' => 'Không có quyền truy cập'], 403);
        }

        // Logic to update quantity
        $validated = $request->validate(['quantity' => 'required|integer|min:1']);
        $cartItem->update(['quantity' => $validated['quantity']]);

        // Return the updated cart item along with the entire cart for a better frontend experience
        $cart = Cart::with(['cartItems.productVariant.product', 'cartItems.productVariant.color', 'cartItems.productVariant.size'])
                    ->find($cartItem->cart_id);

        return response()->json([
            'message' => 'Cập nhật số lượng thành công!',
            'cart' => $cart
        ]);
    }

    public function destroyItem(CartItem $cartItem)
    {
        // Authorization: Ensure the cart item belongs to the authenticated user.
        if ($cartItem->cart->user_id !== Auth::id()) {
            return response()->json(['message' => 'Không có quyền truy cập'], 403);
        }

        // Logic to delete the item
        $cartItem->delete();
        return response()->json(['message' => 'Đã xóa sản phẩm khỏi giỏ hàng']);
    }

    public function clear(Request $request)
    {
        $user = $request->user();
        // Tìm giỏ hàng đang hoạt động của người dùng
        $cart = Cart::where('user_id', $user->id)->where('status', 1)->first();

        if ($cart) {
            // Xóa tất cả các cart items liên quan đến giỏ hàng này
            $cart->cartItems()->delete();
            // Sau đó xóa chính giỏ hàng đó
            $cart->delete();
            return response()->json(['message' => 'Đã xóa toàn bộ giỏ hàng thành công']);
        }

        return response()->json(['message' => 'Không tìm thấy giỏ hàng để xóa'], 404);
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
