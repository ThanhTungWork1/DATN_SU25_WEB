<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Contact;
use App\Models\Order;
use App\Models\Product;
use App\Models\Comment;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        // Lấy tham số khoảng thời gian
        $startDate = null;
        $endDate = null;
        
        if ($request->has('start_date') && $request->has('end_date')) {
            $startDate = Carbon::parse($request->input('start_date'))->startOfDay();
            $endDate = Carbon::parse($request->input('end_date'))->endOfDay();
        }

        // Tổng doanh thu - lọc theo thời gian nếu có
        $revenueQuery = Order::whereIn('status', ['delivered', 'completed']);
        if ($startDate && $endDate) {
            $revenueQuery->whereBetween('created_at', [$startDate, $endDate]);
        }
        $total_revenue = $revenueQuery->sum('final_amount');

        // Tổng đơn hàng (Đã giao hàng + Đã hoàn thành) trong khoảng thời gian
        $totalOrdersQuery = Order::whereIn('status', ['delivered', 'completed']);
        if ($startDate && $endDate) {
            $totalOrdersQuery->whereBetween('created_at', [$startDate, $endDate]);
        } else {
            // Nếu không có filter, hiển thị tất cả đơn hàng delivered/completed
            // Không filter theo ngày hôm nay
        }
        $orders_in_period = $totalOrdersQuery->count();

        // Người dùng mới trong khoảng thời gian (thay vì chỉ tháng này)
        $usersQuery = User::where('role', 0); // Chỉ user thường, không tính admin
        if ($startDate && $endDate) {
            $usersQuery->whereBetween('created_at', [$startDate, $endDate]);
        } else {
            $usersQuery->whereMonth('created_at', Carbon::now()->month)
                      ->whereYear('created_at', Carbon::now()->year);
        }
        $new_users_in_period = $usersQuery->count();

        // Dữ liệu tĩnh - không phụ thuộc thời gian
        $total_products = Product::count();
        $total_categories = Category::count();
        $total_contacts = Contact::count();

        // Đơn hàng chờ xác nhận - lọc theo thời gian nếu có
        $pendingQuery = Order::where('status', 'pending');
        if ($startDate && $endDate) {
            $pendingQuery->whereBetween('created_at', [$startDate, $endDate]);
        }
        $pending_orders = $pendingQuery->count();

        // Đánh giá - lọc theo thời gian nếu có
        $reviewsQuery = Comment::query();
        if ($startDate && $endDate) {
            $reviewsQuery->whereBetween('created_at', [$startDate, $endDate]);
        }
        $total_reviews = $reviewsQuery->count();
        $average_rating = $reviewsQuery->avg('rating');

        return response()->json([
            'total_revenue' => $total_revenue,
            'orders_in_period' => $orders_in_period,
            'new_users_in_period' => $new_users_in_period,
            'total_products' => $total_products,
            'total_categories' => $total_categories,
            'total_contacts' => $total_contacts,
            'pending_orders' => $pending_orders,
            'total_reviews' => $total_reviews,
            'average_rating' => $average_rating ? round($average_rating, 2) : 0,
        ]);
    }

    public function userGrowth(Request $request)
    {
        $startDate = null;
        $endDate = null;
        
        if ($request->has('start_date') && $request->has('end_date')) {
            $startDate = Carbon::parse($request->input('start_date'))->startOfDay();
            $endDate = Carbon::parse($request->input('end_date'))->endOfDay();
        }

        // Nếu có khoảng thời gian, tính toán dựa trên khoảng đó
        if ($startDate && $endDate) {
            $periodDays = $endDate->diffInDays($startDate);
            $previousStartDate = $startDate->copy()->subDays($periodDays);
            $previousEndDate = $startDate->copy()->subDay();
            
            $thisPeriodCount = User::where('role', 0)
                ->whereBetween('created_at', [$startDate, $endDate])
                ->count();

            $previousPeriodCount = User::where('role', 0)
                ->whereBetween('created_at', [$previousStartDate, $previousEndDate])
                ->count();
        } else {
            // Mặc định so sánh tháng này với tháng trước
            $thisPeriodCount = User::where('role', 0)
                ->whereMonth('created_at', Carbon::now()->month)
                ->whereYear('created_at', Carbon::now()->year)
                ->count();

            $previousPeriodCount = User::where('role', 0)
                ->whereMonth('created_at', Carbon::now()->subMonth()->month)
                ->whereYear('created_at', Carbon::now()->subMonth()->year)
                ->count();
        }

        $growthPercent = 0;
        if ($previousPeriodCount > 0) {
            $growthPercent = (($thisPeriodCount - $previousPeriodCount) / $previousPeriodCount) * 100;
        } elseif ($thisPeriodCount > 0) {
            $growthPercent = 100;
        }

        return response()->json([
            'thisCount' => $thisPeriodCount,
            'lastCount' => $previousPeriodCount,
            'growthPercent' => round($growthPercent, 2),
        ]);
    }

    public function ordersByStatus(Request $request)
    {
        $query = Order::query();
        
        // Lọc theo khoảng thời gian nếu có
        if ($request->has('start_date') && $request->has('end_date')) {
            $startDate = Carbon::parse($request->input('start_date'))->startOfDay();
            $endDate = Carbon::parse($request->input('end_date'))->endOfDay();
            $query->whereBetween('created_at', [$startDate, $endDate]);
        }
        
        $stats = $query->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get();

        return response()->json($stats);
    }

    public function topSellingProducts(Request $request)
    {
        $limit = $request->input('limit', 5);
        
        // Build query với join orders để lọc theo thời gian
        $query = DB::table('order_items')
            ->join('product_variants', 'order_items.variant_id', '=', 'product_variants.id')
            ->join('products', 'product_variants.product_id', '=', 'products.id')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->whereIn('orders.status', ['delivered', 'completed']); // Chỉ tính đơn đã giao/hoàn thành

        // Lọc theo khoảng thời gian nếu có
        if ($request->has('start_date') && $request->has('end_date')) {
            $startDate = Carbon::parse($request->input('start_date'))->startOfDay();
            $endDate = Carbon::parse($request->input('end_date'))->endOfDay();
            $query->whereBetween('orders.created_at', [$startDate, $endDate]);
        }

        $topProducts = $query
            ->select(
                'products.id',
                'products.name',
                'products.image as image',
                DB::raw('SUM(order_items.quantity) as total_sold'),
                DB::raw('SUM(order_items.quantity * order_items.price) as total_revenue')
            )
            ->groupBy('products.id', 'products.name', 'products.image')
            ->orderByDesc('total_sold')
            ->limit($limit)
            ->get();

        return response()->json($topProducts);
    }

    public function revenueByTime(Request $request)
    {
        // 1. Lọc các đơn hàng đã được tính doanh thu (delivered hoặc completed)
        $query = Order::whereIn('status', ['delivered', 'completed']);

        // 2. Lọc theo khoảng thời gian dựa trên ngày tạo đơn (created_at)
        if ($request->has('start_date') && $request->has('end_date')) {
            $startDate = Carbon::parse($request->input('start_date'))->startOfDay();
            $endDate = Carbon::parse($request->input('end_date'))->endOfDay();
            $query->whereBetween('created_at', [$startDate, $endDate]);
        } else {
            // Mặc định lấy 30 ngày gần nhất
            $days = $request->input('days', 30);
            $query->where('created_at', '>=', Carbon::now()->subDays($days));
        }

        $revenue = $query
            ->get()
            // 3. Nhóm các đơn hàng theo ngày tạo đơn
            ->groupBy(function ($order) {
                return $order->created_at->format('Y-m-d');
            })
            ->map(function ($dailyOrders, $date) {
                return [
                    'date' => $date,
                    // 4. Tính tổng doanh thu bằng 'final_amount'
                    'total' => $dailyOrders->sum('final_amount'),
                    'order_count' => $dailyOrders->count(),
                ];
            })
            ->sortBy('date') // Sắp xếp kết quả theo ngày
            ->values(); // Reset keys của array

        return response()->json($revenue);
    }

    public function ratingStats(Request $request)
    {
        $query = Comment::query();
        
        // Lọc theo khoảng thời gian nếu có
        if ($request->has('start_date') && $request->has('end_date')) {
            $startDate = Carbon::parse($request->input('start_date'))->startOfDay();
            $endDate = Carbon::parse($request->input('end_date'))->endOfDay();
            $query->whereBetween('created_at', [$startDate, $endDate]);
        }
        
        $stats = $query->select('rating', DB::raw('count(*) as count'))
            ->groupBy('rating')
            ->orderBy('rating')
            ->get();
        
        return response()->json($stats);
    }
}
