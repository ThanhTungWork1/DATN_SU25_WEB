<?php

// app/Http/Controllers/Api/CommentController.php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Comment;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class CommentController extends Controller
{
    // ✅ Lấy comment của 1 sản phẩm (hiển thị công khai)
    public function getByProduct($productId)
    {
        return response()->json(
            Comment::where('product_id', $productId)
                ->where('status', 1)
                ->with('user')
                ->get()
        );
    }

    // ✅ Tạo bình luận (chỉ khi đã mua hàng)
    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'content' => 'required|string',
            'rating' => 'required|integer|min:1|max:5'
        ]);


        $userId = Auth::id();
        $productId = $request->product_id;

        // ✅ Kiểm tra đã bình luận chưa
        $hasCommented = Comment::where('user_id', $userId)
            ->where('product_id', $productId)
            ->exists();

        if ($hasCommented) {
            return response()->json(['message' => 'Bạn đã đánh giá sản phẩm này rồi.'], 409);
        }

        // ✅ Kiểm tra đã mua hàng thành công chưa
        $hasPurchased = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('product_variants', 'order_items.variant_id', '=', 'product_variants.id')
            ->where('orders.user_id', $userId)
            ->where('orders.status', 'completed') // ✅ CHỈ ĐÁNH GIÁ KHI ĐÃ GIAO HÀNG
            ->where('product_variants.product_id', $productId)
            ->exists();


        if (!$hasPurchased) {
            return response()->json(['message' => 'Bạn cần mua sản phẩm này trước khi đánh giá.'], 403);
        }

        // ✅ Lọc từ khóa xấu
        $badWords = ['xấu', 'lừa đảo', 'rác', 'phốt', 'fake', 'tệ', 'ngu', 'đểu', 'kém'];
        $content = $request->content;
        $status = 1;

        foreach ($badWords as $word) {
            if (stripos($content, $word) !== false) {
                $status = 0;
                break;
            }
        }

        // ✅ Tạo bình luận
        $comment = Comment::create([
            'user_id' => $userId,
            'product_id' => $productId,
            'content' => $content,
            'rating' => $request->rating,
            'status' => $status,
        ]);

        $message = $status === 1
            ? 'Bình luận đã được đăng.'
            : 'Bình luận của bạn chứa từ ngữ không phù hợp và đang chờ kiểm duyệt.';

        return response()->json(['comment' => $comment, 'message' => $message], 201);
    }

    // ✅ ADMIN: Xem toàn bộ bình luận
    public function index()
    {
        return response()->json(Comment::with('user', 'product')->get());
    }

    // ✅ ADMIN: Duyệt bình luận
    public function approve($id)
    {
        $comment = Comment::findOrFail($id);
        $comment->status = 1;
        $comment->save();

        return response()->json(['message' => 'Comment đã được duyệt.']);
    }

    // ✅ ADMIN: Ẩn bình luận
    public function hide($id)
    {
        $comment = Comment::findOrFail($id);
        $comment->status = 0;
        $comment->save();

        return response()->json(['message' => 'Comment đã bị ẩn.']);
    }

    // ✅ ADMIN: Xoá bình luận
    public function destroy($id)
    {
        $comment = Comment::findOrFail($id);
        $comment->delete();

        return response()->json(['message' => 'Comment đã bị xoá.']);
    }

    // ✅ ADMIN: Lọc bình luận chứa từ khóa xấu
    public function filterSpam()
    {
        $badWords = ['xấu', 'lừa đảo', 'rác', 'phốt', 'fake', 'tệ', 'ngu', 'đểu', 'kém'];

        $spamComments = Comment::where(function ($query) use ($badWords) {
            foreach ($badWords as $word) {
                $query->orWhere('content', 'LIKE', "%$word%");
            }
        })->with('user', 'product')->get();

        return response()->json($spamComments);
    }
}
