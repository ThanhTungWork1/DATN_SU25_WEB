<?php

// app/Http/Controllers/Admin/CommentController.php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    /**
     * Lấy danh sách tất cả bình luận/đánh giá.
     */
    public function index()
    {
        // Sắp xếp theo ngày tạo mới nhất và tải kèm thông tin user, product
        return Comment::with(['user', 'product'])->latest()->paginate(15);
    }

    /**
     * Cập nhật trạng thái của một bình luận (Duyệt hoặc Ẩn).
     */
    public function updateStatus(Request $request, $id)
    {
        $request->validate(['status' => 'required|boolean']);
        $comment = Comment::findOrFail($id);
        $comment->status = $request->status;
        $comment->save();

        $message = $request->status ? 'Đánh giá đã được duyệt.' : 'Đánh giá đã bị ẩn.';
        return response()->json(['message' => $message]);
    }

    /**
     * Xóa một bình luận.
     */
    public function destroy($id)
    {
        $comment = Comment::findOrFail($id);
        $comment->delete();

        return response()->json(['message' => 'Đánh giá đã được xóa.']);
    }
}