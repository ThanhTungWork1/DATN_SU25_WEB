<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Comment;
use Illuminate\Support\Facades\Auth;

class CommentController extends Controller
{
    public function getByProduct($productId)
    {
        return response()->json(
            Comment::where('product_id', $productId)->where('status', 1)->with('user')->get()
        );
    }

    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'content' => 'required|string',
            'rating' => 'required|integer|min:1|max:5'
        ]);

        // ✅ Danh sách từ khoá xấu
        $badWords = ['xấu', 'lừa đảo', 'rác', 'phốt', 'fake', 'tệ', 'ngu', 'đểu', 'kém'];
        $content = $request->content;

        // ✅ Mặc định là comment được duyệt
        $status = 1;

        // ✅ Nếu có từ khoá xấu thì ẩn comment
        foreach ($badWords as $word) {
            if (stripos($content, $word) !== false) {
                $status = 0;
                break;
            }
        }

        $comment = Comment::create([
            'user_id' => Auth::id(),
            'product_id' => $request->product_id,
            'content' => $content,
            'rating' => $request->rating,
            'status' => $status,
        ]);

        $message = $status === 1
            ? 'Bình luận đã được đăng.'
            : 'Bình luận của bạn chứa từ ngữ không phù hợp và đang chờ kiểm duyệt.';

        return response()->json(['comment' => $comment, 'message' => $message], 201);
    }

    // ✅ ADMIN: Xem toàn bộ comment
    public function index()
    {
        return response()->json(Comment::with('user', 'product')->get());
    }

    // ✅ ADMIN: Duyệt comment
    public function approve($id)
    {
        $comment = Comment::findOrFail($id);
        $comment->status = 1;
        $comment->save();

        return response()->json(['message' => 'Comment đã được duyệt.']);
    }

    // ✅ ADMIN: Ẩn comment
    public function hide($id)
    {
        $comment = Comment::findOrFail($id);
        $comment->status = 0;
        $comment->save();

        return response()->json(['message' => 'Comment đã bị ẩn.']);
    }

    // ✅ ADMIN: Xoá comment
    public function destroy($id)
    {
        $comment = Comment::findOrFail($id);
        $comment->delete();

        return response()->json(['message' => 'Comment đã bị xoá.']);
    }

    // ✅ ADMIN: Lọc comment chứa từ khoá xấu
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
