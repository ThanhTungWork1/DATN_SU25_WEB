<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\InventoryService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class InventoryController extends Controller
{
    protected $inventoryService;

    public function __construct(InventoryService $inventoryService)
    {
        $this->inventoryService = $inventoryService;
    }

    /**
     * Get inventory statistics
     */
    public function stats(): JsonResponse
    {
        try {
            $stats = $this->inventoryService->getInventoryStats();
            
            return response()->json([
                'success' => true,
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lấy thống kê tồn kho: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get inventory list with pagination and search
     */
    public function list(Request $request): JsonResponse
    {
        try {
            $search = $request->input('search', '');
            $page = $request->input('page', 1);
            $perPage = $request->input('per_page', 10);

            $inventory = $this->inventoryService->getInventoryList($search, $page, $perPage);
            
            return response()->json([
                'success' => true,
                'data' => $inventory
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lấy danh sách tồn kho: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get low stock alerts
     */
    public function lowStockAlerts(Request $request): JsonResponse
    {
        try {
            $limit = $request->input('limit', 5);
            $alerts = $this->inventoryService->getLowStockAlerts($limit);
            
            return response()->json([
                'success' => true,
                'data' => $alerts
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi lấy cảnh báo tồn kho: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update stock for order status change
     */
    public function updateStockForOrder(Request $request): JsonResponse
    {
        try {
            $orderId = $request->input('order_id');
            $newStatus = $request->input('new_status');
            $oldStatus = $request->input('old_status');

            if (!$orderId || !$newStatus) {
                return response()->json([
                    'success' => false,
                    'message' => 'Thiếu thông tin order_id hoặc new_status'
                ], 400);
            }

            $result = $this->inventoryService->updateStockForOrder($orderId, $newStatus, $oldStatus);
            
            if ($result) {
                return response()->json([
                    'success' => true,
                    'message' => 'Cập nhật tồn kho thành công'
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy đơn hàng hoặc lỗi cập nhật'
                ], 404);
            }
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi cập nhật tồn kho: ' . $e->getMessage()
            ], 500);
        }
    }
}
