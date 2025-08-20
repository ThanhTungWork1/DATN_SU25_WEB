<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use App\Models\OrderItem;
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
            if ($product->image && file_exists(public_path('storage/' . $product->image))) {
                unlink(public_path('storage/' . $product->image));
            }
            $image = $request->file('image');
            $imageName = Str::slug(pathinfo($image->getClientOriginalName(), PATHINFO_FILENAME));
            $filename = $imageName . '-' . uniqid() . '.' . $image->getClientOriginalExtension();
            $image->move(public_path('storage/images'), $filename);
            $validated['image'] = 'images/' . $filename;
        }

        if ($request->hasFile('hover_image')) {
            if ($product->hover_image && file_exists(public_path('storage/' . $product->hover_image))) {
                unlink(public_path('storage/' . $product->hover_image));
            }
            $hoverImage = $request->file('hover_image');
            $hoverImageName = Str::slug(pathinfo($hoverImage->getClientOriginalName(), PATHINFO_FILENAME));
            $filename = $hoverImageName . '-' . uniqid() . '.' . $hoverImage->getClientOriginalExtension();
            $hoverImage->move(public_path('storage/images'), $filename);
            $validated['hover_image'] = 'images/' . $filename;
        }

        $product->update($validated);
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

            // Base query
            $query = OrderItem::whereIn('variant_id', $variantIds)
                ->join('orders', 'order_items.order_id', '=', 'orders.id')
                ->where('orders.status', 'delivered');

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