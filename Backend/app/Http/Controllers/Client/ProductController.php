<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;

class ProductController extends Controller
{
    // Lấy danh sách sản phẩm cho client
    public function index(Request $request)
    {
        $query = Product::with('category:id,name')
            ->where('status', 1) // Chỉ lấy sản phẩm active
            ->select('id', 'name', 'slug', 'category_id', 'description', 'price', 'discount', 'image', 'status');

        // Phân trang
        $perPage = $request->get('per_page', 12);
        $products = $query->paginate($perPage);

        $products->getCollection()->transform(function ($product) {
            return [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'category_name' => optional($product->category)->name,
                'description' => $product->description,
                'price' => $product->price,
                'discount' => $product->discount,
                'final_price' => $product->discount ? $product->price * (1 - $product->discount / 100) : $product->price,
                'image' => $product->image,
                'status' => $product->status,
            ];
        });

        return Response::json([
            'data' => $products,
            'message' => 'Success',
            'status_code' => 200
        ], 200);
    }

    // Lấy chi tiết sản phẩm cho client
    public function show($id)
    {
        $product = Product::with('category:id,name')
            ->where('status', 1)
            ->select('id', 'name', 'slug', 'category_id', 'description', 'price', 'discount', 'image', 'status')
            ->find($id);

        if (!$product) {
            return Response::json([
                'message' => 'Sản phẩm không tồn tại',
                'status_code' => 404
            ], 404);
        }

        return Response::json([
            'data' => [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'category_name' => optional($product->category)->name,
                'description' => $product->description,
                'price' => $product->price,
                'discount' => $product->discount,
                'final_price' => $product->discount ? $product->price * (1 - $product->discount / 100) : $product->price,
                'image' => $product->image,
                'status' => $product->status,
            ],
            'message' => 'Success',
            'status_code' => 200
        ], 200);
    }

    // Tìm kiếm sản phẩm cho client
    public function search(Request $request)
    {
        $request->validate([
            'keyword' => 'required|string|min:1'
        ]);

        $keyword = $request->keyword;

        $products = Product::with('category:id,name')
            ->where('status', 1)
            ->where(function($query) use ($keyword) {
                $query->where('name', 'LIKE', "%{$keyword}%")
                      ->orWhere('description', 'LIKE', "%{$keyword}%");
            })
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
                    'final_price' => $product->discount ? $product->price * (1 - $product->discount / 100) : $product->price,
                    'image' => $product->image,
                    'status' => $product->status,
                ];
            });

        return Response::json([
            'data' => $products,
            'message' => 'Tìm kiếm thành công',
            'status_code' => 200
        ], 200);
    }

    // Lọc sản phẩm cho client
    public function filter(Request $request)
    {
        $query = Product::with('category:id,name')
            ->where('status', 1)
            ->select('id', 'name', 'slug', 'category_id', 'description', 'price', 'discount', 'image', 'status');

        // Lọc theo category
        if ($request->has('category_id') && $request->category_id) {
            $query->where('category_id', $request->category_id);
        }

        // Lọc theo giá
        if ($request->has('min_price') && $request->min_price) {
            $query->where('price', '>=', $request->min_price);
        }

        if ($request->has('max_price') && $request->max_price) {
            $query->where('price', '<=', $request->max_price);
        }

        // Sắp xếp
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Phân trang
        $perPage = $request->get('per_page', 12);
        $products = $query->paginate($perPage);

        $products->getCollection()->transform(function ($product) {
            return [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'category_name' => optional($product->category)->name,
                'description' => $product->description,
                'price' => $product->price,
                'discount' => $product->discount,
                'final_price' => $product->discount ? $product->price * (1 - $product->discount / 100) : $product->price,
                'image' => $product->image,
                'status' => $product->status,
            ];
        });

        return Response::json([
            'data' => $products,
            'message' => 'Lọc sản phẩm thành công',
            'status_code' => 200
        ], 200);
    }

    // Lấy sản phẩm theo category
    public function getByCategory($categoryId)
    {
        $products = Product::with('category:id,name')
            ->where('status', 1)
            ->where('category_id', $categoryId)
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
                    'final_price' => $product->discount ? $product->price * (1 - $product->discount / 100) : $product->price,
                    'image' => $product->image,
                    'status' => $product->status,
                ];
            });

        return Response::json([
            'data' => $products,
            'message' => 'Success',
            'status_code' => 200
        ], 200);
    }
}
