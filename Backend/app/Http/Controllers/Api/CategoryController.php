<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class CategoryController extends Controller
{
    public function index()
    {
        $categories = Cache::remember('categories_all', 3600, function () {
            return Category::all();
        });
        return response()->json(['data' => $categories]);
    }

    /**
     * Lấy thông tin danh mục theo ID
     */
    public function show($id)
    {
        $category = Category::withCount(['products' => function ($query) {
            $query->where('status', true);
        }])->findOrFail($id);

        // Thêm thống kê sản phẩm trong danh mục
        $category->stats = [
            'total_products' => $category->products_count,
            'products_with_discount' => Product::where('category_id', $id)
                ->where('status', true)
                ->whereNotNull('discount')
                ->where('discount', '>', 0)
                ->count(),
            'price_range' => [
                'min' => Product::where('category_id', $id)->where('status', true)->min('price'),
                'max' => Product::where('category_id', $id)->where('status', true)->max('price')
            ]
        ];

        return response()->json([
            'success' => true,
            'message' => 'Lấy thông tin danh mục thành công',
            'data' => $category
        ]);
    }

    /**
     * Lấy danh mục có sản phẩm
     */
    public function withProducts()
    {
        $categories = Category::withCount(['products' => function ($query) {
            $query->where('status', true);
        }])
            ->having('products_count', '>', 0)
            ->where('status', true)
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Lấy danh mục có sản phẩm thành công',
            'data' => $categories
        ]);
    }

    /**
     * Lấy thống kê tổng quan về danh mục
     */
    public function stats()
    {
        $stats = [
            'total_categories' => Category::where('status', true)->count(),
            'categories_with_products' => Category::whereHas('products', function ($query) {
                $query->where('status', true);
            })->where('status', true)->count(),
            'top_categories' => Category::withCount(['products' => function ($query) {
                $query->where('status', true);
            }])
                ->where('status', true)
                ->having('products_count', '>', 0)
                ->orderBy('products_count', 'desc')
                ->limit(5)
                ->get()
        ];

        return response()->json([
            'success' => true,
            'message' => 'Lấy thống kê danh mục thành công',
            'data' => $stats
        ]);
    }
}
