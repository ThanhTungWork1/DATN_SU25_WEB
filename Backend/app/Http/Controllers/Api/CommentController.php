<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Comment;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CommentController extends Controller
{
    // ✅ Lấy comment của 1 sản phẩm (hiển thị công khai)
    public function getByProduct($id)
    {
        return response()->json(
            Comment::where('product_id', $id)
                ->where('status', 1)
                ->with('user')
                ->get()
        );
    }

    // ✅ Tạo bình luận (chỉ khi đã mua hàng)
    public function store(Request $request)
    {
        // Validation cơ bản trước
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'content' => 'required|string',
            'rating' => 'required|integer|min:1|max:5'
        ]);

        // Kiểm tra order_id riêng với fallback
        $orderId = $request->order_id;
        if (!$orderId) {
            return response()->json(['message' => 'Thiếu thông tin đơn hàng.'], 400);
        }

        // Kiểm tra order tồn tại và thuộc về user
        $userId = Auth::id();
        $order = DB::table('orders')->where('id', $orderId)->where('user_id', $userId)->first();
        if (!$order) {
            return response()->json(['message' => 'Đơn hàng không tồn tại hoặc không thuộc về bạn.'], 404);
        }

        $productId = $request->product_id;

        // Kiểm tra đã đánh giá sản phẩm này trong đơn hàng này chưa
        $hasCommented = Comment::where('user_id', $userId)
            ->where('product_id', $productId)
            ->where('order_id', $orderId)
            ->exists();

        if ($hasCommented) {
            return response()->json(['message' => 'Bạn đã đánh giá sản phẩm này trong đơn hàng này rồi.'], 409);
        }

        // ✅ Kiểm tra đã mua hàng thành công chưa
        $hasPurchased = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->join('product_variants', 'order_items.variant_id', '=', 'product_variants.id')
            ->where('orders.user_id', $userId)
            ->where('orders.id', $orderId)
            ->whereIn('orders.status', ['completed', 'delivered']) // ✅ CHỈ ĐÁNH GIÁ KHI ĐÃ GIAO HÀNG
            ->where('product_variants.product_id', $productId)
            ->exists();

        // Log để debug
        \Log::info("Review eligibility check", [
            'user_id' => $userId,
            'product_id' => $productId,
            'order_id' => $orderId,
            'has_purchased' => $hasPurchased
        ]);


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

        // ✅ Tạo bình luận với order_id
        $commentData = [
            'user_id' => $userId,
            'product_id' => $productId,
            'order_id' => $orderId,
            'content' => $content,
            'rating' => $request->rating,
            'status' => $status,
        ];

        $comment = Comment::create($commentData);

        $message = $status === 1
            ? 'Bình luận đã được đăng.'
            : 'Bình luận của bạn chứa từ ngữ không phù hợp và đang chờ kiểm duyệt.';

        return response()->json(['comment' => $comment, 'message' => $message], 201);
    }

    // ✅ ADMIN: Xem toàn bộ bình luận (có phân trang)
    public function index(Request $request)
    {
        $perPage = (int)($request->get('per_page', 15));
        $comments = Comment::with(['user', 'product'])
            ->orderByDesc('created_at')
            ->paginate($perPage);

        return response()->json($comments);
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

    // ✅ Kiểm tra quyền đánh giá của user
    public function checkEligibility(Request $request, $productId)
    {
        try {
            $userId = Auth::id();
            
            if (!$userId) {
                return response()->json([
                    'can_review' => false,
                    'reason' => 'not_logged_in',
                    'message' => 'Bạn cần đăng nhập để đánh giá sản phẩm.'
                ]);
            }

            // Kiểm tra đã đánh giá cho đơn hàng cụ thể này chưa
            $orderId = $request->get('order_id'); // Lấy order_id từ query parameter
            
            if (!$orderId) {
                return response()->json([
                    'can_review' => false,
                    'reason' => 'missing_order_id',
                    'message' => 'Thiếu thông tin đơn hàng.'
                ]);
            }

            // Log để debug
            \Log::info("Review eligibility check", [
                'user_id' => $userId,
                'product_id' => $productId,
                'order_id' => $orderId
            ]);

            // Kiểm tra đã đánh giá sản phẩm này trong đơn hàng này chưa
            $hasCommentedForOrder = Comment::where('user_id', $userId)
                ->where('product_id', $productId)
                ->where('order_id', $orderId)
                ->exists();

            if ($hasCommentedForOrder) {
                return response()->json([
                    'can_review' => false,
                    'reason' => 'already_reviewed_for_order',
                    'message' => 'Bạn đã đánh giá sản phẩm này trong đơn hàng này rồi.'
                ]);
            }

            // Kiểm tra đã mua hàng thành công chưa - simplified check
            $hasPurchased = DB::table('order_items')
                ->join('orders', 'order_items.order_id', '=', 'orders.id')
                ->join('product_variants', 'order_items.variant_id', '=', 'product_variants.id')
                ->where('orders.user_id', $userId)
                ->where('orders.id', $orderId)
                ->whereIn('orders.status', ['completed', 'delivered'])
                ->where('product_variants.product_id', $productId)
                ->exists();

            \Log::info("Purchase check result", [
                'has_purchased' => $hasPurchased,
                'user_id' => $userId,
                'product_id' => $productId,
                'order_id' => $orderId
            ]);

            if (!$hasPurchased) {
                return response()->json([
                    'can_review' => false,
                    'reason' => 'not_purchased',
                    'message' => 'Bạn cần mua và nhận hàng thành công trước khi đánh giá.'
                ]);
            }

            return response()->json([
                'can_review' => true,
                'reason' => 'eligible',
                'message' => 'Bạn có thể đánh giá sản phẩm này.'
            ]);
        } catch (\Exception $e) {
            \Log::error("Review eligibility check error", [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'user_id' => Auth::id(),
                'product_id' => $productId,
                'order_id' => $request->get('order_id')
            ]);

            return response()->json([
                'can_review' => false,
                'reason' => 'server_error',
                'message' => 'Có lỗi xảy ra khi kiểm tra quyền đánh giá.'
            ], 500);
        }
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
