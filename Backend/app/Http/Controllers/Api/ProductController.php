<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Color;
use App\Models\Size;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProductController extends Controller
{
    public function index()
    {
        return Product::all();
    }

    public function show($id)
    {
        return Product::findOrFail($id);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'category_id' => 'nullable|exists:categories,id',
            'description' => 'nullable|string',
            'price' => 'required|numeric'
        ]);
        return Product::create($data);
    }

    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);
        $product->update($request->all());
        return $product;
    }

    public function destroy($id)
    {
        return Product::destroy($id);
    }

    public function add(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'category_id' => 'nullable|exists:categories,id',
            'description' => 'nullable|string',
            'price' => 'required|numeric',
            'status' => 'boolean',
        ]);

        $product = Product::create($data);

        return response()->json([
            'message' => 'Thêm sản phẩm thành công',
            'data' => $product
        ], 201);
    }

    public function search(Request $request)
    {
        $query = Product::with(['category', 'variants.color', 'variants.size']);

        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                    ->orWhere('description', 'LIKE', "%{$search}%");
            });
        }

        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->has('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }

        if ($request->has('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('color_id')) {
            $query->whereHas('variants', fn($q) => $q->where('color_id', $request->color_id));
        }

        if ($request->has('size_id')) {
            $query->whereHas('variants', fn($q) => $q->where('size_id', $request->size_id));
        }

        if ($request->has('has_discount')) {
            if ($request->has_discount == '1') {
                $query->whereNotNull('discount')->where('discount', '>', 0);
            } else {
                $query->where(function ($q) {
                    $q->whereNull('discount')->orWhere('discount', 0);
                });
            }
        }

        if ($request->has('min_discount')) {
            $query->where('discount', '>=', $request->min_discount);
        }

        if ($request->has('max_discount')) {
            $query->where('discount', '<=', $request->max_discount);
        }

        if ($request->has('in_stock')) {
            $query->whereHas('variants', function ($q) use ($request) {
                if ($request->in_stock == '1') {
                    $q->where('stock', '>', 0);
                } else {
                    $q->where('stock', '<=', 0);
                }
            });
        }

        $sortBy = in_array($request->get('sort_by'), ['name', 'price', 'discount', 'created_at', 'updated_at']) 
                    ? $request->get('sort_by') 
                    : 'created_at';
        $sortOrder = in_array($request->get('sort_order'), ['asc', 'desc']) 
                    ? $request->get('sort_order') 
                    : 'desc';

        $query->orderBy($sortBy, $sortOrder);

        $perPage = min(max($request->get('per_page', 10), 1), 100);
        $products = $query->paginate($perPage);

        $products->getCollection()->transform(function ($product) {
            $product->final_price = $product->discount > 0 
                ? $product->price - ($product->price * $product->discount / 100)
                : $product->price;
            return $product;
        });

        return response()->json([
            'success' => true,
            'message' => 'Tìm kiếm sản phẩm thành công',
            'data' => $products->items(),
            'pagination' => [
                'current_page' => $products->currentPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
                'total_pages' => $products->lastPage(),
                'has_next_page' => $products->hasMorePages(),
                'has_prev_page' => $products->currentPage() > 1,
            ],
            'filters' => $request->all()
        ]);
    }

    public function featured(Request $request)
    {
        $limit = min(max($request->get('limit', 8), 1), 20);

        $products = Product::with(['category', 'variants.color', 'variants.size'])
            ->where('status', true)
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();

        $products->transform(function ($product) {
            $product->final_price = $product->discount > 0
                ? $product->price - ($product->price * $product->discount / 100)
                : $product->price;
            return $product;
        });

        return response()->json([
            'success' => true,
            'message' => 'Lấy sản phẩm nổi bật thành công',
            'data' => $products,
            'total' => $products->count()
        ]);
    }

    public function byCategory(Request $request, $categoryId)
    {
        $query = Product::with(['category', 'variants.color', 'variants.size'])
            ->where('category_id', $categoryId)
            ->where('status', true);

        $sortBy = in_array($request->get('sort_by'), ['name', 'price', 'discount', 'created_at']) 
                    ? $request->get('sort_by') 
                    : 'created_at';
        $sortOrder = in_array($request->get('sort_order'), ['asc', 'desc']) 
                    ? $request->get('sort_order') 
                    : 'desc';

        $query->orderBy($sortBy, $sortOrder);

        $perPage = min(max($request->get('per_page', 12), 1), 50);
        $products = $query->paginate($perPage);

        $products->getCollection()->transform(function ($product) {
            $product->final_price = $product->discount > 0
                ? $product->price - ($product->price * $product->discount / 100)
                : $product->price;
            return $product;
        });

        return response()->json([
            'success' => true,
            'message' => 'Lấy sản phẩm theo danh mục thành công',
            'data' => $products->items(),
            'pagination' => [
                'current_page' => $products->currentPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
                'total_pages' => $products->lastPage(),
                'has_next_page' => $products->hasMorePages(),
                'has_prev_page' => $products->currentPage() > 1,
            ]
        ]);
    }

    public function onSale(Request $request)
    {
        $query = Product::with(['category', 'variants.color', 'variants.size'])
            ->where('status', true)
            ->whereNotNull('discount')
            ->where('discount', '>', 0)
            ->orderBy('discount', 'desc');

        $perPage = min(max($request->get('per_page', 12), 1), 50);
        $products = $query->paginate($perPage);

        $products->getCollection()->transform(function ($product) {
            $product->final_price = $product->price - ($product->price * $product->discount / 100);
            return $product;
        });

        return response()->json([
            'success' => true,
            'message' => 'Lấy sản phẩm đang giảm giá thành công',
            'data' => $products->items(),
            'pagination' => [
                'current_page' => $products->currentPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
                'total_pages' => $products->lastPage(),
                'has_next_page' => $products->hasMorePages(),
                'has_prev_page' => $products->currentPage() > 1,
            ]
        ]);
    }

    public function detail($id)
    {
        $product = Product::with([
            'category',
            'variants.color',
            'variants.size',
            'comments.user' => function ($query) {
                $query->where('status', 1);
            }
        ])->findOrFail($id);

        $product->final_price = $product->discount > 0
            ? $product->price - ($product->price * $product->discount / 100)
            : $product->price;

        $product->average_rating = $product->comments->avg('rating');
        $product->total_reviews = $product->comments->count();

        return response()->json([
            'success' => true,
            'message' => 'Lấy thông tin sản phẩm thành công',
            'data' => $product
        ]);
    }
}
