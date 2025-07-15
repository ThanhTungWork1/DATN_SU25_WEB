<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    public function index()
    {
        return Product::all();
    }

    public function show($id)
    {
        $product = Product::with(['variants.size', 'variants.color'])->findOrFail($id);
        return response()->json([
            'data' => $product,
            'image_url' => $product->image ? asset('storage/' . $product->image) : null,
            'hover_image_url' => $product->hover_image ? asset('storage/' . $product->hover_image) : null
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'category_id' => 'nullable|exists:categories,id',
            'description' => 'nullable|string',
            'price' => 'required|numeric',
            'status' => 'boolean|nullable',
            'discount' => 'nullable|numeric',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'hover_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048'
        ]);

        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $filename = 'images/' . Str::random(10) . '.' . $image->getClientOriginalExtension();
            $image->storeAs('public', $filename);
            $data['image'] = $filename;
        }

        if ($request->hasFile('hover_image')) {
            $hoverImage = $request->file('hover_image');
            $filename = 'images/' . Str::random(10) . '.' . $hoverImage->getClientOriginalExtension();
            $hoverImage->storeAs('public', $filename);
            $data['hover_image'] = $filename;
        }

        $product = Product::create($data);

        return response()->json([
            'message' => 'Thêm sản phẩm thành công',
            'data' => $product,
            'image_url' => $product->image ? asset('storage/' . $product->image) : null,
            'hover_image_url' => $product->hover_image ? asset('storage/' . $product->hover_image) : null
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'name' => 'string|nullable',
            'category_id' => 'nullable|exists:categories,id',
            'description' => 'nullable|string',
            'price' => 'numeric|nullable',
            'status' => 'boolean|nullable',
            'discount' => 'nullable|numeric',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'hover_image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048'
        ]);

        if ($request->hasFile('image')) {
            if ($product->image && Storage::exists('public/' . $product->image)) {
                Storage::delete('public/' . $product->image);
            }
            $image = $request->file('image');
            $filename = 'images/' . Str::random(10) . '.' . $image->getClientOriginalExtension();
            $image->storeAs('public', $filename);
            $validated['image'] = $filename;
        }

        if ($request->hasFile('hover_image')) {
            if ($product->hover_image && Storage::exists('public/' . $product->hover_image)) {
                Storage::delete('public/' . $product->hover_image);
            }
            $hoverImage = $request->file('hover_image');
            $filename = 'images/' . Str::random(10) . '.' . $hoverImage->getClientOriginalExtension();
            $hoverImage->storeAs('public', $filename);
            $validated['hover_image'] = $filename;
        }

        $product->update($validated);

        return response()->json([
            'message' => 'Cập nhật sản phẩm thành công',
            'data' => $product,
            'image_url' => $product->image ? asset('storage/' . $product->image) : null,
            'hover_image_url' => $product->hover_image ? asset('storage/' . $product->hover_image) : null
        ]);
    }

    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        if ($product->image && Storage::exists('public/' . $product->image)) {
            Storage::delete('public/' . $product->image);
        }
        if ($product->hover_image && Storage::exists('public/' . $product->hover_image)) {
            Storage::delete('public/' . $product->hover_image);
        }
        $product->delete();
        return response()->json(['message' => 'Xóa sản phẩm thành công']);
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

    //search
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

        if ($request->has('category_id') && !empty($request->category_id)) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->has('min_price') && !empty($request->min_price)) {
            $query->where('price', '>=', $request->min_price);
        }

        if ($request->has('max_price') && !empty($request->max_price)) {
            $query->where('price', '<=', $request->max_price);
        }

        if ($request->has('status') && $request->status !== '') {
            $query->where('status', $request->status);
        }

        if ($request->has('color_id') && !empty($request->color_id)) {
            $query->whereHas('variants', function ($q) use ($request) {
                $q->where('color_id', $request->color_id);
            });
        }

        if ($request->has('size_id') && !empty($request->size_id)) {
            $query->whereHas('variants', function ($q) use ($request) {
                $q->where('size_id', $request->size_id);
            });
        }

        // Filter theo chất liệu (material)
        if ($request->has('materials') && !empty($request->materials)) {
            $materials = $request->materials;
            if (is_array($materials)) {
                $query->whereIn('material', $materials);
            } else {
                $query->where('material', $materials);
            }
        }

        if ($request->has('has_discount') && $request->has_discount !== '') {
            if ($request->has_discount == '1') {
                $query->whereNotNull('discount')->where('discount', '>', 0);
            } else {
                $query->where(function ($q) {
                    $q->whereNull('discount')->orWhere('discount', 0);
                });
            }
        }

        if ($request->has('min_discount') && !empty($request->min_discount)) {
            $query->where('discount', '>=', $request->min_discount);
        }

        if ($request->has('max_discount') && !empty($request->max_discount)) {
            $query->where('discount', '<=', $request->max_discount);
        }

        if ($request->has('in_stock') && $request->in_stock !== '') {
            if ($request->in_stock == '1') {
                $query->whereHas('variants', function ($q) {
                    $q->where('stock', '>', 0);
                });
            } else {
                $query->whereHas('variants', function ($q) {
                    $q->where('stock', '<=', 0);
                });
            }
        }

        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');

        $allowedSortFields = ['name', 'price', 'discount', 'created_at', 'updated_at'];
        if (!in_array($sortBy, $allowedSortFields)) {
            $sortBy = 'created_at';
        }

        if (!in_array($sortOrder, ['asc', 'desc'])) {
            $sortOrder = 'desc';
        }

        $query->orderBy($sortBy, $sortOrder);

        $perPage = $request->get('per_page', 10);
        $perPage = min(max($perPage, 1), 100);

        $products = $query->paginate($perPage);

        $products->getCollection()->transform(function ($product) {
            if ($product->discount && $product->discount > 0) {
                $product->final_price = $product->price - ($product->price * $product->discount / 100);
            } else {
                $product->final_price = $product->price;
            }
            $product->image_url = $product->image ? asset('storage/' . $product->image) : null;
            $product->hover_image_url = $product->hover_image ? asset('storage/' . $product->hover_image) : null;
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
            'filters' => [
                'search' => $request->search ?? null,
                'category_id' => $request->category_id ?? null,
                'min_price' => $request->min_price ?? null,
                'max_price' => $request->max_price ?? null,
                'status' => $request->status ?? null,
                'color_id' => $request->color_id ?? null,
                'size_id' => $request->size_id ?? null,
                'has_discount' => $request->has_discount ?? null,
                'min_discount' => $request->min_discount ?? null,
                'max_discount' => $request->max_discount ?? null,
                'in_stock' => $request->in_stock ?? null,
                'sort_by' => $sortBy,
                'sort_order' => $sortOrder,
            ]
        ]);
    }

    public function featured(Request $request)
    {
        $limit = $request->get('limit', 8);
        $limit = min(max($limit, 1), 20);

        $products = Product::with(['category', 'variants.color', 'variants.size'])
            ->where('status', true)
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();

        $products->transform(function ($product) {
            if ($product->discount && $product->discount > 0) {
                $product->final_price = $product->price - ($product->price * $product->discount / 100);
            } else {
                $product->final_price = $product->price;
            }
            $product->image_url = $product->image ? asset('storage/' . $product->image) : null;
            $product->hover_image_url = $product->hover_image ? asset('storage/' . $product->hover_image) : null;
            return $product;
        });

        return response()->json([
            'success' => true,
            'message' => 'Lấy sản phẩm nổi bật thành công',
            'data' => $products,
            'total' => $products->count()
        ]);
    }

    /**
     * Lấy sản phẩm theo danh mục
     */
    public function byCategory(Request $request, $categoryId)
    {
        $query = Product::with(['category', 'variants.color', 'variants.size'])
            ->where('category_id', $categoryId)
            ->where('status', true);

        // Sắp xếp
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');

        $allowedSortFields = ['name', 'price', 'discount', 'created_at'];
        if (!in_array($sortBy, $allowedSortFields)) {
            $sortBy = 'created_at';
        }

        if (!in_array($sortOrder, ['asc', 'desc'])) {
            $sortOrder = 'desc';
        }

        $query->orderBy($sortBy, $sortOrder);

        // Phân trang
        $perPage = $request->get('per_page', 12);
        $perPage = min(max($perPage, 1), 50);

        $products = $query->paginate($perPage);

        $products->getCollection()->transform(function ($product) {
            if ($product->discount && $product->discount > 0) {
                $product->final_price = $product->price - ($product->price * $product->discount / 100);
            } else {
                $product->final_price = $product->price;
            }
            $product->image_url = $product->image ? asset('storage/' . $product->image) : null;
            $product->hover_image_url = $product->hover_image ? asset('storage/' . $product->hover_image) : null;
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

    /**
     * Lấy sản phẩm có discount
     */
    public function onSale(Request $request)
    {
        $query = Product::with(['category', 'variants.color', 'variants.size'])
            ->where('status', true)
            ->whereNotNull('discount')
            ->where('discount', '>', 0);

        $query->orderBy('discount', 'desc');

        // Phân trang
        $perPage = $request->get('per_page', 12);
        $perPage = min(max($perPage, 1), 50);

        $products = $query->paginate($perPage);

        $products->getCollection()->transform(function ($product) {
            $product->final_price = $product->price - ($product->price * $product->discount / 100);
            $product->image_url = $product->image ? asset('storage/' . $product->image) : null;
            $product->hover_image_url = $product->hover_image ? asset('storage/' . $product->hover_image) : null;
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

    /**
     * Lấy thông tin chi tiết sản phẩm với variants và comments
     */
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

        if ($product->discount && $product->discount > 0) {
            $product->final_price = $product->price - ($product->price * $product->discount / 100);
        } else {
            $product->final_price = $product->price;
        }

        // Tính rating trung bình
        $product->average_rating = $product->comments->avg('rating');
        $product->total_reviews = $product->comments->count();

        return response()->json([
            'success' => true,
            'message' => 'Lấy thông tin sản phẩm thành công',
            'data' => $product,
            'image_url' => $product->image ? asset('storage/' . $product->image) : null,
            'hover_image_url' => $product->hover_image ? asset('storage/' . $product->hover_image) : null
        ]);
    }
}