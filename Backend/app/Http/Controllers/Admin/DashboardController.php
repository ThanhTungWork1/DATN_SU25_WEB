<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\DashboardService;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    protected $dashboardService;

    public function __construct(DashboardService $dashboardService)
    {
        $this->dashboardService = $dashboardService;
    }

    /**
     * Lấy thống kê tổng quan cho dashboard
     */
    public function index()
    {
        try {
            $stats = $this->dashboardService->getOverviewStats();
            
            return response()->json([
                'success' => true,
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lấy thống kê tổng quan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Lấy thống kê doanh thu theo thời gian
     */
    public function revenueByTime(Request $request)
    {
        try {
            $days = $request->get('days', 30);
            $period = $request->get('period', 'daily');
            
            $data = $this->dashboardService->getRevenueByTime($period, $days);
            
            return response()->json([
                'success' => true,
                'data' => $data
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lấy thống kê doanh thu: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Lấy thống kê đơn hàng theo trạng thái
     */
    public function ordersByStatus()
    {
        try {
            $data = $this->dashboardService->getOrdersByStatus();
            
            return response()->json([
                'success' => true,
                'data' => $data
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lấy thống kê đơn hàng: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Lấy top sản phẩm bán chạy
     */
    public function topSellingProducts(Request $request)
    {
        try {
            $limit = $request->get('limit', 10);
            $data = $this->dashboardService->getTopSellingProducts($limit);
            
            return response()->json([
                'success' => true,
                'data' => $data
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lấy top sản phẩm: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Lấy đơn hàng gần đây
     */
    public function recentOrders(Request $request)
    {
        try {
            $limit = $request->get('limit', 10);
            $data = $this->dashboardService->getRecentOrders($limit);
            
            return response()->json([
                'success' => true,
                'data' => $data
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lấy đơn hàng gần đây: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Lấy người dùng mới nhất
     */
    public function recentUsers(Request $request)
    {
        try {
            $limit = $request->get('limit', 10);
            $data = $this->dashboardService->getRecentUsers($limit);
            
            return response()->json([
                'success' => true,
                'data' => $data
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lấy người dùng gần đây: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Lấy thống kê người dùng theo tháng
     */
    public function usersByMonth(Request $request)
    {
        try {
            $months = $request->get('months', 12);
            $data = $this->dashboardService->getUsersByMonth($months);
            
            return response()->json([
                'success' => true,
                'data' => $data
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lấy thống kê người dùng: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Lấy thống kê tăng trưởng người dùng
     */
    public function userGrowth()
    {
        try {
            $data = $this->dashboardService->getUserGrowth();
            
            return response()->json([
                'success' => true,
                'data' => $data
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lấy thống kê tăng trưởng: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Lấy thống kê đánh giá theo sao
     */
    public function ratingStats()
    {
        try {
            $data = $this->dashboardService->getRatingStats();
            
            return response()->json([
                'success' => true,
                'data' => $data
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lấy thống kê đánh giá: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Lấy đánh giá gần đây
     */
    public function recentReviews(Request $request)
    {
        try {
            $limit = $request->get('limit', 10);
            $data = $this->dashboardService->getRecentReviews($limit);
            
            return response()->json([
                'success' => true,
                'data' => $data
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lấy đánh giá gần đây: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Lấy thông tin sản phẩm sắp hết hàng
     */
    public function lowStockProducts(Request $request)
    {
        try {
            $limit = $request->get('limit', 5);
            $data = $this->dashboardService->getLowStockProducts($limit);
            
            return response()->json([
                'success' => true,
                'data' => $data
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lấy thông tin tồn kho: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Lấy tất cả thống kê cho dashboard (combo endpoint)
     */
    public function allStats()
    {
        try {
            $data = [
                'overview' => $this->dashboardService->getOverviewStats(),
                'revenue_by_time' => $this->dashboardService->getRevenueByTime(),
                'orders_by_status' => $this->dashboardService->getOrdersByStatus(),
                'top_products' => $this->dashboardService->getTopSellingProducts(5),
                'recent_orders' => $this->dashboardService->getRecentOrders(5),
                'recent_users' => $this->dashboardService->getRecentUsers(5),
                'user_growth' => $this->dashboardService->getUserGrowth(),
                'rating_stats' => $this->dashboardService->getRatingStats(),
                'recent_reviews' => $this->dashboardService->getRecentReviews(5),
            ];
            
            return response()->json([
                'success' => true,
                'data' => $data
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lấy thống kê: ' . $e->getMessage()
            ], 500);
        }
    }
}