<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    public function index()
    {
        try {
            $products = Product::with(['variants.color', 'variants.size'])->get();
            
            $products->each(function ($product) {
                $product->image_url = $product->image ? asset('storage/' . $product->image) : null;
                $product->hover_image_url = $product->hover_image ? asset('storage/' . $product->hover_image) : null;
                
                if ($product->variants) {
                    $product->variants->each(function ($variant) {
                        if ($variant->image) {
                            $variant->image_url = asset('storage/' . $variant->image);
                        }
                    });
                }
            });
            
            return response()->json([
                'success' => true,
                'data' => $products
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage()
            ], 500);
        }
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
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp,avif,svg,bmp|max:2048',
            'hover_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp,avif,svg,bmp|max:2048'
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
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp,avif,svg,bmp|max:2048',
            'hover_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp,avif,svg,bmp|max:2048'
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

    public function search(Request $request)
    {
        Log::info('---[SEARCH PRODUCT] Bắt đầu search', ['request' => $request->all()]);
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
        $products = $query->paginate($perPage);

        $products->getCollection()->transform(function ($product) {
            $minVariantPrice = $product->variants->min('price');
            $displayPrice = $minVariantPrice ?: $product->price;
            
            $product->final_price = $product->discount > 0
                ? $displayPrice - ($displayPrice * $product->discount / 100)
                : $displayPrice;
            
            $product->price = $displayPrice;
            $product->image_url = $product->image ? asset('storage/' . $product->image) : null;
            $product->hover_image_url = $product->hover_image ? asset('storage/' . $product->hover_image) : null;
            
            if ($product->variants) {
                $product->variants->each(function ($variant) {
                    if ($variant->image) {
                        $variant->image_url = asset('storage/' . $variant->image);
                    }
                });
            }
            
            return $product;
        });

        return response()->json([
            'success' => true,
            'data' => $products->items(),
            'pagination' => [
                'current_page' => $products->currentPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
                'total_pages' => $products->lastPage(),
            ]
        ]);
    }

    public function featured(Request $request)
    {
        $limit = $request->get('limit', 8);
        $products = Product::with(['category', 'variants.color', 'variants.size'])
            ->where('status', true)
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();

        $products->transform(function ($product) {
            $minVariantPrice = $product->variants->min('price');
            $displayPrice = $minVariantPrice ?: $product->price;

            $product->final_price = $product->discount > 0
                ? $displayPrice - ($displayPrice * $product->discount / 100)
                : $displayPrice;

            $product->price = $displayPrice;
            $product->image_url = $product->image ? asset('storage/' . $product->image) : null;
            $product->hover_image_url = $product->hover_image ? asset('storage/' . $product->hover_image) : null;

            if ($product->variants) {
                $product->variants->each(function ($variant) {
                    if ($variant->image) {
                        $variant->image_url = asset('storage/' . $variant->image);
                    }
                });
            }

            return $product;
        });

        return response()->json([
            'success' => true,
            'data' => $products
        ]);
    }

    public function byCategory(Request $request, $categoryId)
    {
        $query = Product::with(['category', 'variants.color', 'variants.size'])
            ->where('category_id', $categoryId)
            ->where('status', true);

        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');

        if (in_array($sortBy, ['name', 'price', 'created_at'])) {
            $query->orderBy($sortBy, $sortOrder);
        }

        $perPage = $request->get('per_page', 12);
        $products = $query->paginate($perPage);

        $products->getCollection()->transform(function ($product) {
            $minVariantPrice = $product->variants->min('price');
            $displayPrice = $minVariantPrice ?: $product->price;

            $product->final_price = $product->discount > 0
                ? $displayPrice - ($displayPrice * $product->discount / 100)
                : $displayPrice;

            $product->price = $displayPrice;
            $product->image_url = $product->image ? asset('storage/' . $product->image) : null;
            $product->hover_image_url = $product->hover_image ? asset('storage/' . $product->hover_image) : null;

            if ($product->variants) {
                $product->variants->each(function ($variant) {
                    if ($variant->image) {
                        $variant->image_url = asset('storage/' . $variant->image);
                    }
                });
            }

            return $product;
        });

        return response()->json([
            'success' => true,
            'data' => $products->items(),
            'pagination' => [
                'current_page' => $products->currentPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
                'total_pages' => $products->lastPage(),
            ]
        ]);
    }

    public function show($id)
    {
        Log::info("Attempting to fetch product with ID: {$id}");
        try {
            $product = Product::with([
                'category',
                'variants.color',
                'variants.size',
                'comments.user' => function ($query) {
                    $query->where('status', 1);
                }
            ])->findOrFail($id);

            $minVariantPrice = $product->variants->min('price');
            $displayPrice = $minVariantPrice ?: $product->price;

            $product->final_price = $product->discount > 0
                ? $displayPrice - ($displayPrice * $product->discount / 100)
                : $displayPrice;

            $product->price = $displayPrice;
            $product->image_url = $product->image ? asset('storage/' . $product->image) : null;
            $product->hover_image_url = $product->hover_image ? asset('storage/' . $product->hover_image) : null;

            if ($product->variants) {
                $product->variants->each(function ($variant) {
                    if ($variant->image) {
                        $variant->image_url = asset('storage/' . $variant->image);
                    }
                });
            }

            $product->average_rating = $product->comments->avg('rating');
            $product->total_reviews = $product->comments->count();

            return response()->json([
                'success' => true,
                'data' => $product
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            Log::error("Product not found with ID: {$id}");
            return response()->json(['success' => false, 'message' => 'Sản phẩm không tồn tại.'], 404);
        } catch (\Exception $e) {
            Log::error("Error fetching product ID {$id}: " . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Lỗi máy chủ nội bộ.'], 500);
        }
    }
}