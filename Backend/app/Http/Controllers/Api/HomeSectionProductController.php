<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\HomeSection;
use App\Models\Product;

class HomeSectionProductController extends Controller
{
    // Lấy danh sách sản phẩm thuộc 1 section
    public function index($id)
    {
        try {
            $section = HomeSection::with('products')->findOrFail($id);

            return response()->json([
                'section' => $section->name,
                'products' => $section->products ?? [],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Không tìm thấy section hoặc có lỗi xảy ra',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // Gán sản phẩm vào section
    public function store(Request $request, $id)
    {
        $section = HomeSection::findOrFail($id);

        $validated = $request->validate([
            'product_ids' => 'required|array',
            'product_ids.*' => 'exists:products,id',
        ]);

        // Gán sản phẩm mới (thêm mà không xóa cái cũ)
        $section->products()->syncWithoutDetaching($validated['product_ids']);

        return response()->json([
            'message' => 'Sản phẩm đã được thêm vào section.',
        ]);
    }

    // Xoá sản phẩm khỏi section
    public function destroy($id, $productId)
    {
        $section = HomeSection::findOrFail($id);

        $section->products()->detach($productId);

        return response()->json([
            'message' => 'Đã xóa sản phẩm khỏi section.',
        ]);
    }
}