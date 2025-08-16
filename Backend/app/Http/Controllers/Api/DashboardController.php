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
    public function index()
    {
        // Lấy các đơn hàng đã giao và tính tổng doanh thu từ accessor
        $delivered_orders = Order::where('status', 'delivered')->get();
        $total_revenue = $delivered_orders->sum('calculated_final_amount');
        $orders_today = Order::whereDate('created_at', Carbon::today())->count();
        $new_users_this_month = User::whereMonth('created_at', Carbon::now()->month)
            ->whereYear('created_at', Carbon::now()->year)
            ->count();
        $total_products = Product::count();
        $total_categories = Category::count();
        $total_contacts = Contact::count();
        $pending_orders = Order::where('status', 'pending')->count();
        $total_reviews = Comment::count();
        $average_rating = Comment::avg('rating');

        return response()->json([
            'total_revenue' => $total_revenue,
            'orders_today' => $orders_today,
            'new_users_this_month' => $new_users_this_month,
            'total_products' => $total_products,
            'total_categories' => $total_categories,
            'total_contacts' => $total_contacts,
            'pending_orders' => $pending_orders,
            'total_reviews' => $total_reviews,
            'average_rating' => $average_rating ? round($average_rating, 2) : 0,
        ]);
    }

    public function userGrowth()
    {
        $thisMonthCount = User::whereMonth('created_at', Carbon::now()->month)
            ->whereYear('created_at', Carbon::now()->year)
            ->count();

        $lastMonthCount = User::whereMonth('created_at', Carbon::now()->subMonth()->month)
            ->whereYear('created_at', Carbon::now()->subMonth()->year)
            ->count();

        $growthPercent = 0;
        if ($lastMonthCount > 0) {
            $growthPercent = (($thisMonthCount - $lastMonthCount) / $lastMonthCount) * 100;
        } elseif ($thisMonthCount > 0) {
            $growthPercent = 100;
        }

        return response()->json([
            'thisCount' => $thisMonthCount,
            'lastCount' => $lastMonthCount,
            'growthPercent' => round($growthPercent, 2),
        ]);
    }

    public function ordersByStatus()
    {
        $stats = Order::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get();

        return response()->json($stats);
    }

    public function topSellingProducts(Request $request)
    {
        $limit = $request->input('limit', 5);
        $topProducts = DB::table('order_items')
            ->join('product_variants', 'order_items.variant_id', '=', 'product_variants.id')
            ->join('products', 'product_variants.product_id', '=', 'products.id')
            ->select(
                'products.id',
                'products.name',
                'products.image_url as image',
                DB::raw('SUM(order_items.quantity) as total_sold'),
                DB::raw('SUM(order_items.quantity * order_items.price) as total_revenue')
            )
            ->groupBy('products.id', 'products.name', 'products.image_url')
            ->orderByDesc('total_sold')
            ->limit($limit)
            ->get();

        return response()->json($topProducts);
    }

    public function revenueByTime(Request $request)
    {
        $query = Order::where('status', 'delivered');

        if ($request->has('start_date') && $request->has('end_date')) {
            $startDate = Carbon::parse($request->input('start_date'))->startOfDay();
            $endDate = Carbon::parse($request->input('end_date'))->endOfDay();
            $query->whereBetween('created_at', [$startDate, $endDate]);
        } else {
            $days = $request->input('days', 30);
            $query->where('created_at', '>=', Carbon::now()->subDays($days));
        }

        $revenue = $query
            ->with('items') // Tải sẵn các items để tính toán
            ->get()
            ->groupBy(function ($order) {
                return $order->created_at->format('Y-m-d');
            })
            ->map(function ($dailyOrders, $date) {
                return [
                    'date' => $date,
                    'total' => $dailyOrders->sum('calculated_final_amount'),
                ];
            })
            ->sortBy('date')
            ->values();

        return response()->json($revenue);
    }

    public function ratingStats()
    {
        $stats = Comment::select('rating', DB::raw('count(*) as count'))
            ->groupBy('rating')
            ->orderBy('rating')
            ->get();
        
        return response()->json($stats);
    }
}
