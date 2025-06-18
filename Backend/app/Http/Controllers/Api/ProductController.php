<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProductRequest;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Http\Response;

class ProductController
{
    // 1. Danh sách sản phẩm
    public function index()
    {
        $products = Product::with('category:id,name')
            ->select('id', 'name', 'slug', 'category_id', 'description', 'price', 'discount', 'image', 'status')
            ->get()
            ->map(function ($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'slug' => $product->slug,
                    'category_name' => optional($product->category)->name,
                    'description' => $product->description,
                    'price' => $product->price,
                    'discount' => $product->discount,
                    'image' => $product->image,
                    'status' => $product->status,
                ];
            });

        return response()->json([
            'data' => $products,
            'message' => 'Success',
            'status_code' => Response::HTTP_OK
        ]);
    }

    // 2. Chi tiết 1 sản phẩm
    public function show($id)
    {
        $product = Product::with('category:id,name')
            ->select('id', 'name', 'slug', 'category_id', 'description', 'price', 'discount', 'image', 'status')
            ->findOrFail($id);

        return response()->json([
            'data' => [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'category_name' => optional($product->category)->name,
                'description' => $product->description,
                'price' => $product->price,
                'discount' => $product->discount,
                'image' => $product->image,
                'status' => $product->status,
            ],
            'message' => 'Success',
            'status_code' => Response::HTTP_OK
        ]);
    }

    // 3. Thêm sản phẩm
    public function add(Request $request)
    {
        // Kiểm tra bắt buộc các trường cần thiết
        $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric',
            'discount' => 'nullable|numeric',
            'status' => 'required|boolean',
            'category_id' => 'nullable|exists:categories,id',
            'image' => 'nullable|image|max:2048'
        ]);

        $data = $request->only([
            'name',
            'slug',
            'description',
            'price',
            'discount',
            'status',
            'category_id'
        ]);

        // Nếu không có slug thì tự tạo
        $data['slug'] = $data['slug'] ?? Str::slug($data['name']);

        // Xử lý hình ảnh nếu có upload
        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('imageProduct', 'public');
        }

        $product = Product::create($data);

        return response()->json([
            'data' => $product,
            'message' => 'Thêm sản phẩm thành công.',
            'status_code' => 201
        ]);
    }



    // 4. Cập nhật sản phẩm
    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);
        $data = $request->validated();

        $data['slug'] = $data['slug'] ?? Str::slug($data['name']);

        if ($request->hasFile('image')) {
            if ($product->image && Storage::disk('public')->exists($product->image)) {
                Storage::disk('public')->delete($product->image);
            }
            $data['image'] = $request->file('image')->store('imageProduct', 'public');
        } else {
            $data['image'] = $product->image;
        }

        $product->update($data);

        return response()->json([
            'data' => $product,
            'message' => 'Cập nhật sản phẩm thành công.',
            'status_code' => Response::HTTP_OK
        ]);
    }

    // 5. Xóa sản phẩm
    public function destroy($id)
    {
        $product = Product::findOrFail($id);

        if ($product->image && Storage::disk('public')->exists($product->image)) {
            Storage::disk('public')->delete($product->image);
        }

        $product->delete();

        return response()->json([
            'message' => 'Xóa sản phẩm thành công.',
            'status_code' => Response::HTTP_OK
        ]);
    }
}
