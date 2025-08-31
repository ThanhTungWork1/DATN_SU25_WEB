<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\ProductVariant;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class OrderController extends Controller
{
    /**
     * Lấy danh sách đơn hàng, có phân trang và tìm kiếm.
     */
    public function index(Request $request)
    {
        try {
            \Log::info('🔍 [BACKEND DEBUG] Admin orders index called');
            \Log::info('🔍 [BACKEND DEBUG] Request parameters:', $request->all());
            
            $query = Order::query();

        // Tìm kiếm theo mã đơn hàng, order_code hoặc tên khách hàng
        if ($request->has('search') && $request->input('search') != '') {
            $searchTerm = $request->input('search');

            $query->where(function ($q) use ($searchTerm) {
                $q->where('id', 'like', '%' . $searchTerm . '%')
                  ->orWhere('order_code', 'like', '%' . $searchTerm . '%')
                  ->orWhere('customer_name', 'like', '%' . $searchTerm . '%')
                  ->orWhere('customer_email', 'like', '%' . $searchTerm . '%')
                  ->orWhere('customer_phone', 'like', '%' . $searchTerm . '%');
            });
        }

        // Filter theo trạng thái đơn hàng
        if ($request->has('status') && $request->input('status') != '') {
            $query->where('status', $request->input('status'));
        }

        // Filter theo trạng thái thanh toán
        if ($request->has('is_paid') && $request->input('is_paid') !== '') {
            $query->where('is_paid', $request->input('is_paid'));
        }

        // Filter theo khoảng thời gian
        if ($request->has('date_from') && $request->input('date_from') != '') {
            $query->whereDate('created_at', '>=', $request->input('date_from'));
        }

        if ($request->has('date_to') && $request->input('date_to') != '') {
            $query->whereDate('created_at', '<=', $request->input('date_to'));
        }

        // Chỉ lấy đơn hàng có ít nhất 1 sản phẩm với quantity > 0
        $orders = $query->whereHas('items', function($q) {
            $q->where('quantity', '>', 0);
        })->with(['items' => function($query) {
            $query->select('id', 'order_id', 'quantity', 'price');
        }])->orderBy('created_at', 'desc')->paginate(20);
        
            \Log::info('🔍 [BACKEND DEBUG] Orders found:', $orders->toArray());
            
            return $orders;
        } catch (\Exception $e) {
            \Log::error('🔍 [BACKEND ERROR] Admin orders index error:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'error' => 'Có lỗi xảy ra khi tải danh sách đơn hàng',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Tạo đơn hàng mới.
     */
    public function store(Request $request)
    {
        return DB::transaction(function () use ($request) {
            $data = $request->validate([
                'user_id' => 'required|exists:users,id',
                'status' => 'required|string',
                'is_paid' => 'required|boolean',
                'total_amount' => 'required|numeric',
                'shipping_fee' => 'required|numeric',
                'discount_amount' => 'required|numeric',
                'final_amount' => 'required|numeric',
                'customer_name' => 'required|string',
                'customer_email' => 'required|email',
                'customer_phone' => 'required|string',
                'shipping_address' => 'required|string',
                'payment_method' => 'required|string',
                'notes' => 'nullable|string',
                'items' => 'required|array|min:1', // Đảm bảo có ít nhất 1 item
                'items.*.variant_id' => 'required|exists:product_variants,id',
                'items.*.quantity' => 'required|integer|min:1',
            ]);

            // Validate thêm: đảm bảo có ít nhất 1 sản phẩm với quantity > 0
            $totalQuantity = collect($data['items'])->sum('quantity');
            if ($totalQuantity <= 0) {
                throw new \Illuminate\Validation\ValidationException(
                    validator([], []), 
                    'Đơn hàng phải có ít nhất 1 sản phẩm với số lượng lớn hơn 0.'
                );
            }

            $order = Order::create($data);

            // Tạo các sản phẩm trong đơn hàng (order items)
            foreach ($data['items'] as $item) {
                $variant = ProductVariant::with(['product', 'color', 'size'])->find($item['variant_id']);
                if ($variant) {
                    OrderItem::create([
                        'order_id' => $order->id,
                        'variant_id' => $variant->id,
                        'quantity' => $item['quantity'],
                        'price' => $variant->price, // Lấy giá từ biến thể để đảm bảo chính xác
                        // Lưu lại thông tin "snapshot"
                        'product_name' => $variant->product->name,
                        'variant_color_name' => $variant->color->name,
                        'variant_size_name' => $variant->size->name,
                        'variant_sku' => $variant->sku,
                        'variant_image' => $variant->image,
                    ]);
                }
            }
            return $order->load('items');
        });
    }

    /**
     * Hiển thị chi tiết một đơn hàng.
     */
    public function show($id)
    {
        $order = Order::with(['items.variant.product', 'items.variant.color', 'items.variant.size' => function($query) {
            $query->orderBy('created_at', 'asc');
        }])->findOrFail($id);

        // Tính toán thêm thông tin
        $order->total_items = $order->items->count();
        $order->total_quantity = $order->items->sum('quantity');
        
        return response()->json([
            'status' => 'success',
            'message' => 'Lấy chi tiết đơn hàng thành công',
            'data' => $order
        ]);
    }

    /**
     * Cập nhật một đơn hàng.
     */
    public function update(Request $request, $id)
    {
        $order = Order::findOrFail($id);

        $validatedData = $request->validate([
            'status' => ['sometimes', 'required', Rule::in(['pending_confirmation', 'confirmed', 'processing', 'shipping', 'delivered', 'completed', 'cancelled'])],
            'is_paid' => 'sometimes|required|boolean',
            'notes' => 'nullable|string',
            'shipping_company' => 'nullable|string|max:255',
            'tracking_number' => 'nullable|string|max:255',
            'estimated_delivery_date' => 'nullable|date',
            'shipping_date' => 'nullable|date',
            'delivered_at' => 'nullable|date',
        ]);

        // 🔧 FIX: Validation logic nghiệp vụ
        if (isset($validatedData['status']) && isset($validatedData['is_paid'])) {
            // Không cho phép completed mà chưa thanh toán
            if ($validatedData['status'] === 'completed' && !$validatedData['is_paid']) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Không thể chuyển đơn hàng sang "Đã hoàn thành" khi chưa thanh toán!'
                ], 400);
            }
            
            // Không cho phép đã thanh toán mà vẫn ở trạng thái pending
            if ($validatedData['is_paid'] && in_array($validatedData['status'], ['pending_confirmation', 'pending'])) {
                return response()->json([
                    'status' => 'error', 
                    'message' => 'Đơn hàng đã thanh toán không thể ở trạng thái "Chờ xác nhận"!'
                ], 400);
            }

            // 🔧 FIX: Không cho phép hủy đơn hàng đang giao, đã giao hoặc đã hoàn thành
            if ($validatedData['status'] === 'cancelled') {
                if ($order->status === 'shipping' || $order->status === 'delivered' || $order->status === 'completed') {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Không thể hủy đơn hàng đang giao, đã giao hoặc đã hoàn thành. Nếu cần xử lý vấn đề, hãy chuyển sang "Đã hoàn tiền"!'
                    ], 400);
                }
            }
        }

        // Kịch bản 1: Cập nhật trạng thái đơn hàng
        if (isset($validatedData['status'])) {
            // Tự động set ngày xác nhận khi chuyển từ pending_confirmation sang confirmed
            if ($validatedData['status'] === 'confirmed' && $order->status === 'pending_confirmation') {
                $validatedData['confirmed_at'] = now();
            }
            
            // Tự động set ngày giao hàng khi chuyển sang delivered
            if ($validatedData['status'] === 'delivered' && $order->status !== 'delivered') {
                $validatedData['delivered_at'] = now();
                
                // 🔧 FIX: COD tự động đánh dấu đã thanh toán khi giao hàng thành công
                if ($order->payment_method === 'COD' || $order->payment_method === 'Thanh toán khi nhận hàng (COD)') {
                    $validatedData['is_paid'] = true;
                }
            }
            
            // Tự động set ngày vận chuyển khi chuyển sang shipping
            if ($validatedData['status'] === 'shipping' && $order->status !== 'shipping') {
                $validatedData['shipping_date'] = now();
            }

            // 🔧 FIX: Tự động đánh dấu đã thanh toán khi chuyển sang completed
            if ($validatedData['status'] === 'completed' && $order->status !== 'completed') {
                $validatedData['is_paid'] = true;
            }
        }

        // Kịch bản 2: Cập nhật trạng thái thanh toán
        if (isset($validatedData['is_paid'])) {
            if ($validatedData['is_paid'] === true || $validatedData['is_paid'] == 1) {
                // Chỉ tự động chuyển status khi thanh toán và đang ở delivered
                if ($order->status === 'delivered') {
                    $validatedData['status'] = 'completed';
                }
                // Không tự động chuyển từ pending_confirmation sang confirmed
            } else {
                // 🔧 FIX: Nếu đánh dấu chưa thanh toán và đang ở completed, chuyển về delivered
                if ($order->status === 'completed') {
                    $validatedData['status'] = 'delivered';
                }
            }
        }

        $order->update($validatedData);
        $order->refresh();

        return response()->json([
            'status' => 'success',
            'message' => 'Cập nhật đơn hàng thành công!',
            'data' => $order->load('items')
        ]);
    }

    /**
     * Xóa một đơn hàng.
     */
    public function destroy($id)
    {
        $order = Order::findOrFail($id);
        $order->delete();
        return response()->json(['message' => 'Xóa đơn hàng thành công!']);
    }

    /**
     * Lấy tất cả đơn hàng của một người dùng cụ thể.
     */
    public function getOrdersByUser($userId)
    {
        $orders = Order::where('user_id', $userId)
                       ->with('items')
                       ->latest()
                       ->get();

        if ($orders->isEmpty()) {
            return response()->json(['message' => 'Không tìm thấy đơn hàng nào cho người dùng này.'], 404);
        }

        return response()->json($orders);
    }

    /**
     * Lấy thống kê đơn hàng theo trạng thái.
     */
    public function getOrderStatistics()
    {
        try {
            // Chỉ tính đơn hàng có items với quantity > 0
            $validOrdersQuery = Order::whereHas('items', function($q) {
                $q->where('quantity', '>', 0);
            });

            $statistics = [
                'total' => $validOrdersQuery->count(),
                'pending_confirmation' => $validOrdersQuery->where('status', 'pending_confirmation')->count(),
                'confirmed' => $validOrdersQuery->where('status', 'confirmed')->count(),
                'processing' => $validOrdersQuery->where('status', 'processing')->count(),
                'shipping' => $validOrdersQuery->where('status', 'shipping')->count(),
                'delivered' => $validOrdersQuery->where('status', 'delivered')->count(),
                'completed' => $validOrdersQuery->where('status', 'completed')->count(),
                'cancelled' => $validOrdersQuery->where('status', 'cancelled')->count(),
                'paid' => $validOrdersQuery->where('is_paid', true)->count(),
                'unpaid' => $validOrdersQuery->where('is_paid', false)->count(),
            ];

            return response()->json($statistics);
        } catch (\Exception $e) {
            \Log::error('🔍 [BACKEND ERROR] getOrderStatistics error:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'error' => 'Có lỗi xảy ra khi tải thống kê đơn hàng',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Export đơn hàng ra file CSV.
     */
    public function export(Request $request)
    {
        $query = Order::query();

        // Áp dụng các filter tương tự như index
        if ($request->has('search') && $request->input('search') != '') {
            $searchTerm = $request->input('search');
            $query->where(function ($q) use ($searchTerm) {
                $q->where('id', 'like', '%' . $searchTerm . '%')
                  ->orWhere('order_code', 'like', '%' . $searchTerm . '%')
                  ->orWhere('customer_name', 'like', '%' . $searchTerm . '%')
                  ->orWhere('customer_email', 'like', '%' . $searchTerm . '%')
                  ->orWhere('customer_phone', 'like', '%' . $searchTerm . '%');
            });
        }

        if ($request->has('status') && $request->input('status') != '') {
            $query->where('status', $request->input('status'));
        }

        if ($request->has('is_paid') && $request->input('is_paid') !== '') {
            $query->where('is_paid', $request->input('is_paid'));
        }

        // Chỉ export đơn hàng có ít nhất 1 sản phẩm với quantity > 0
        $orders = $query->whereHas('items', function($q) {
            $q->where('quantity', '>', 0);
        })->with('items')->latest()->get();

        $filename = 'orders_' . date('Y-m-d_H-i-s') . '.csv';
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function() use ($orders) {
            $file = fopen('php://output', 'w');
            
            // Header CSV
            fputcsv($file, [
                'Mã đơn hàng',
                'Order Code',
                'Tên khách hàng',
                'Email',
                'Số điện thoại',
                'Địa chỉ giao hàng',
                'Trạng thái',
                'Đã thanh toán',
                'Tổng tiền',
                'Phí vận chuyển',
                'Giảm giá',
                'Thành tiền',
                'Phương thức thanh toán',
                'Ghi chú',
                'Ngày tạo'
            ]);

            foreach ($orders as $order) {
                fputcsv($file, [
                    $order->id,
                    $order->order_code,
                    $order->customer_name,
                    $order->customer_email,
                    $order->customer_phone,
                    $order->shipping_address,
                    $order->status,
                    $order->is_paid ? 'Đã thanh toán' : 'Chưa thanh toán',
                    $order->total_amount,
                    $order->shipping_fee,
                    $order->discount_amount,
                    $order->final_amount,
                    $order->payment_method,
                    $order->notes,
                    $order->created_at
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
