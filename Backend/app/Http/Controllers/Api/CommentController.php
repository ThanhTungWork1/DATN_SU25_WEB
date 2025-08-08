<?php

// app/Http/Controllers/Api/CommentController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Comment;
use Illuminate\Support\Facades\Auth;

class CommentController extends Controller
{
    /**
     * Lấy các bình luận đã được duyệt của một sản phẩm.
     */
    public function getByProduct($productId)
    {
        return Comment::where('product_id', $productId)
                      ->where('status', true) // Chỉ lấy các comment đã được duyệt
                      ->with('user')
                      ->latest()
                      ->get();
    }

    /**
     * Cho người dùng đã đăng nhập gửi một bình luận mới.
     */
    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'content' => 'required|string',
            'rating' => 'required|integer|min:1|max:5'
        ]);

        // Logic kiểm tra từ khóa xấu của bạn đã rất tốt, chúng ta có thể giữ lại
        // hoặc đơn giản là để tất cả bình luận ở trạng thái chờ duyệt (status = false)
        $comment = Comment::create([
            'user_id' => Auth::id(),
            'product_id' => $request->product_id,
            'co
            ntent' => $request->content,
            'rating' => $request->rating,
            'status' => false, // Mặc định là chờ duyệt
        ]);

        return response()->json([
            'comment' => $comment,
            'message' => 'Cảm ơn bạn đã đánh giá. Đánh giá của bạn đang chờ được kiểm duyệt.'
        ], 201);
    }
}
