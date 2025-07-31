<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class CategoryController extends Controller
{
    /**
     * Lấy danh sách tất cả danh mục, kèm theo số lượng sản phẩm.
     */
    public function index()
    {
        // Dùng withCount('products') để đếm số sản phẩm trong mỗi danh mục.
        // Laravel sẽ tự động thêm một trường 'products_count' vào kết quả trả về.
        return Category::withCount('products')->orderBy('name', 'asc')->get();
    }

    /**
     * Lưu một danh mục mới.
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255|unique:categories,name',
            'status' => 'required|boolean',
        ]);

        $validatedData['slug'] = Str::slug($validatedData['name']);

        $category = Category::create($validatedData);

        return response()->json($category, 201);
    }

    /**
     * Hiển thị một danh mục cụ thể.
     */
    public function show($id)
    {
        return Category::findOrFail($id);
    }

    /**
     * Cập nhật một danh mục.
     */
    public function update(Request $request, $id)
    {
        $category = Category::findOrFail($id);

        $validatedData = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('categories')->ignore($category->id)],
            'status' => 'required|boolean',
        ]);

        $validatedData['slug'] = Str::slug($validatedData['name']);

        $category->update($validatedData);

        return response()->json($category);
    }

    /**
     * Xóa một danh mục.
     */
    public function destroy($id)
    {
        $category = Category::findOrFail($id);

        if ($category->products()->count() > 0) {
            return response()->json(['message' => 'Không thể xóa danh mục này vì vẫn còn sản phẩm.'], 409);
        }

        $category->delete();

        return response()->json(null, 204);
    }
}
