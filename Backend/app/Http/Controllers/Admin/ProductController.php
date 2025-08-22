<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str; // THÊM: Import Str để tạo slug
use Carbon\Carbon;

class ProductController extends Controller
{
     public function index(Request $request)
    {
        \Log::info('🔍 [BACKEND DEBUG] Admin products index called');
        \Log::info('🔍 [BACKEND DEBUG] Request parameters:', $request->all());

        $query = Product::with('category');

        // THÊM MỚI: Logic xử lý tìm kiếm
        if ($request->has('search') && $request->input('search') != '') {
            $searchTerm = $request->input('search');
            // Tìm ở cột 'name'
            $query->where('name', 'like', '%' . $searchTerm . '%');
        }

        // Sắp xếp theo ID tăng dần và phân trang theo tham số per_page (mặc định 20)
        $perPage = (int) $request->get('per_page', 20);
        if ($perPage <= 0) { $perPage = 20; }
        $products = $query->orderBy('id', 'asc')->paginate($perPage);
        
        // Đảm bảo accessors được load
        $products->getCollection()->transform(function ($product) {
            \Log::info('🔍 [BACKEND DEBUG] Processing product ID: ' . $product->id);
            \Log::info('🔍 [BACKEND DEBUG] Raw image field: ' . $product->image);
            \Log::info('🔍 [BACKEND DEBUG] Image URL accessor: ' . $product->image_url);
            return $product;
        });

        \Log::info('🔍 [BACKEND DEBUG] Products found:', $products->toArray());

        return $products;
    }
    public function store(Request $request)
    {
        \Log::info('🔍 [BACKEND DEBUG] Product store method called');
        \Log::info('🔍 [BACKEND DEBUG] Request data:', $request->all());
        
        try {
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
                    'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
        'hover_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',

             // Validation cho dữ liệu biến thể
            'variants' => 'required|array', // Nhận array trực tiếp
            'variant_images' => 'nullable|array', // Mảng chứa các file ảnh của biến thể
            'variant_images.*' => 'nullable|mimes:jpeg,png,jpg,gif,webp|max:2048' // Validate từng file trong mảng - KHÔNG BẮT BUỘC - KHÔNG BẮT BUỘC
        ]);

        $variantsData = $validatedData['variants'];
        if (!is_array($variantsData) || count($variantsData) < 1) {
            return response()->json(['message' => 'Định dạng biến thể không hợp lệ.'], 422);
        }

        // Bỏ validation SKU unique - cho phép SKU trùng lặp giữa các sản phẩm
        // Mỗi sản phẩm có thể có variants với SKU giống nhau

        $product = DB::transaction(function () use ($validatedData, $variantsData, $request) {
            \Log::info('🔍 [BACKEND DEBUG] Starting DB transaction');
            \Log::info('🔍 [BACKEND DEBUG] Validated data:', $validatedData);
            \Log::info('🔍 [BACKEND DEBUG] Variants data:', $variantsData);
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
            $baseSlug = $validatedData['slug'] ?? Str::slug($validatedData['name']);
            $product->slug = $baseSlug;
            
            // Kiểm tra và tạo slug unique
            $counter = 1;
            while (Product::where('slug', $product->slug)->exists()) {
                $product->slug = $baseSlug . '-' . $counter;
                $counter++;
            }

            // Xử lý upload file và gán đường dẫn
            if ($request->hasFile('image')) {
                $product->image = $request->file('image')->store('products', 'public');
            }
            if ($request->hasFile('hover_image')) {
                $product->hover_image = $request->file('hover_image')->store('products', 'public');
            }

            // 1. Lưu sản phẩm cha vào DB
            \Log::info('🔍 [BACKEND DEBUG] About to save product:', $product->toArray());
            $product->save();
            \Log::info('🔍 [BACKEND DEBUG] Product saved successfully with ID: ' . $product->id);

           // Logic tạo biến thể để xử lý ảnh
            foreach ($variantsData as $index => $variant) {
                \Log::info("🔍 [BACKEND DEBUG] Processing variant {$index}:", $variant);
                
                // Kiểm tra xem có file ảnh nào được gửi lên cho biến thể ở vị trí $index không
                if ($request->hasFile("variant_images.{$index}")) {
                    // Lưu file và lấy đường dẫn
                    $imagePath = $request->file("variant_images.{$index}")->store('variants', 'public');
                    \Log::info("🔍 [BACKEND DEBUG] Variant {$index} image saved to: {$imagePath}");
                    // Gán đường dẫn vào dữ liệu của biến thể
                    $variant['image'] = $imagePath;
                } else {
                    // Nếu không có file mới, giữ lại ảnh cũ (nếu có) hoặc đặt là null
                    $variant['image'] = $variant['image'] ?? null;
                    \Log::info("🔍 [BACKEND DEBUG] Variant {$index} no new image, using: " . ($variant['image'] ?? 'null'));
                }

                // Map variant_price thành price
                if (isset($variant['variant_price'])) {
                    $variant['price'] = $variant['variant_price'];
                    unset($variant['variant_price']);
                }
                
                // Tạo SKU unique tự động nếu không có SKU hoặc SKU trùng
                if (empty($variant['sku'])) {
                    $color = \App\Models\Color::find($variant['color_id']);
                    $size = \App\Models\Size::find($variant['size_id']);
                    $variant['sku'] = "SP-" . ($color ? $color->name : 'Unknown') . "-" . ($size ? $size->name : 'Unknown') . "-" . $product->id . "-" . $index;
                }
                
                \Log::info("🔍 [BACKEND DEBUG] About to create variant with data:", $variant);
                $product->variants()->create($variant);
                \Log::info("🔍 [BACKEND DEBUG] Variant {$index} created successfully");
            }
            return $product;
        });

        return response()->json($product->load('variants'), 201);
        } catch (\Exception $e) {
            \Log::error('🔍 [BACKEND DEBUG] Product store error:', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    public function show($id)
    {
        \Log::info('🔍 [BACKEND DEBUG] Product show method called with ID: ' . $id);
        try {
            $product = Product::with(['variants.color', 'variants.size'])->findOrFail($id);
            \Log::info('🔍 [BACKEND DEBUG] Product found:', $product->toArray());
            return $product;
        } catch (\Exception $e) {
            \Log::error('🔍 [BACKEND DEBUG] Product show error:', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);
            throw $e;
        }
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
            'variants' => 'sometimes|required|array',
            'variant_images' => 'nullable|array', // Mảng chứa các file ảnh của biến thể
            'variant_images.*' => 'nullable|mimes:jpeg,png,jpg,gif,webp|max:2048', // Validate từng file trong mảng
                    'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
        'hover_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:2048',
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
                $variants = $request->input('variants');
                $incomingVariantIds = collect($variants)->pluck('id')->filter();
                
                // Bỏ validation SKU unique cho update method cũng vậy
                
                // Xóa các biến thể không còn được gửi lên
                $product->variants()->whereNotIn('id', $incomingVariantIds)->delete();

                // Cập nhật hoặc Tạo mới các biến thể
                foreach ($variants as $index => $variantData) {
                    \Log::info("🔍 [UPDATE DEBUG] Processing variant index {$index}:", $variantData);
                    
                    // Kiểm tra xem có file ảnh mới cho biến thể này không
                    if ($request->hasFile("variant_images.{$index}")) {
                        \Log::info("🔍 [UPDATE DEBUG] Found image file for variant index {$index}");
                        
                        // Tìm biến thể cũ để xóa ảnh cũ (nếu có)
                        if (isset($variantData['id'])) {
                            $oldVariant = $product->variants()->find($variantData['id']);
                            if ($oldVariant && $oldVariant->image) {
                                Storage::disk('public')->delete($oldVariant->image);
                                \Log::info("🔍 [UPDATE DEBUG] Deleted old image: {$oldVariant->image}");
                            }
                        }
                        // Lưu ảnh mới và cập nhật đường dẫn
                        $imagePath = $request->file("variant_images.{$index}")->store('variants', 'public');
                        $variantData['image'] = $imagePath;
                        \Log::info("🔍 [UPDATE DEBUG] Saved new image to: {$imagePath}");
                    } else {
                        \Log::info("🔍 [UPDATE DEBUG] No image file for variant index {$index} - Using existing image or default");
                        // Nếu không có ảnh mới, giữ nguyên ảnh cũ hoặc để null (sẽ dùng ảnh mặc định)
                        if (isset($variantData['id'])) {
                            $oldVariant = $product->variants()->find($variantData['id']);
                            if ($oldVariant && $oldVariant->image) {
                                $variantData['image'] = $oldVariant->image;
                                \Log::info("🔍 [UPDATE DEBUG] Keeping existing image: {$oldVariant->image}");
                            }
                        }
                    }

                    // Map variant_price thành price cho update method
                    if (isset($variantData['variant_price'])) {
                        $variantData['price'] = $variantData['variant_price'];
                        unset($variantData['variant_price']);
                    }
                    
                    $product->variants()->updateOrCreate(
                        ['id' => $variantData['id'] ?? null],
                        $variantData
                    );
                    \Log::info("🔍 [UPDATE DEBUG] Variant updated/created successfully");
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

    /**
     * Tìm kiếm sản phẩm với các filter
     */
    public function search(Request $request)
    {
        $query = Product::with(['category', 'variants.color', 'variants.size']);

        // Tìm kiếm theo tên hoặc mô tả
        if ($request->has('search') && !empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                    ->orWhere('description', 'LIKE', "%{$search}%");
            });
        }

        // Filter theo danh mục
        if ($request->has('category_id') && !empty($request->category_id)) {
            $query->where('category_id', $request->category_id);
        }

        // Filter theo giá
        if ($request->has('min_price') && !empty($request->min_price)) {
            $query->where('price', '>=', $request->min_price);
        }
        if ($request->has('max_price') && !empty($request->max_price)) {
            $query->where('price', '<=', $request->max_price);
        }

        // Filter theo trạng thái
        if ($request->has('status') && $request->status !== '') {
            $query->where('status', $request->status);
        }

        // Filter theo màu sắc
        if ($request->has('color_id') && !empty($request->color_id)) {
            $query->whereHas('variants', function ($q) use ($request) {
                $q->where('color_id', $request->color_id);
            });
        }

        // Filter theo kích thước
        if ($request->has('size_id') && !empty($request->size_id)) {
            $query->whereHas('variants', function ($q) use ($request) {
                $q->where('size_id', $request->size_id);
            });
        }

        // Filter theo chất liệu
        if ($request->has('materials') && !empty($request->materials)) {
            $materials = explode(',', $request->materials);
            $query->whereIn('material', $materials);
        }

        // Filter theo giảm giá
        if ($request->has('has_discount') && $request->has_discount !== '') {
            if ($request->has_discount) {
                $query->whereNotNull('old_price')
                    ->where('old_price', '>', DB::raw('price'));
            } else {
                $query->where(function ($q) {
                    $q->whereNull('old_price')
                        ->orWhere('old_price', '<=', DB::raw('price'));
                });
            }
        }

        // Filter theo khoảng giảm giá
        if ($request->has('min_discount') && !empty($request->min_discount)) {
            $query->whereRaw('((old_price - price) / old_price * 100) >= ?', [$request->min_discount]);
        }
        if ($request->has('max_discount') && !empty($request->max_discount)) {
            $query->whereRaw('((old_price - price) / old_price * 100) <= ?', [$request->max_discount]);
        }

        // Filter theo tồn kho
        if ($request->has('in_stock') && $request->in_stock !== '') {
            if ($request->in_stock) {
                $query->whereHas('variants', function ($q) {
                    $q->where('stock', '>', 0);
                });
            } else {
                $query->whereDoesntHave('variants', function ($q) {
                    $q->where('stock', '>', 0);
                });
            }
        }

        // Phân trang
        $perPage = $request->get('per_page', 12);
        $products = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $products->items(),
            'pagination' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
                'from' => $products->firstItem(),
                'to' => $products->lastItem(),
            ],
            'filters' => [
                'search' => $request->search ?? null,
                'category_id' => $request->category_id ?? null,
                'min_price' => $request->min_price ?? null,
                'max_price' => $request->max_price ?? null,
                'status' => $request->status ?? null,
                'color_id' => $request->color_id ?? null,
                'size_id' => $request->size_id ?? null,
                'materials' => $request->materials ?? null,
                'has_discount' => $request->has_discount ?? null,
                'min_discount' => $request->min_discount ?? null,
                'max_discount' => $request->max_discount ?? null,
                'in_stock' => $request->in_stock ?? null,
            ]
        ]);
    }

    /**
     * Thống kê cho một sản phẩm cụ thể (dựa trên order_items của các biến thể).
     * Endpoint: GET /admin/products/{id}/statistics
     * Params: period (week|month|quarter|custom), start_date, end_date (YYYY-MM-DD)
     */
    public function statistics(Request $request, $id)
    {
        try {
            \Log::info('🔄 BẮT ĐẦU Product Statistics API');
            \Log::info('📦 Product ID: ' . $id);
            \Log::info('📥 Request params: ' . json_encode($request->all()));

            $product = Product::findOrFail($id);
            \Log::info('✅ Product found: ' . $product->name);

            // Thời gian
            $startDate = $request->get('start_date');
            $endDate = $request->get('end_date');
            $period = $request->get('period', 'month');

            if (!$startDate || !$endDate) {
                $endDate = Carbon::now();
                $startDate = Carbon::parse('2020-01-01');
            } else {
                $startDate = Carbon::parse($startDate);
                $endDate = Carbon::parse($endDate);
            }

            // Lấy variants của sản phẩm
            $variantIds = ProductVariant::where('product_id', $product->id)->pluck('id');
            \Log::info('🎯 Variant IDs: ' . $variantIds->toJson());

            if ($variantIds->isEmpty()) {
                return response()->json([
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'total_orders' => 0,
                    'total_revenue' => 0,
                    'total_items' => 0,
                    'average_per_item' => 0,
                    'top_variants' => [],
                    'time_data' => [],
                    'period' => $period,
                    'start_date' => $startDate->format('Y-m-d'),
                    'end_date' => $endDate->format('Y-m-d'),
                ]);
            }

            $orderItemsQuery = OrderItem::whereIn('variant_id', $variantIds)
                ->with(['order', 'variant.color', 'variant.size']);

            // BẬT lọc theo thời gian theo orders.created_at
            $orderItemsQuery->whereHas('order', function($q) use ($startDate, $endDate) {
                $q->whereBetween('created_at', [$startDate, $endDate]);
            });

            $orderItems = $orderItemsQuery->get();
            \Log::info('🧮 Order items count: ' . $orderItems->count());

            // Tổng quan
            $totalOrders = $orderItems->groupBy('order_id')->count();
            $totalItems = $orderItems->sum('quantity');
            $totalRevenue = $orderItems->sum(function($item) {
                // Giá trong DB là đơn vị nghìn
                return $item->quantity * $item->price * 1000;
            });
            $averagePerItem = $totalItems > 0 ? $totalRevenue / $totalItems : 0;

            // Top biến thể bán chạy
            $topVariants = [];
            if ($orderItems->count() > 0) {
                $topVariants = $orderItems
                    ->groupBy('variant_id')
                    ->map(function($items, $variantId) {
                        $variant = optional($items->first()->variant);
                        $soldQty = $items->sum('quantity');
                        $revenue = $items->sum(function($i){ return $i->quantity * $i->price * 1000; });
                        return [
                            'id' => (int) $variantId,
                            'color' => optional($variant->color)->name,
                            'size' => optional($variant->size)->name,
                            'sold_quantity' => (int) $soldQty,
                            'revenue' => (int) $revenue,
                        ];
                    })
                    ->values()
                    ->sortByDesc('revenue')
                    ->take(5)
                    ->values();
            }

            // Time series
            $timeData = $this->generateTimeDataForProduct($orderItems, $startDate, $endDate, $period);

            return response()->json([
                'product_id' => $product->id,
                'product_name' => $product->name,
                'total_orders' => $totalOrders,
                'total_revenue' => $totalRevenue,
                'total_items' => $totalItems,
                'average_per_item' => $averagePerItem,
                'top_variants' => $topVariants,
                'time_data' => $timeData,
                'period' => $period,
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d'),
            ]);
        } catch (\Exception $e) {
            \Log::error('❌ Error in Product Statistics API: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to get statistics'], 500);
        }
    }

    /**
     * Sinh dữ liệu time series tương tự Category nhưng cho sản phẩm.
     * Lưu ý: với 'week'|'month'|'quarter' hiện trả 1 bucket để giữ đồng nhất với Category hiện tại.
     */
    protected function generateTimeDataForProduct($orderItems, Carbon $startDate, Carbon $endDate, $period)
    {
        $timeData = [];

        if ($period === 'custom') {
            $current = $startDate->copy();
            while ($current->lte($endDate)) {
                $dayStart = $current->copy()->startOfDay();
                $dayEnd = $current->copy()->endOfDay();
                $itemsForDay = $orderItems->filter(function($item) use ($dayStart, $dayEnd) {
                    $created = Carbon::parse(optional($item->order)->created_at);
                    return $created && $created->between($dayStart, $dayEnd);
                });
                $timeData[] = [
                    'period' => $current->format('d/m'),
                    'orders' => $itemsForDay->groupBy('order_id')->count(),
                    'revenue' => $itemsForDay->sum(function($i){ return $i->quantity * $i->price * 1000; }),
                ];
                $current->addDay();
            }
            return $timeData;
        }

        // week/month/quarter: tạo 1 bucket theo logic hiện tại của CategoryController
        switch ($period) {
            case 'week':
                $label = 'Tuần ' . $startDate->weekOfYear;
                $rangeStart = $startDate->copy()->startOfWeek();
                $rangeEnd = min($endDate, $startDate->copy()->endOfWeek());
                break;
            case 'quarter':
                $label = 'Quý ' . $startDate->quarter;
                $rangeStart = $startDate->copy()->firstOfQuarter();
                $rangeEnd = min($endDate, $startDate->copy()->lastOfQuarter());
                break;
            case 'month':
            default:
                $label = 'Tháng ' . $startDate->month;
                $rangeStart = $startDate->copy()->startOfMonth();
                $rangeEnd = min($endDate, $startDate->copy()->endOfMonth());
                break;
        }

        $itemsForRange = $orderItems->filter(function($item) use ($rangeStart, $rangeEnd) {
            $created = Carbon::parse(optional($item->order)->created_at);
            return $created && $created->between($rangeStart, $rangeEnd);
        });

        $timeData[] = [
            'period' => $label,
            'orders' => $itemsForRange->groupBy('order_id')->count(),
            'revenue' => $itemsForRange->sum(function($i){ return $i->quantity * $i->price * 1000; }),
        ];

        return $timeData;
    }
}
