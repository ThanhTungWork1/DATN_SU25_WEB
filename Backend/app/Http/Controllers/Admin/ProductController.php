<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str; // THÊM: Import Str để tạo slug

class ProductController extends Controller
{
    public function index()
    {
        return Product::latest()->paginate(10);
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'category_id' => 'required|exists:categories,id',
            'status' => 'required|boolean',
            'description' => 'nullable|string',
            'old_price' => 'nullable|numeric|min:0',
            'material' => 'nullable|string',
            // 'discount' => 'nullable|numeric|min:0',
            'slug' => 'nullable|string|max:255|unique:products,slug',
            'sold' => 'nullable|integer|min:0',
            'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
            'hover_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'variants' => 'required|string',
        ]);

        $variantsData = json_decode($validatedData['variants'], true);
        if (json_last_error() !== JSON_ERROR_NONE || !is_array($variantsData) || count($variantsData) < 1) {
            return response()->json(['message' => 'Định dạng biến thể không hợp lệ.'], 422);
        }

        $product = DB::transaction(function () use ($validatedData, $variantsData, $request) {
            // --- SỬA LỖI: Xây dựng đối tượng Product một cách tường minh ---
            $product = new Product();
            $product->name = $validatedData['name'];
            $product->price = $validatedData['price'];
            $product->category_id = $validatedData['category_id'];
            $product->status = $validatedData['status'];
            $product->description = $validatedData['description'] ?? null;
            $product->old_price = $validatedData['old_price'] ?? null;
            $product->material = $validatedData['material'] ?? null;
            $product->sold = $validatedData['sold'] ?? 0;

            // Tự động tạo slug nếu người dùng không nhập
            $product->slug = $validatedData['slug'] ?? Str::slug($validatedData['name']);

            // Xử lý upload file và gán đường dẫn
            if ($request->hasFile('image')) {
                $product->image = $request->file('image')->store('products', 'public');
            }
            if ($request->hasFile('hover_image')) {
                $product->hover_image = $request->file('hover_image')->store('products', 'public');
            }

            // 1. Lưu sản phẩm cha vào DB
            $product->save();

            // 2. Lặp qua và tạo các biến thể
            foreach ($variantsData as $variant) {
                $product->variants()->create($variant);
            }
            return $product;
        });

        return response()->json($product->load('variants'), 201);
    }

    public function show($id)
    {
        return Product::with('variants')->findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        // Logic cập nhật cũng nên được làm tường minh tương tự, nhưng tạm thời giữ nguyên để giải quyết lỗi tạo mới trước
        // (Code update hiện tại của bạn đã khá tốt)
        $validatedData = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'price' => 'sometimes|required|numeric|min:0',
            'category_id' => 'sometimes|required|exists:categories,id',
            'status' => 'sometimes|required|boolean',
            'description' => 'nullable|string',
            'old_price' => 'nullable|numeric|min:0',
            'material' => 'nullable|string',
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('products')->ignore($product->id)],
            'sold' => 'nullable|integer|min:0',
            'variants' => 'sometimes|required|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'hover_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        DB::transaction(function () use ($request, $product, $validatedData) {
            $productDataForUpdate = collect($validatedData)->except(['variants', 'image', 'hover_image'])->toArray();

            if ($request->hasFile('image')) {
                if ($product->image) Storage::disk('public')->delete($product->image);
                $productDataForUpdate['image'] = $request->file('image')->store('products', 'public');
            }
            if ($request->hasFile('hover_image')) {
                if ($product->hover_image) Storage::disk('public')->delete($product->hover_image);
                $productDataForUpdate['hover_image'] = $request->file('hover_image')->store('products', 'public');
            }

            $product->update($productDataForUpdate);

            if ($request->has('variants')) {
                $variants = json_decode($request->input('variants'), true);
                $incomingVariantIds = collect($variants)->pluck('id')->filter();
                $product->variants()->whereNotIn('id', $incomingVariantIds)->delete();

                foreach ($variants as $variantData) {
                    $product->variants()->updateOrCreate(
                        ['id' => $variantData['id'] ?? null],
                        $variantData
                    );
                }
            }
        });

        return response()->json($product->load('variants'));
    }

    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        if ($product->image) Storage::disk('public')->delete($product->image);
        if ($product->hover_image) Storage::disk('public')->delete($product->hover_image);
        $product->delete();

        return response()->json(['message' => 'Xóa sản phẩm thành công!']);
    }
}