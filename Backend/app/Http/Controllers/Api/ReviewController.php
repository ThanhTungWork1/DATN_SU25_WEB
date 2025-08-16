<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Order;
use App\Models\Comment;

class ReviewController extends Controller
{
    /**
     * Kiểm tra xem người dùng có đủ điều kiện để đánh giá một sản phẩm hay không.
     * Điều kiện: Người dùng đã đăng nhập và đã mua sản phẩm này (đơn hàng đã hoàn thành).
     */
    public function checkEligibility(Request $request, $productId)
    {
        if (!Auth::check()) {
            return response()->json(['eligible' => false, 'reason' => 'unauthenticated']);
        }

        $userId = Auth::id();

        // 1. Kiểm tra xem người dùng đã đánh giá sản phẩm này chưa
        $alreadyReviewed = Comment::where('user_id', $userId)
            ->where('product_id', $productId)
            ->exists();

        if ($alreadyReviewed) {
            return response()->json(['eligible' => false, 'reason' => 'already_reviewed']);
        }

        // 2. Kiểm tra xem người dùng có đơn hàng nào đã hoàn thành ('completed' hoặc trạng thái tương tự)
        // và chứa sản phẩm (hoặc biến thể sản phẩm) này không.
        $isEligible = Order::where('user_id', $userId)
            ->whereIn('status', ['completed', 'delivered']) // Tùy chỉnh các trạng thái đơn hàng đã hoàn thành
            ->whereHas('items.productVariant', function ($query) use ($productId) {
                $query->where('product_id', $productId);
            })
            ->exists();

        if ($isEligible) {
            return response()->json(['eligible' => true]);
        } else {
            return response()->json(['eligible' => false, 'reason' => 'not_purchased']);
        }
    }
}
