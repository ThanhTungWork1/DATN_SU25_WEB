<?php

namespace App\Services;

use App\Models\User;
use App\Models\Order;
use App\Models\Product;
use App\Models\OrderItem;
use App\Models\ProductVariant;
use App\Models\Category;
use App\Models\Contact;
use App\Models\Comment;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardService
{
    /**
     * Lấy thống kê tổng quan cho dashboard
     */
    public function getOverviewStats()
    {
        $thisMonth = Carbon::now()->startOfMonth();

        return [
            'total_revenue' => $this->getTotalRevenue(),
            'orders_today' => $this->getOrdersToday(),
            'new_users_this_month' => $this->getNewUsersThisMonth($thisMonth),
            'total_products' => Product::where('status', 1)->count(),
            'total_categories' => Category::count(),
            'total_contacts' => Contact::count(),
            'pending_orders' => Order::where('status', 'pending')->count(),
            'total_reviews' => $this->getTotalReviews(),
            'average_rating' => $this->getAverageRating(),
        ];
    }

    /**
     * Tính tổng doanh thu (đã thanh toán và thành công)
     * Chỉ tính doanh thu sản phẩm, không tính phí ship
     */
    private function getTotalRevenue()
    {
        $revenue = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.is_paid', 1)
            ->whereIn('orders.status', ['delivered', 'completed'])
            ->selectRaw('SUM(order_items.quantity * order_items.price) as total_revenue')
            ->value('total_revenue') ?? 0;
        
        // Debug: Log để kiểm tra
        \Log::info('Total Revenue Debug (Product Only)', [
            'raw_revenue' => $revenue,
            'converted_revenue' => $revenue * 1000,
            'orders_count' => Order::where('is_paid', 1)
                                   ->whereIn('status', ['delivered', 'completed'])
                                   ->count(),
            'all_orders' => Order::where('is_paid', 1)
                                 ->whereIn('status', ['delivered', 'completed'])
                                 ->select('id', 'total_amount', 'discount_amount', 'status')
                                 ->get()
                                 ->toArray()
        ]);
        
        // Chuyển đổi từ đơn vị nhỏ sang VND (nhân với 1000)
        return $revenue * 1000;
    }

    /**
     * Đếm đơn hàng hôm nay
     */
    private function getOrdersToday()
    {
        // Sử dụng now() thay vì today() để đảm bảo múi giờ chính xác
        $today = Carbon::now()->startOfDay();
        $tomorrow = Carbon::now()->addDay()->startOfDay();
        
        // Debug: Log thời gian để kiểm tra
        \Log::info('Orders Today Debug', [
            'today_start' => $today->toDateTimeString(),
            'tomorrow_start' => $tomorrow->toDateTimeString(),
            'current_time' => Carbon::now()->toDateTimeString(),
            'current_date' => Carbon::now()->format('Y-m-d'),
            'orders_count' => Order::where('created_at', '>=', $today)
                                  ->where('created_at', '<', $tomorrow)
                                  ->count(),
            'all_orders_today' => Order::where('created_at', '>=', $today)
                                      ->where('created_at', '<', $tomorrow)
                                      ->pluck('created_at')
                                      ->toArray()
        ]);
        
        return Order::where('created_at', '>=', $today)
                   ->where('created_at', '<', $tomorrow)
                   ->count();
    }

    /**
     * Đếm người dùng mới trong tháng
     */
    private function getNewUsersThisMonth($thisMonth)
    {
        $count = User::where('role', 0) // Chỉ user thường, không tính admin/moderator
            ->where('created_at', '>=', $thisMonth)
            ->count();
            
        // Debug: Log để kiểm tra
        \Log::info('New Users This Month Debug', [
            'this_month_start' => $thisMonth->toDateTimeString(),
            'current_time' => Carbon::now()->toDateTimeString(),
            'users_count' => $count,
            'all_users_this_month' => User::where('role', 0)
                                          ->where('created_at', '>=', $thisMonth)
                                          ->pluck('created_at')
                                          ->toArray()
        ]);
        
        return $count;
    }

    /**
     * Lấy thống kê doanh thu theo thời gian
     * Chỉ tính doanh thu sản phẩm, không tính phí ship
     */
    public function getRevenueByTime($period = 'daily', $days = 30)
    {
        $startDate = Carbon::now()->subDays($days);
        $endDate = Carbon::now();

        // Lấy dữ liệu doanh thu từ database (chỉ tính sản phẩm)
        $revenueData = DB::table('order_items')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.is_paid', 1)
            ->whereIn('orders.status', ['delivered', 'completed'])
            ->where('orders.created_at', '>=', $startDate)
            ->selectRaw('
                DATE(orders.created_at) as date,
                SUM(order_items.quantity * order_items.price) as revenue,
                COUNT(DISTINCT orders.id) as order_count
            ')
            ->groupBy('date')
            ->get()
            ->keyBy('date');

        // Tạo mảng tất cả các ngày trong khoảng thời gian
        $allDates = [];
        $currentDate = $startDate->copy();
        
        while ($currentDate <= $endDate) {
            $dateString = $currentDate->format('Y-m-d');
            $allDates[] = [
                'date' => $dateString,
                'revenue' => $revenueData->get($dateString)?->revenue ? (float) $revenueData->get($dateString)->revenue * 1000 : 0,
                'order_count' => $revenueData->get($dateString)?->order_count ? (int) $revenueData->get($dateString)->order_count : 0,
            ];
            $currentDate->addDay();
        }

        return $allDates;
    }

    /**
     * Lấy thống kê đơn hàng theo trạng thái
     */
    public function getOrdersByStatus()
    {
        $statuses = [
            'pending',
            'confirmed',
            'processing',
            'shipping',
            'delivered',
            'cancelled',
            'completed',
            'refunded'
        ];

        $stats = [];
        foreach ($statuses as $status) {
            $count = Order::where('status', $status)->count();
            // Chỉ thêm vào stats nếu có đơn hàng (count > 0)
            if ($count > 0) {
                $stats[] = [
                    'name' => $status, // Đổi từ 'status' thành 'name' để phù hợp với component
                    'count' => $count,
                ];
            }
        }

        return $stats;
    }

    /**
     * Lấy top sản phẩm bán chạy
     */
    public function getTopSellingProducts($limit = 10)
    {
        return DB::table('order_items')
            ->join('product_variants', 'order_items.variant_id', '=', 'product_variants.id')
            ->join('products', 'product_variants.product_id', '=', 'products.id')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.is_paid', 1)
            ->whereIn('orders.status', ['delivered', 'completed']) // Chỉ tính đơn hàng thành công
            ->selectRaw('
                products.id,
                products.name,
                products.image,
                SUM(order_items.quantity) as total_sold,
                SUM(order_items.quantity * order_items.price) as total_revenue
            ')
            ->groupBy('products.id', 'products.name', 'products.image')
            ->orderByDesc('total_sold')
            ->limit($limit)
            ->get()
            ->map(function ($item) {
                // Xử lý đường dẫn ảnh
                $imageUrl = null;
                if ($item->image && !empty($item->image)) {
                    // Nếu image bắt đầu bằng http, giữ nguyên
                    if (str_starts_with($item->image, 'http')) {
                        $imageUrl = $item->image;
                    } else {
                        // Đảm bảo có /storage/ prefix
                        $imageUrl = '/storage/' . ltrim($item->image, '/');
                    }
                }
                
                return [
                    'id' => $item->id,
                    'name' => $item->name,
                    'image' => $imageUrl,
                    'total_sold' => (int) $item->total_sold,
                    'total_revenue' => (float) $item->total_revenue * 1000, // Chuyển đổi sang VND
                ];
            });
    }

    /**
     * Lấy đơn hàng gần đây
     */
    public function getRecentOrders($limit = 10)
    {
        return Order::with('items')
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'customer_name' => $order->customer_name,
                    'total_amount' => $order->total_amount * 1000, // Chuyển đổi sang VND
                    'final_amount' => ($order->total_amount - $order->discount_amount) * 1000, // Chuyển đổi sang VND
                    'status' => $order->status,
                    'created_at' => $order->created_at,
                    'item_count' => $order->items->count(),
                ];
            });
    }

    /**
     * Lấy người dùng mới nhất
     */
    public function getRecentUsers($limit = 10)
    {
        return User::where('role', 0) // Chỉ user thường
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'created_at' => $user->created_at,
                ];
            });
    }

    /**
     * Lấy thống kê người dùng theo tháng
     */
    public function getUsersByMonth($months = 12)
    {
        $startDate = Carbon::now()->subMonths($months);

        return User::where('role', 0)
            ->where('created_at', '>=', $startDate)
            ->selectRaw('
                DATE_FORMAT(created_at, "%Y-%m") as month,
                COUNT(*) as user_count
            ')
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->map(function ($item) {
                return [
                    'month' => Carbon::createFromFormat('Y-m', $item->month)->format('M Y'),
                    'users' => (int) $item->user_count,
                ];
            });
    }

    /**
     * Lấy thống kê tăng trưởng người dùng
     */
    public function getUserGrowth()
    {
        $thisMonth = Carbon::now()->startOfMonth();
        $lastMonth = Carbon::now()->subMonth()->startOfMonth();

        $thisMonthCount = User::where('role', 0)
            ->where('created_at', '>=', $thisMonth)
            ->count();

        $lastMonthCount = User::where('role', 0)
            ->where('created_at', '>=', $lastMonth)
            ->where('created_at', '<', $thisMonth)
            ->count();

        $growthPercent = $lastMonthCount > 0 
            ? (($thisMonthCount - $lastMonthCount) / $lastMonthCount) * 100 
            : ($thisMonthCount > 0 ? 100 : 0);

        // Debug: Log để kiểm tra
        \Log::info('User Growth Debug', [
            'this_month_start' => $thisMonth->toDateTimeString(),
            'last_month_start' => $lastMonth->toDateTimeString(),
            'this_month_count' => $thisMonthCount,
            'last_month_count' => $lastMonthCount,
            'growth_percent' => $growthPercent,
            'this_month_users' => User::where('role', 0)
                                     ->where('created_at', '>=', $thisMonth)
                                     ->pluck('created_at')
                                     ->toArray(),
            'last_month_users' => User::where('role', 0)
                                     ->where('created_at', '>=', $lastMonth)
                                     ->where('created_at', '<', $thisMonth)
                                     ->pluck('created_at')
                                     ->toArray()
        ]);

        return [
            'thisMonth' => $thisMonth->format('Y-m'),
            'lastMonth' => $lastMonth->format('Y-m'),
            'thisCount' => $thisMonthCount,
            'lastCount' => $lastMonthCount,
            'growthPercent' => round($growthPercent, 1),
        ];
    }

    /**
     * Đếm tổng số đánh giá
     */
    private function getTotalReviews()
    {
        return Comment::where('status', 1)->count();
    }

    /**
     * Tính điểm đánh giá trung bình
     */
    private function getAverageRating()
    {
        $avgRating = Comment::where('status', 1)
            ->selectRaw('AVG(rating) as average_rating')
            ->value('average_rating');
        
        return $avgRating ? round($avgRating, 1) : 0;
    }

    /**
     * Lấy thống kê đánh giá theo sao
     */
    public function getRatingStats()
    {
        return Comment::where('status', 1)
            ->selectRaw('rating, COUNT(*) as count')
            ->groupBy('rating')
            ->orderBy('rating', 'desc')
            ->get()
            ->map(function ($item) {
                return [
                    'rating' => (int) $item->rating,
                    'count' => (int) $item->count,
                    'percentage' => round(($item->count / Comment::where('status', 1)->count()) * 100, 1)
                ];
            });
    }

    /**
     * Lấy đánh giá gần đây
     */
    public function getRecentReviews($limit = 10)
    {
        return Comment::with(['user', 'product'])
            ->where('status', 1)
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get()
            ->map(function ($comment) {
                return [
                    'id' => $comment->id,
                    'user_name' => $comment->user->name ?? 'Khách hàng',
                    'product_name' => $comment->product->name ?? 'Sản phẩm',
                    'rating' => (int) $comment->rating,
                    'content' => $comment->content,
                    'created_at' => $comment->created_at,
                ];
            });
    }

        /**
     * Lấy thông tin sản phẩm sắp hết hàng
     */
    public function getLowStockProducts($limit = 5)
    {
        // Lấy số sản phẩm có ít nhất 1 variant stock < 10
        $totalLowStockProducts = ProductVariant::where('stock', '<', 10)
            ->distinct('product_id')
            ->count('product_id');
        
        // Lấy số sản phẩm có ít nhất 1 variant hết hàng (stock = 0)
        $outOfStockProducts = ProductVariant::where('stock', 0)
            ->distinct('product_id')
            ->count('product_id');
        
        // Lấy danh sách sản phẩm có ít nhất 1 variant stock thấp
        $productsWithLowStock = ProductVariant::with(['product', 'size', 'color'])
            ->where('stock', '<', 10)
            ->get()
            ->groupBy('product_id')
            ->map(function ($variants, $productId) {
                $product = $variants->first()->product;
                $lowStockVariants = $variants->map(function ($variant) use ($product) {
                    return [
                        'id' => $variant->id,
                        'size_name' => $variant->size->name ?? 'N/A',
                        'color_name' => $variant->color->name ?? 'N/A',
                        'stock' => (int) $variant->stock,
                        'price' => (int) (($product->price ?? 0) * 1000), // Lấy giá từ product, chuyển đổi sang VND
                        'status' => $variant->stock == 0 ? 'out_of_stock' : 
                                   ($variant->stock < 5 ? 'critical' : 'low'),
                    ];
                })->sortBy('stock')->values()->toArray(); // Chuyển thành array
                
                return [
                    'product_id' => $productId,
                    'product_name' => $product->name ?? 'Sản phẩm',
                    'low_stock_variants' => $lowStockVariants,
                    'total_low_stock_variants' => $variants->count(),
                    'min_stock' => $variants->min('stock'),
                ];
            })
            ->sortBy('min_stock')
            ->take($limit)
            ->values();

        return [
            'total_low_stock' => $totalLowStockProducts,
            'out_of_stock' => $outOfStockProducts,
            'low_stock_products' => $productsWithLowStock,
        ];
    }

} 