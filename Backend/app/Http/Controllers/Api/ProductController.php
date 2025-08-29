<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use App\Models\OrderItem;
use App\Services\CacheService;
use Carbon\Carbon;

class ProductController extends Controller
{
    public function index()
    {
        try {
            $products = Product::with(['category', 'variants.color', 'variants.size'])->get();
            
            return response()->json(['success' => true, 'data' => $products]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:products,slug',
            'category_id' => 'nullable|exists:categories,id',
            'description' => 'nullable|string',
            'price' => 'required|numeric',
            'old_price' => 'nullable|numeric',
            'material' => 'nullable|string',
            'status' => 'boolean|nullable',
            'discount' => 'nullable|numeric',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp,avif,svg,bmp|max:2048',
            'hover_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp,avif,svg,bmp|max:2048',
            'variants' => 'nullable|array',
            'variants.*.color_id' => 'required|exists:colors,id',
            'variants.*.size_id' => 'required|exists:sizes,id',
            'variants.*.sku' => 'nullable|string|max:255|unique:product_variants,sku',
            'variants.*.stock' => 'required|integer|min:0',
            'variants.*.variant_price' => 'required|numeric|min:0',
        ]);

        Log::info('Validated data for new product:', $validated);

        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $imageName = Str::slug(pathinfo($image->getClientOriginalName(), PATHINFO_FILENAME));
            $filename = $imageName . '-' . uniqid() . '.' . $image->getClientOriginalExtension();
            $image->move(public_path('storage/images'), $filename);
            $validated['image'] = 'images/' . $filename;
        }

        if ($request->hasFile('hover_image')) {
            $hoverImage = $request->file('hover_image');
            $hoverImageName = Str::slug(pathinfo($hoverImage->getClientOriginalName(), PATHINFO_FILENAME));
            $filename = $hoverImageName . '-' . uniqid() . '.' . $hoverImage->getClientOriginalExtension();
            $hoverImage->move(public_path('storage/images'), $filename);
            $validated['hover_image'] = 'images/' . $filename;
        }

        // Tự động tạo slug nếu không được cung cấp
        $slug = $validated['slug'] ?? Str::slug($validated['name']);

        // Xử lý slug bị trùng
        $originalSlug = $slug;
        $counter = 1;
        while (Product::where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . Str::random(4); // Thêm hậu tố ngẫu nhiên
        }
        $validated['slug'] = $slug;


        $product = Product::create($validated);

        if (!empty($validated['variants'])) {
            foreach ($validated['variants'] as $index => $variantData) {
                // Xử lý ảnh cho từng biến thể
                if ($request->hasFile("variant_images.{$index}")) {
                    $variantImage = $request->file("variant_images.{$index}");
                    $variantImageName = Str::slug(pathinfo($variantImage->getClientOriginalName(), PATHINFO_FILENAME));
                    $filename = $variantImageName . '-' . uniqid() . '.' . $variantImage->getClientOriginalExtension();
                    $variantImage->move(public_path('storage/images'), $filename);
                    $variantData['image'] = 'images/' . $filename;
                } else {
                    // Đảm bảo trường image là null nếu không có ảnh được tải lên
                    $variantData['image'] = null;
                }

                // Ánh xạ variant_price từ request vào cột price của DB
                if (isset($variantData['variant_price'])) {
                    $variantData['price'] = $variantData['variant_price'];
                    unset($variantData['variant_price']);
                }

                $product->variants()->create($variantData);
            }
        }

        $product->refresh()->load('variants.color', 'variants.size');

        return response()->json([
            'message' => 'Thêm sản phẩm thành công',
            'data' => $product
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        // Log request data for debugging
        Log::info('Product update request data:', [
            'id' => $id,
            'request_data' => $request->except(['image', 'hover_image']),
            'has_image' => $request->hasFile('image'),
            'has_hover_image' => $request->hasFile('hover_image'),
            'remove_image' => $request->get('remove_image'),
            'remove_hover_image' => $request->get('remove_hover_image'),
            'all_files' => $request->allFiles(),
            'file_count' => count($request->allFiles()),
            'slug_from_request' => $request->get('slug'),
            'name_from_request' => $request->get('name')
        ]);

        $validated = $request->validate([
            'name' => 'string|nullable',
            'slug' => 'string|nullable', // Bỏ unique validation, sẽ xử lý thủ công
            'category_id' => 'nullable|exists:categories,id',
            'description' => 'nullable|string',
            'price' => 'numeric|nullable',
            'old_price' => 'numeric|nullable',
            'material' => 'string|nullable',
            'status' => 'boolean|nullable',
            'discount' => 'nullable|numeric',
            'sold' => 'integer|nullable',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp,avif,svg,bmp|max:2048',
            'hover_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp,avif,svg,bmp|max:2048'
        ]);

        // Handle main image update/removal
        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($product->image && file_exists(public_path('storage/' . $product->image))) {
                unlink(public_path('storage/' . $product->image));
            }
            // Upload new image
            $image = $request->file('image');
            $imageName = Str::slug(pathinfo($image->getClientOriginalName(), PATHINFO_FILENAME));
            $filename = $imageName . '-' . uniqid() . '.' . $image->getClientOriginalExtension();
            $image->move(public_path('storage/images'), $filename);
            $validated['image'] = 'images/' . $filename;
        } elseif ($request->has('remove_image') && $request->remove_image == '1') {
            // Remove existing image
            if ($product->image && file_exists(public_path('storage/' . $product->image))) {
                unlink(public_path('storage/' . $product->image));
            }
            $validated['image'] = null;
        }

        // Handle hover image update/removal
        if ($request->hasFile('hover_image')) {
            // Delete old hover image if exists
            if ($product->hover_image && file_exists(public_path('storage/' . $product->hover_image))) {
                unlink(public_path('storage/' . $product->hover_image));
            }
            // Upload new hover image
            $hoverImage = $request->file('hover_image');
            $hoverImageName = Str::slug(pathinfo($hoverImage->getClientOriginalName(), PATHINFO_FILENAME));
            $filename = $hoverImageName . '-' . uniqid() . '.' . $hoverImage->getClientOriginalExtension();
            $hoverImage->move(public_path('storage/images'), $filename);
            $validated['hover_image'] = 'images/' . $filename;
        } elseif ($request->has('remove_hover_image') && $request->remove_hover_image == '1') {
            // Remove existing hover image
            if ($product->hover_image && file_exists(public_path('storage/' . $product->hover_image))) {
                unlink(public_path('storage/' . $product->hover_image));
            }
            $validated['hover_image'] = null;
        }

        // Xử lý slug tự động nếu không được cung cấp hoặc bị trùng
        Log::info('=== SLUG PROCESSING START ===', [
            'validated_name' => $validated['name'] ?? 'NOT_SET',
            'validated_slug' => $validated['slug'] ?? 'NOT_SET',
            'product_id' => $id
        ]);

        if (isset($validated['name'])) {
            if (!isset($validated['slug']) || empty($validated['slug'])) {
                // Tạo slug từ name nếu không có slug
                $slug = Str::slug($validated['name']);
                Log::info('Creating slug from name', ['name' => $validated['name'], 'generated_slug' => $slug]);
            } else {
                // Sử dụng slug được cung cấp
                $slug = $validated['slug'];
                Log::info('Using provided slug', ['slug' => $slug]);
            }
            
            // Kiểm tra và tạo slug unique
            $originalSlug = $slug;
            $counter = 1;
            while (Product::where('slug', $slug)->where('id', '!=', $id)->exists()) {
                $slug = $originalSlug . '-' . Str::random(4);
                Log::info('Slug exists, generating new one', ['attempt' => $counter, 'new_slug' => $slug]);
                $counter++;
            }
            $validated['slug'] = $slug;
            Log::info('Final slug set', ['final_slug' => $slug]);
        } elseif (isset($validated['slug']) && !empty($validated['slug'])) {
            // Nếu chỉ có slug mà không có name, vẫn kiểm tra unique
            $slug = $validated['slug'];
            Log::info('Processing slug without name', ['slug' => $slug]);
            $originalSlug = $slug;
            $counter = 1;
            while (Product::where('slug', $slug)->where('id', '!=', $id)->exists()) {
                $slug = $originalSlug . '-' . Str::random(4);
                Log::info('Slug exists, generating new one', ['attempt' => $counter, 'new_slug' => $slug]);
                $counter++;
            }
            $validated['slug'] = $slug;
            Log::info('Final slug set', ['final_slug' => $slug]);
        } else {
            Log::info('No name or slug provided, skipping slug processing');
        }

        Log::info('=== SLUG PROCESSING END ===', ['final_validated_slug' => $validated['slug'] ?? 'NOT_SET']);

        // Validation thủ công cho slug sau khi đã xử lý
        if (isset($validated['slug']) && !empty($validated['slug'])) {
            $existingProduct = Product::where('slug', $validated['slug'])->where('id', '!=', $id)->first();
            if ($existingProduct) {
                return response()->json([
                    'message' => 'Slug đã tồn tại trong hệ thống',
                    'errors' => ['slug' => ['Slug đã tồn tại trong hệ thống']]
                ], 422);
            }
        }

        $product->update($validated);
        
        // Log successful update
        Log::info('Product updated successfully:', [
            'product_id' => $product->id,
            'image' => $product->image,
            'hover_image' => $product->hover_image,
            'image_url' => $product->image_url,
            'hover_image_url' => $product->hover_image_url
        ]);

        // Handle variant updates if provided
        if ($request->has('variants') && is_array($request->variants)) {
            foreach ($request->variants as $index => $variantData) {
                if (isset($variantData['id'])) {
                    // Update existing variant
                    $variant = $product->variants()->find($variantData['id']);
                    if ($variant) {
                        // Handle variant image update/removal
                        if ($request->hasFile("variant_images.{$index}")) {
                            $variantImage = $request->file("variant_images.{$index}");
                            
                            // Kiểm tra xem file có thực sự thay đổi không
                            if ($variantImage->isValid() && $variantImage->getSize() > 0) {
                                // Delete old variant image if exists
                                if ($variant->image && file_exists(public_path('storage/' . $variant->image))) {
                                    unlink(public_path('storage/' . $variant->image));
                                }
                                // Upload new variant image
                                $variantImageName = Str::slug(pathinfo($variantImage->getClientOriginalName(), PATHINFO_FILENAME));
                                $filename = $variantImageName . '-' . uniqid() . '.' . $variantImage->getClientOriginalExtension();
                                $variantImage->move(public_path('storage/images'), $filename);
                                $variantData['image'] = 'images/' . $filename;
                            }
                        } elseif ($request->has("remove_variant_image.{$index}") && $request->input("remove_variant_image.{$index}") == '1') {
                            // Remove existing variant image
                            if ($variant->image && file_exists(public_path('storage/' . $variant->image))) {
                                unlink(public_path('storage/' . $variant->image));
                            }
                            $variantData['image'] = null;
                        }

                        // Map variant_price to price if provided
                        if (isset($variantData['variant_price'])) {
                            $variantData['price'] = $variantData['variant_price'];
                            unset($variantData['variant_price']);
                        }

                        $variant->update($variantData);
                    }
                } else {
                    // Create new variant
                    $newVariantData = [
                        'product_id' => $product->id,
                        'color_id' => $variantData['color_id'],
                        'size_id' => $variantData['size_id'],
                        'stock' => $variantData['stock'],
                        'price' => $variantData['variant_price'] ?? $variantData['price'] ?? 0,
                        'sku' => $variantData['sku'] ?? null,
                    ];

                    // Handle variant image upload for new variant
                    if ($request->hasFile("variant_images.{$index}")) {
                        $variantImage = $request->file("variant_images.{$index}");
                        
                        // Chỉ upload nếu file hợp lệ
                        if ($variantImage->isValid() && $variantImage->getSize() > 0) {
                            $variantImageName = Str::slug(pathinfo($variantImage->getClientOriginalName(), PATHINFO_FILENAME));
                            $filename = $variantImageName . '-' . uniqid() . '.' . $variantImage->getClientOriginalExtension();
                            $variantImage->move(public_path('storage/images'), $filename);
                            $newVariantData['image'] = 'images/' . $filename;
                        }
                    }

                    $product->variants()->create($newVariantData);
                }
            }
        }

        $product->refresh()->load('variants.color', 'variants.size');

        return response()->json([
            'message' => 'Cập nhật sản phẩm thành công',
            'data' => $product
        ]);
    }

    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        if ($product->image && file_exists(public_path('storage/' . $product->image))) {
            unlink(public_path('storage/' . $product->image));
        }
        if ($product->hover_image && file_exists(public_path('storage/' . $product->hover_image))) {
            unlink(public_path('storage/' . $product->hover_image));
        }
        $product->delete();
        return response()->json(['message' => 'Xóa sản phẩm thành công']);
    }

    public function search(Request $request)
    {
        $startTime = microtime(true);
        
        // Tạo cache key từ request params
        $cacheKey = 'product_search_' . md5(json_encode($request->all()));
        
        // Thử lấy từ cache trước
        if (Cache::has($cacheKey)) {
            $cachedResult = Cache::get($cacheKey);
            Log::info('---[SEARCH PRODUCT] Cache hit, response time: ' . (microtime(true) - $startTime) * 1000 . 'ms');
            return response()->json($cachedResult);
        }

        // Tối ưu query - chỉ select fields cần thiết
        $query = Product::select([
            'id', 'name', 'price', 'old_price', 'image', 'hover_image', 
            'category_id', 'status', 'material', 'slug', 'created_at', 'sold'
        ])
        ->with([
            'category:id,name', // Chỉ load id và name của category
            'variants:id,product_id', // Load variants để tính sold count
        ])
        ->where('status', true);

        // Tối ưu search với smart logic
        if ($request->has('search') && !empty($request->search)) {
            $search = trim($request->search);
            
            // Tách từ khóa thành các từ riêng biệt
            $keywords = array_filter(explode(' ', $search));
            
            if (count($keywords) > 1) {
                // Nhiều từ khóa - tìm kiếm thông minh hơn
                // Ưu tiên tìm trong tên sản phẩm trước
                $query->where(function ($q) use ($keywords) {
                    foreach ($keywords as $keyword) {
                        if (strlen($keyword) > 1) {
                            $q->where('name', 'LIKE', "%{$keyword}%");
                        }
                    }
                });
                
                // Nếu không đủ kết quả, tìm trong category
                $count = $query->count();
                if ($count < 3) {
                    $query->orWhere(function ($q) use ($keywords) {
                        foreach ($keywords as $keyword) {
                            if (strlen($keyword) > 1) {
                                $q->whereHas('category', function ($catQ) use ($keyword) {
                                    $catQ->where('name', 'LIKE', "%{$keyword}%");
                                });
                            }
                        }
                    });
                }
                
                // Nếu vẫn không đủ, mở rộng tìm trong description
                $count = $query->count();
                if ($count < 5) {
                    $query->orWhere(function ($q) use ($keywords) {
                        foreach ($keywords as $keyword) {
                            if (strlen($keyword) > 1) {
                                $q->where('description', 'LIKE', "%{$keyword}%");
                            }
                        }
                    });
                }
            } else {
                // Một từ khóa - ưu tiên tìm trong tên và category
                if (strlen($search) > 2) {
                    try {
                        // Ưu tiên tìm trong tên sản phẩm trước (chính xác nhất)
                        $query->where(function ($q) use ($search) {
                            $q->where('name', 'LIKE', "%{$search}%");
                        });
                        
                        // Nếu không tìm thấy đủ kết quả, tìm trong category
                        $count = $query->count();
                        if ($count < 3) {
                            $query->orWhereHas('category', function ($catQ) use ($search) {
                                $catQ->where('name', 'LIKE', "%{$search}%");
                            });
                        }
                        
                        // Nếu vẫn không đủ, mở rộng tìm trong description
                        $count = $query->count();
                        if ($count < 5) {
                            $query->orWhere('description', 'LIKE', "%{$search}%");
                        }
                    } catch (\Exception $e) {
                        // Fallback về LIKE nếu full-text search lỗi
                        $query->where(function ($q) use ($search) {
                            $q->where('name', 'LIKE', "%{$search}%");
                        });
                        
                        // Nếu không đủ kết quả, tìm trong category
                        $count = $query->count();
                        if ($count < 3) {
                            $query->orWhereHas('category', function ($catQ) use ($search) {
                                $catQ->where('name', 'LIKE', "%{$search}%");
                            });
                        }
                    }
                } else {
                    // Từ khóa ngắn - chỉ tìm trong tên sản phẩm
                    $query->where('name', 'LIKE', "%{$search}%");
                }
            }
            
            // Track search analytics
            CacheService::incrementSearchCount($search);
        }

        // Filter theo category
        if ($request->has('category_id') && !empty($request->category_id)) {
            $query->where('category_id', $request->category_id);
        }

        // Filter theo giá
        if ($request->has('min_price') && !empty($request->min_price)) {
            $query->where('price', '>=', (int) $request->min_price);
        }

        if ($request->has('max_price') && !empty($request->max_price)) {
            $query->where('price', '<=', (int) $request->max_price);
        }

        // Filter theo màu sắc - chỉ khi cần thiết
        if ($request->has('color_id') && !empty($request->color_id)) {
            $query->whereHas('variants', function ($q) use ($request) {
                $q->select('product_id')->where('color_id', $request->color_id);
            });
        }

        // Filter theo kích thước - chỉ khi cần thiết
        if ($request->has('size_id') && !empty($request->size_id)) {
            $query->whereHas('variants', function ($q) use ($request) {
                $q->select('product_id')->where('size_id', $request->size_id);
            });
        }

        // Filter theo chất liệu
        if ($request->has('materials') && !empty($request->materials)) {
            $materials = explode(',', $request->materials);
            $query->whereIn('material', $materials);
        }

        // Filter theo stock (còn hàng/hết hàng)
        if ($request->has('in_stock')) {
            if ($request->in_stock === 'true' || $request->in_stock === true) {
                // Chỉ hiển thị sản phẩm còn hàng
                $query->whereHas('variants', function($q) {
                    $q->where('stock', '>', 0);
                });
            } elseif ($request->in_stock === 'false' || $request->in_stock === false) {
                // Chỉ hiển thị sản phẩm hết hàng
                $query->whereDoesntHave('variants', function($q) {
                    $q->where('stock', '>', 0);
                });
            }
        }

        // Filter theo rating
        if ($request->has('min_rating') && is_numeric($request->min_rating)) {
            $minRating = floatval($request->min_rating);
            $query->where('average_rating', '>=', $minRating);
        }

        // Sắp xếp
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');

        // Quick filter presets
        $preset = $request->get('preset');
        if ($preset) {
            switch ($preset) {
                case 'new_arrivals':
                    $sortBy = 'created_at';
                    $sortOrder = 'desc';
                    break;
                case 'best_sellers':
                    $sortBy = 'sold';
                    $sortOrder = 'desc';
                    break;
                case 'price_low_to_high':
                    $sortBy = 'price';
                    $sortOrder = 'asc';
                    break;
                case 'price_high_to_low':
                    $sortBy = 'price';
                    $sortOrder = 'desc';
                    break;
                case 'name_a_to_z':
                    $sortBy = 'name';
                    $sortOrder = 'asc';
                    break;
                case 'name_z_to_a':
                    $sortBy = 'name';
                    $sortOrder = 'desc';
                    break;
                default:
                    $sortBy = 'created_at';
                    $sortOrder = 'desc';
            }
        }

        $allowedSortFields = ['name', 'price', 'created_at', 'sold'];
        if (!in_array($sortBy, $allowedSortFields)) {
            $sortBy = 'created_at';
        }

        if (!in_array($sortOrder, ['asc', 'desc'])) {
            $sortOrder = 'desc';
        }

        $query->orderBy($sortBy, $sortOrder);

        // Phân trang
        $perPage = min($request->get('per_page', 15), 50); // Giới hạn max 50 items
        $products = $query->paginate($perPage);

        // Tính toán sold count real-time cho từng sản phẩm
        $products->getCollection()->transform(function ($product) {
            $variantIds = $product->variants->pluck('id');
            $soldQuantity = 0;
            
            if ($variantIds->count() > 0) {
                $soldQuantity = \App\Models\OrderItem::whereIn('variant_id', $variantIds)
                    ->join('orders', 'order_items.order_id', '=', 'orders.id')
                    ->whereIn('orders.status', ['delivered', 'completed'])
                    ->sum('order_items.quantity');
            }
            
            // Ghi đè field sold với giá trị tính toán real-time
            $product->sold = (int) $soldQuantity;
            return $product;
        });

        // Format response
        $result = [
            'success' => true,
            'data' => $products->items(),
            'pagination' => [
                'current_page' => $products->currentPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
                'total_pages' => $products->lastPage(),
            ]
        ];

        // Cache kết quả trong 5 phút
        Cache::put($cacheKey, $result, 300);

        $executionTime = (microtime(true) - $startTime) * 1000;
        Log::info('---[SEARCH PRODUCT] Query executed in: ' . $executionTime . 'ms');

        return response()->json($result);
    }

    /**
     * Get search suggestions for auto-complete
     */
    public function getSearchSuggestions(Request $request)
    {
        $query = $request->get('q', '');
        
        if (strlen($query) < 2) {
            return response()->json(['suggestions' => []]);
        }

        // Cache suggestions
        $cacheKey = 'search_suggestions_' . md5($query);
        $cached = Cache::get($cacheKey);
        
        if ($cached) {
            return response()->json(['suggestions' => $cached]);
        }

        // Get product suggestions - ưu tiên tìm trong tên sản phẩm trước
        $productSuggestions = Product::select('id', 'name', 'slug')
            ->where('status', true)
            ->where('name', 'LIKE', "%{$query}%")
            ->limit(5)
            ->get()
            ->map(function($product) {
                return [
                    'id' => $product->id,
                    'text' => $product->name,
                    'type' => 'product',
                    'url' => "/products/{$product->id}"
                ];
            });

        // Get category suggestions
        $categorySuggestions = \App\Models\Category::select('id', 'name')
            ->where('status', 'active')
            ->where('name', 'LIKE', "%{$query}%")
            ->limit(3)
            ->get()
            ->map(function($category) {
                return [
                    'id' => $category->id,
                    'text' => $category->name,
                    'type' => 'category',
                    'url' => "/products?category={$category->id}"
                ];
            });

        // Get popular searches
        $popularSearches = CacheService::getCachedPopularSearches();
        $popularSuggestions = [];
        
        foreach ($popularSearches as $search => $count) {
            if (stripos($search, $query) !== false) {
                $popularSuggestions[] = [
                    'id' => 'popular_' . md5($search),
                    'text' => $search,
                    'type' => 'popular',
                    'url' => "/search?query=" . urlencode($search)
                ];
            }
        }

        $suggestions = array_merge(
            $productSuggestions->toArray(),
            $categorySuggestions->toArray(),
            array_slice($popularSuggestions, 0, 2)
        );

        // Cache suggestions for 5 minutes
        Cache::put($cacheKey, $suggestions, 300);

        return response()->json(['suggestions' => $suggestions]);
    }

    public function featured(Request $request)
    {
        $limit = $request->get('limit', 8);
        $products = Product::with(['category', 'variants.color', 'variants.size'])
            ->where('status', true)
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();


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

            // Tính toán số lượng đã bán real-time từ order_items
            $variantIds = $product->variants->pluck('id');
            $soldQuantity = 0;
            
            if ($variantIds->count() > 0) {
                $soldQuantity = \App\Models\OrderItem::whereIn('variant_id', $variantIds)
                    ->join('orders', 'order_items.order_id', '=', 'orders.id')
                    ->whereIn('orders.status', ['delivered', 'completed'])
                    ->sum('order_items.quantity');
            }
            
            // Ghi đè field sold với giá trị tính toán real-time
            $product->sold = (int) $soldQuantity;

            return response()->json(['success' => true, 'data' => $product]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            Log::error("Product not found with ID: {$id}");
            return response()->json(['success' => false, 'message' => 'Sản phẩm không tồn tại.'], 404);
        } catch (\Exception $e) {
            Log::error("Error fetching product ID {$id}: " . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Lỗi máy chủ nội bộ.'], 500);
        }
    }

        public function getStatistics(Request $request, $id)
    {
        try {
            $product = Product::with(['variants.color', 'variants.size'])->findOrFail($id);
            $variantIds = $product->variants->pluck('id');

            // Base query - chỉ tính orders đã giao hàng và hoàn thành
            $query = OrderItem::whereIn('variant_id', $variantIds)
                ->join('orders', 'order_items.order_id', '=', 'orders.id')
                ->whereIn('orders.status', ['delivered', 'completed']);

            // Date range filtering
            $period = $request->input('period', 'month');
            $startDate = null;
            $endDate = Carbon::now()->endOfDay();

            switch ($period) {
                case 'week':
                    $startDate = Carbon::now()->startOfWeek();
                    break;
                case 'quarter':
                    $startDate = Carbon::now()->startOfQuarter();
                    break;
                case 'custom':
                    $request->validate([
                        'start_date' => 'required|date_format:Y-m-d',
                        'end_date' => 'required|date_format:Y-m-d|after_or_equal:start_date',
                    ]);
                    $startDate = Carbon::parse($request->input('start_date'))->startOfDay();
                    $endDate = Carbon::parse($request->input('end_date'))->endOfDay();
                    break;
                case 'month':
                default:
                    $startDate = Carbon::now()->startOfMonth();
                    break;
            }

            if ($startDate) {
                $query->whereBetween('orders.created_at', [$startDate, $endDate]);
            }

            // --- General Statistics ---
            $statsQuery = clone $query;
            $stats = $statsQuery->selectRaw('
                COUNT(DISTINCT order_items.order_id) as total_orders,
                SUM(order_items.quantity * order_items.price) as total_revenue,
                SUM(order_items.quantity) as total_quantity_sold
            ')->first();

            $totalRevenue = $stats->total_revenue ?? 0;
            $totalQuantitySold = $stats->total_quantity_sold ?? 0;
            $averagePrice = $totalQuantitySold > 0 ? $totalRevenue / $totalQuantitySold : 0;

            // --- Time-based Data for Charts ---
            $timeDataQuery = clone $query;
            $dateFormat = "DATE_FORMAT(orders.created_at, '%Y-%m-%d')"; // Group by day as default

            if ($period === 'quarter') {
                $dateFormat = "DATE_FORMAT(orders.created_at, '%Y-%u')"; // Group by week
            }

            $timeDataRaw = $timeDataQuery->selectRaw("
                {$dateFormat} as period_key,
                COUNT(DISTINCT order_items.order_id) as orders,
                SUM(order_items.quantity * order_items.price) as revenue
            ")
            ->groupBy('period_key')
            ->orderBy('period_key', 'asc')
            ->get();

            $timeData = $timeDataRaw->map(function ($item) use ($period) {
                if ($period === 'quarter') {
                    // Format 'YYYY-WW' to 'Week WW, YYYY'
                    list($year, $week) = explode('-', $item->period_key);
                    $period_display = "Tuần {$week}, {$year}";
                } else {
                    $period_display = Carbon::parse($item->period_key)->format('d/m');
                }
                return [
                    'period' => $period_display,
                    'orders' => (int) $item->orders,
                    'revenue' => (float) $item->revenue,
                ];
            });

            // --- Top Selling Variants ---
            $topVariantsQuery = clone $query;
            $topVariants = $topVariantsQuery
                ->with(['variant.color', 'variant.size'])
                ->selectRaw('
                    variant_id,
                    SUM(quantity) as sold_quantity,
                    SUM(quantity * price) as revenue
                ')
                ->groupBy('variant_id')
                ->orderBy('sold_quantity', 'desc')
                ->limit(5)
                ->get()
                ->map(function($item) {
                    return [
                        'id' => $item->variant->id,
                        'color' => $item->variant->color->name ?? 'N/A',
                        'size' => $item->variant->size->name ?? 'N/A',
                        'sold_quantity' => (int) $item->sold_quantity,
                        'revenue' => (float) $item->revenue
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => [
                    'total_orders' => $stats->total_orders ?? 0,
                    'total_revenue' => (float) $totalRevenue,
                    'total_quantity_sold' => (int) $totalQuantitySold,
                    'average_price' => (float) $averagePrice,
                    'time_data' => $timeData,
                    'top_variants' => $topVariants,
                ]
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['success' => false, 'message' => 'Sản phẩm không tồn tại.'], 404);
        } catch (\Exception $e) {
            Log::error("Error fetching statistics for product ID {$id}: " . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Lỗi máy chủ nội bộ.'], 500);
        }
    }
}