<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Product;

class FavoriteController extends Controller
{
    // Lấy danh sách sản phẩm yêu thích của user hiện tại
    public function index(Request $request)
    {
        $favorites = $request->user()->favorites()->with('category')->get();
        return response()->json([
            'success' => true,
            'data' => $favorites
        ]);
    }

    // Thêm vào danh sách yêu thích
    public function add(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id'
        ]);

        $user = $request->user();
        $user->favorites()->syncWithoutDetaching([$request->product_id]);

        return response()->json(['message' => 'Đã thêm vào yêu thích']);
    }

    // Xoá khỏi danh sách yêu thích
    public function remove(Request $request, $productId)
    {
        $user = $request->user();
        $user->favorites()->detach($productId);

        return response()->json(['message' => 'Đã xoá khỏi yêu thích']);
    }
}
