<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Carbon\Carbon;

class CategoryController extends Controller
{
    /**
     * Lấy danh sách tất cả danh mục, kèm theo số lượng sản phẩm.
     */
    public function index()
    {
        // Dùng withCount('products') để đếm số sản phẩm trong mỗi danh mục.
        // Laravel sẽ tự động thêm một trường 'products_count' vào kết quả trả về.
        $categories = Category::withCount('products')->orderBy('name', 'asc')->get();
        
        return response()->json([
            'success' => true,
            'data' => $categories
        ]);
    }

    /**
     * Lưu một danh mục mới.
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255|unique:categories,name',
            'status' => 'required|boolean',
        ]);

        $validatedData['slug'] = Str::slug($validatedData['name']);

        $category = Category::create($validatedData);

        return response()->json($category, 201);
    }

    /**
     * Hiển thị một danh mục cụ thể.
     */
    public function show($id)
    {
        return Category::findOrFail($id);
    }

    /**
     * Cập nhật một danh mục.
     */
    public function update(Request $request, $id)
    {
        $category = Category::findOrFail($id);

        $validatedData = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('categories')->ignore($category->id)],
            'status' => 'required|boolean',
        ]);

        $validatedData['slug'] = Str::slug($validatedData['name']);

        $category->update($validatedData);

        return response()->json($category);
    }

    /**
     * Xóa một danh mục.
     */
    public function destroy($id)
    {
        $category = Category::findOrFail($id);

        if ($category->products()->count() > 0) {
            return response()->json(['message' => 'Không thể xóa danh mục này vì vẫn còn sản phẩm.'], 409);
        }

        $category->delete();

        return response()->json(null, 204);
    }

    /**
     * Lấy thống kê chi tiết cho một danh mục cụ thể.
     */
    public function statistics(Request $request, $id)
    {
        try {
            \Log::info('🔄 BẮT ĐẦU Category Statistics API');
            \Log::info('📊 Category ID: ' . $id);
            \Log::info('📥 Request params: ' . json_encode($request->all()));
            
            $category = Category::findOrFail($id);
            \Log::info('✅ Category found: ' . $category->name);
            
            // Lấy tham số thời gian từ request
            $startDate = $request->get('start_date');
            $endDate = $request->get('end_date');
            $period = $request->get('period', 'month');
            
            \Log::info('⏰ Time params - Start: ' . $startDate . ', End: ' . $endDate . ', Period: ' . $period);
            
            // Thiết lập khoảng thời gian mặc định - MỞ RỘNG ĐỂ TÍNH TẤT CẢ DỮ LIỆU
            if (!$startDate || !$endDate) {
                $endDate = Carbon::now();
                // Mở rộng thời gian để bao gồm tất cả dữ liệu có thể
                $startDate = Carbon::parse('2020-01-01'); // Từ năm 2020 để chắc chắn bao gồm tất cả data
            } else {
                $startDate = Carbon::parse($startDate);
                $endDate = Carbon::parse($endDate);
            }

            // Lấy sản phẩm trong danh mục
            \Log::info('🔍 Tìm products trong category...');
            $allProducts = Product::all();
            \Log::info('📦 Tổng số products trong DB: ' . $allProducts->count());
            \Log::info('📦 All products: ' . $allProducts->pluck('id', 'category_id')->toJson());
            
            $productIds = Product::where('category_id', $id)->pluck('id');
            \Log::info('🎯 Products trong category ' . $id . ': ' . $productIds->toJson());
            \Log::info('📊 Số lượng products tìm thấy: ' . $productIds->count());
            
            if ($productIds->isEmpty()) {
                \Log::warning('⚠️ KHÔNG CÓ PRODUCTS trong category này!');
                return response()->json([
                    'category_id' => $category->id,
                    'category_name' => $category->name,
                    'total_orders' => 0,
                    'total_revenue' => 0,
                    'average_order_value' => 0,
                    'top_products' => [],
                    'time_data' => [],
                    'period' => $period,
                    'start_date' => $startDate->format('Y-m-d'),
                    'end_date' => $endDate->format('Y-m-d'),
                    'debug' => 'No products in category - Category ID: ' . $id
                ]);
            }

            // Lấy order items THEO variant_id (theo schema thực tế)
            \Log::info('🔍 Tìm order items theo variant_id...');
            \Log::info('📅 Date range: ' . $startDate->format('Y-m-d') . ' to ' . $endDate->format('Y-m-d'));

            // 1) Lấy danh sách variant thuộc các product trong category
            $variantIds = ProductVariant::whereIn('product_id', $productIds)->pluck('id');
            \Log::info('🎯 Variants thuộc products [' . $productIds->join(',') . ']: ' . $variantIds->toJson());
            \Log::info('📊 Số lượng variants tìm thấy: ' . $variantIds->count());

            if ($variantIds->isEmpty()) {
                \Log::warning('⚠️ KHÔNG CÓ VARIANTS cho products trong category này!');
                $orderItems = collect();
            } else {
                // 2) Lấy order_items theo variant_id, eager load quan hệ để tính top products và time series
                $orderItemsQuery = OrderItem::whereIn('variant_id', $variantIds)
                    ->with(['order', 'variant.product']);

                // Chỉ tính đơn đã giao hàng hoặc đã hoàn thành
                $orderItemsQuery->whereHas('order', function($q) {
                    $q->whereIn('status', ['delivered', 'completed']);
                });

                // Nếu có filter theo thời gian
                if ($startDate && $endDate) {
                    $orderItemsQuery->whereHas('order', function($q) use ($startDate, $endDate) {
                        $q->whereBetween('created_at', [$startDate, $endDate]);
                    });
                }

                $orderItems = $orderItemsQuery->get();
            }

            \Log::info('🎯 Order items cho variants [' . ($variantIds->count() ? $variantIds->join(',') : '') . ']: ' . $orderItems->count());
            \Log::info('✅ Filter: Chỉ tính đơn có status = delivered hoặc completed');
            // Không log full toJson nếu nhiều, chỉ log 3 mẫu đầu
            \Log::info('📊 Order items sample (tối đa 3): ' . $orderItems->take(3)->toJson());

            // Tính toán thống kê
            $totalOrders = $orderItems->groupBy('order_id')->count();
            $totalItems = $orderItems->sum('quantity');
            // Giá trong DB ở đơn vị nghìn (vd: 149.00 => 149.000 VND mỗi SP)
            // nhân 1000 để hiển thị đúng VND
            $totalRevenue = $orderItems->sum(function($item) {
                return $item->quantity * $item->price * 1000;
            });
            
            $averagePerItem = $totalItems > 0 ? $totalRevenue / $totalItems : 0;

            \Log::info('📈 KẾT QUẢ TÍNH TOÁN (Chỉ đơn delivered/completed):');
            \Log::info('  - Tổng đơn hàng: ' . $totalOrders);
            \Log::info('  - Tổng doanh thu: ' . $totalRevenue);
            \Log::info('  - Tổng số lượng SP: ' . $totalItems);
            \Log::info('  - Giá trung bình/SP: ' . $averagePerItem);
            \Log::info('  - Order items count: ' . $orderItems->count());

            // 🎯 SẢN PHẨM BÁN CHẠY NHẤT
            // Logic: Group theo product_id, loại bỏ trùng lặp, chỉ lấy sản phẩm có bán
            $topProducts = [];
            if ($orderItems->count() > 0) {
                // 🔧 FIX: Sử dụng unique để loại bỏ sản phẩm trùng lặp
                $topProducts = $orderItems
                    ->groupBy(function($item) { 
                        // Group theo product_id để gộp tất cả variants của cùng 1 sản phẩm
                        return optional($item->variant->product)->id; 
                    })
                    ->filter(function($items, $productId) { return !is_null($productId); })
                    ->map(function($items) {
                        $product = optional($items->first()->variant->product);
                        return [
                            'id' => $product->id,
                            'name' => $product->name,
                            'sold_quantity' => $items->sum('quantity'),
                            'revenue' => $items->sum(function($item) {
                                return $item->quantity * $item->price * 1000;
                            })
                        ];
                    })
                    ->unique('id')  // 🔧 FIX: Loại bỏ sản phẩm trùng lặp
                    ->sortByDesc('sold_quantity')  // Sắp xếp theo số lượng bán giảm dần
                    ->take(5)                      // Lấy tối đa 5 sản phẩm
                    ->values()                     // Chuyển về array
                    ->toArray();
            }

            // Dữ liệu theo thởi gian
            $timeData = $orderItems->count() > 0
                ? $this->generateTimeData($orderItems, $startDate, $endDate, $period)
                : [];
            
            // 🔍 DEBUG: Log kết quả top products sau khi group và sắp xếp
            \Log::info("🔍 TOP PRODUCTS AFTER GROUPING & SORTING:");
            \Log::info("  - Total products found: " . count($topProducts));
            \Log::info("  - Showing top 5 best-selling products:");
            foreach ($topProducts as $index => $product) {
                \Log::info("  - [{$index}] ID: {$product['id']}, Name: '{$product['name']}', Qty: {$product['sold_quantity']}, Revenue: {$product['revenue']}");
            }
            
            return response()->json([
                'category_id' => $category->id,
                'category_name' => $category->name,
                'total_orders' => $totalOrders,
                'total_revenue' => $totalRevenue,
                'average_order_value' => $totalOrders > 0 ? $totalRevenue / $totalOrders : 0,
                'total_items' => $totalItems,
                'average_per_item' => $averagePerItem,
                'top_products' => $topProducts,
                'time_data' => $timeData,
                'period' => $period,
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d'),
                'filter_note' => 'Chỉ tính đơn hàng có trạng thái delivered hoặc completed'
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Category statistics error: ' . $e->getMessage());
            return response()->json([
                'error' => 'Lỗi khi tải thống kê danh mục',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Tạo dữ liệu thống kê theo thời gian
     */
    private function generateTimeData($orderItems, $startDate, $endDate, $period)
    {
        $timeData = [];

        // Với tuần/tháng/quý: gom 1 bucket duy nhất cho khoảng được chọn
        if (in_array($period, ['week', 'month', 'quarter'])) {
            switch ($period) {
                case 'week':
                    $rangeStart = $startDate->copy()->startOfWeek();
                    $rangeEnd = $startDate->copy()->endOfWeek();
                    $label = 'Tuần ' . $startDate->weekOfYear;
                    break;
                case 'quarter':
                    $rangeStart = $startDate->copy()->startOfQuarter();
                    $rangeEnd = $startDate->copy()->endOfQuarter();
                    $label = 'Quý ' . $startDate->quarter;
                    break;
                default: // month
                    $rangeStart = $startDate->copy()->startOfMonth();
                    $rangeEnd = $startDate->copy()->endOfMonth();
                    $label = 'Tháng ' . $startDate->month;
                    break;
            }

            // Giới hạn bởi endDate nếu được chọn nhỏ hơn rangeEnd
            if ($endDate && $endDate->lt($rangeEnd)) {
                $rangeEnd = $endDate->copy()->endOfDay();
            }

            $periodItems = $orderItems->filter(function ($item) use ($rangeStart, $rangeEnd) {
                $orderDate = Carbon::parse($item->order->created_at);
                return $orderDate >= $rangeStart && $orderDate <= $rangeEnd;
            });

            $timeData[] = [
                'period' => $label,
                'revenue' => $periodItems->sum(function ($item) {
                    return $item->quantity * $item->price * 1000; // x1000 -> VND
                }),
                'orders' => $periodItems->groupBy('order_id')->count(),
            ];

            return $timeData;
        }

        // Với custom: tạo từng ngày trong khoảng
        $current = $startDate->copy()->startOfDay();
        $end = $endDate->copy()->endOfDay();

        while ($current <= $end) {
            $periodEnd = $current->copy()->endOfDay();

            $periodItems = $orderItems->filter(function ($item) use ($current, $periodEnd) {
                $orderDate = Carbon::parse($item->order->created_at);
                return $orderDate >= $current && $orderDate <= $periodEnd;
            });

            $timeData[] = [
                'period' => $current->format('d/m'),
                'revenue' => $periodItems->sum(function ($item) {
                    return $item->quantity * $item->price * 1000; // x1000 -> VND
                }),
                'orders' => $periodItems->groupBy('order_id')->count(),
            ];

            $current->addDay()->startOfDay();
        }

        return $timeData;
    }

    private function getPeriodEnd($date, $period)
    {
        switch ($period) {
            case 'week':
                return $date->copy()->endOfWeek();
            case 'quarter':
                return $date->copy()->endOfQuarter();
            case 'custom':
                return $date->copy()->endOfDay();
            default: // month
                return $date->copy()->endOfMonth();
        }
    }

    private function getPeriodLabel($date, $period)
    {
        switch ($period) {
            case 'week':
                return 'Tuần ' . $date->weekOfYear;
            case 'quarter':
                return 'Quý ' . $date->quarter;
            case 'custom':
                return $date->format('d/m');
            default: // month
                return 'Tháng ' . $date->month;
        }
    }

    private function getNextPeriod($date, $period)
    {
        switch ($period) {
            case 'week':
                return $date->copy()->addWeek()->startOfWeek();
            case 'quarter':
                return $date->copy()->addQuarter()->startOfQuarter();
            case 'custom':
                return $date->copy()->addDay();
            default: // month
                return $date->copy()->addMonth()->startOfMonth();
        }
    }
}
