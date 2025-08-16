<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;

class CategoryController extends Controller
{
    public function index()
    {
        // Sửa key cache để phản ánh đúng nội dung (có đếm sản phẩm)
        $categories = Cache::remember('categories_with_product_count', 3600, function () {
            // Sử dụng withCount để đếm số sản phẩm trong mỗi danh mục
            return Category::withCount('products')->get();
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

    /**
     * Lấy thống kê chi tiết cho một danh mục cụ thể.
     */
    public function getStatistics(Request $request, $id)
    {
        Category::findOrFail($id);

        $period = $request->input('period', 'month');
        $now = now();

        if ($period === 'custom' && $request->has(['start_date', 'end_date'])) {
            $startDate = Carbon::parse($request->input('start_date'))->startOfDay();
            $endDate = Carbon::parse($request->input('end_date'))->endOfDay();
        } else {
            switch ($period) {
                case 'week':
                    $startDate = $now->copy()->subWeek()->startOfDay();
                    break;
                case 'quarter':
                    $startDate = $now->copy()->subQuarter()->startOfDay();
                    break;
                default:
                    $startDate = $now->copy()->subMonth()->startOfDay();
                    break;
            }
            $endDate = $now->copy()->endOfDay();
        }

        $baseQuery = OrderItem::whereHas('variant.product', function ($q) use ($id) {
            $q->where('category_id', $id);
        })->whereHas('order', function ($q) use ($startDate, $endDate) {
            $q->whereBetween('created_at', [$startDate, $endDate]);
        });

        $revenueStats = (clone $baseQuery)
            ->selectRaw('SUM(order_items.quantity * order_items.price) as total_revenue, SUM(order_items.quantity) as total_items')
            ->first();

        $totalRevenue = $revenueStats->total_revenue ?? 0;
        $totalItems = $revenueStats->total_items ?? 0;

        $totalOrders = (clone $baseQuery)->distinct('order_id')->count('order_id');

        $averagePerItem = $totalItems > 0 ? $totalRevenue / $totalItems : 0;

        $topProducts = OrderItem::with('variant.product:id,name')
            ->whereHas('variant.product', function ($q) use ($id) {
                $q->where('category_id', $id);
            })
            ->whereHas('order', function ($q) use ($startDate, $endDate) {
                $q->whereBetween('created_at', [$startDate, $endDate]);
            })
            ->selectRaw('variant_id, SUM(quantity) as sold_quantity, SUM(quantity * price) as revenue')
            ->groupBy('variant_id')
            ->orderByDesc('sold_quantity')
            ->limit(5)
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->variant->product->id, // Lấy ID của product
                    'name' => $item->variant->product->name, // Lấy tên của product
                    'sold_quantity' => (int)$item->sold_quantity,
                    'revenue' => (float)$item->revenue,
                ];
            });

        $timeData = (clone $baseQuery)->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->selectRaw('DATE(orders.created_at) as period, COUNT(DISTINCT order_id) as orders, SUM(order_items.quantity * order_items.price) as revenue')
            ->groupBy('period')
            ->orderBy('period', 'asc')
            ->get();

        return response()->json([
            'total_orders' => $totalOrders,
            'total_revenue' => $totalRevenue,
            'total_items' => $totalItems,
            'average_per_item' => $averagePerItem,
            'top_products' => $topProducts,
            'time_data' => $timeData,
            'debug' => [
                'category_id' => $id,
                'period' => $period,
                'start_date' => $startDate->toDateTimeString(),
                'end_date' => $endDate->toDateTimeString(),
            ]
        ]);
    }
}
