<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Voucher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class VoucherController extends Controller
{
    /**
     * Display a listing of vouchers
     */
    public function index(Request $request)
    {
        try {
            $query = Voucher::query();

            // Tìm kiếm theo mã voucher
            if ($request->has('search') && $request->search) {
                $query->where('code', 'like', '%' . $request->search . '%');
            }

            // Lọc theo trạng thái
            if ($request->has('status') && $request->status) {
                switch ($request->status) {
                    case 'active':
                        $query->where('status', true)
                              ->where('end_date', '>', now())
                              ->whereRaw('used_count < max_usage');
                        break;
                    case 'locked':
                        $query->where('status', false);
                        break;
                    case 'expired':
                        $query->where('end_date', '<', now());
                        break;
                    case 'used_up':
                        $query->whereRaw('used_count >= max_usage');
                        break;
                }
            }

            // Lọc theo khoảng thời gian
            if ($request->has('date_from') && $request->date_from) {
                $query->where('created_at', '>=', $request->date_from);
            }
            if ($request->has('date_to') && $request->date_to) {
                $query->where('created_at', '<=', $request->date_to . ' 23:59:59');
            }

            // Sắp xếp
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            $vouchers = $query->paginate(10);

            return response()->json([
                'status' => 'success',
                'message' => 'Lấy danh sách voucher thành công',
                'data' => $vouchers
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Có lỗi xảy ra: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created voucher
     */
    public function store(Request $request)
    {
        try {
            \Log::info('🔍 [VOUCHER DEBUG] Store method called');
            \Log::info('🔍 [VOUCHER DEBUG] Request data:', $request->all());
            
            $validator = Validator::make($request->all(), [
                'code' => 'required|string|unique:vouchers,code|max:50',
                'value' => 'required|numeric|min:0',
                'start_date' => 'required|date|after_or_equal:today',
                'end_date' => 'required|date|after:start_date',
                'min_order_amount' => 'nullable|numeric|min:0',
                'max_usage' => 'required|integer|min:1',
                'discount_type' => 'required|in:amount,percentage',
                'description' => 'nullable|string|max:500',
            ]);

            \Log::info('🔍 [VOUCHER DEBUG] Validation passed');

            if ($validator->fails()) {
                \Log::error('🔍 [VOUCHER DEBUG] Validation failed:', $validator->errors()->toArray());
                return response()->json([
                    'status' => 'error',
                    'message' => 'Dữ liệu không hợp lệ',
                    'errors' => $validator->errors()
                ], 422);
            }

            \Log::info('🔍 [VOUCHER DEBUG] About to create voucher with data:', [
                'title' => 'Voucher ' . $request->code,
                'code' => $request->code,
                'value' => $request->value,
                'max_value' => $request->max_value ?? $request->value,
                'quantity' => $request->max_usage,
                'description' => $request->description ?? 'Voucher giảm giá ' . $request->value . ' VND',
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
                'min_order_amount' => $request->min_order_amount ?? 0,
                'max_usage' => $request->max_usage,
                'used_count' => 0,
                'discount_type' => $request->discount_type,
                'status' => true,
            ]);

            // Đảm bảo max_value luôn có giá trị
            $maxValue = $request->max_value ?? $request->value;
            
            $voucher = Voucher::create([
                'title' => 'Voucher ' . $request->code,
                'code' => $request->code,
                'value' => $request->value,
                'max_value' => $maxValue,
                'quantity' => $request->max_usage,
                'description' => $request->description ?? 'Voucher giảm giá ' . $request->value . ' VND',
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
                'min_order_amount' => $request->min_order_amount ?? 0,
                'max_usage' => $request->max_usage,
                'used_count' => 0,
                'discount_type' => $request->discount_type,
                'status' => true,
            ]);

            \Log::info('🔍 [VOUCHER DEBUG] Voucher created successfully:', $voucher->toArray());

            return response()->json([
                'status' => 'success',
                'message' => 'Tạo voucher thành công',
                'data' => $voucher
            ], 201);

        } catch (\Exception $e) {
            \Log::error('🔍 [VOUCHER DEBUG] Exception caught:', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'status' => 'error',
                'message' => 'Có lỗi xảy ra: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified voucher
     */
    public function show($id)
    {
        try {
            $voucher = Voucher::find($id);
            
            if (!$voucher) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Không tìm thấy voucher'
                ], 404);
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Lấy thông tin voucher thành công',
                'data' => $voucher
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Có lỗi xảy ra: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified voucher
     */
    public function update(Request $request, $id)
    {
        try {
            $voucher = Voucher::find($id);
            
            if (!$voucher) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Không tìm thấy voucher'
                ], 404);
            }

            // Không cho phép sửa voucher đã được sử dụng
            if ($voucher->used_count > 0) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Không thể sửa voucher đã được sử dụng'
                ], 422);
            }

            $validator = Validator::make($request->all(), [
                'code' => 'required|string|max:50|unique:vouchers,code,' . $id,
                'value' => 'required|numeric|min:0',
                'start_date' => 'required|date',
                'end_date' => 'required|date|after:start_date',
                'min_order_amount' => 'nullable|numeric|min:0',
                'max_usage' => 'required|integer|min:1',
                'discount_type' => 'required|in:amount,percentage',
                'description' => 'nullable|string|max:500',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Dữ liệu không hợp lệ',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Đảm bảo max_value luôn có giá trị
            $maxValue = $request->max_value ?? $request->value;
            
            $voucher->update([
                'title' => 'Voucher ' . $request->code,
                'code' => $request->code,
                'value' => $request->value,
                'max_value' => $maxValue,
                'quantity' => $request->max_usage,
                'description' => $request->description ?? 'Voucher giảm giá ' . $request->value . ' VND',
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
                'min_order_amount' => $request->min_order_amount ?? 0,
                'max_usage' => $request->max_usage,
                'discount_type' => $request->discount_type,
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Cập nhật voucher thành công',
                'data' => $voucher
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Có lỗi xảy ra: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Toggle voucher status (lock/unlock)
     */
    public function toggle($id)
    {
        try {
            $voucher = Voucher::find($id);
            
            if (!$voucher) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Không tìm thấy voucher'
                ], 404);
            }

            $voucher->update([
                'status' => !$voucher->status
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Thay đổi trạng thái voucher thành công',
                'data' => $voucher
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Có lỗi xảy ra: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified voucher
     */
    public function destroy($id)
    {
        try {
            $voucher = Voucher::find($id);
            
            if (!$voucher) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Không tìm thấy voucher'
                ], 404);
            }

            // Chỉ cho phép xóa voucher đã hết hạn
            if ($voucher->end_date > now()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Chỉ có thể xóa voucher đã hết hạn'
                ], 422);
            }

            $voucher->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Xóa voucher thành công'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Có lỗi xảy ra: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get voucher usage details
     */
    public function usageDetails($id)
    {
        try {
            $voucher = Voucher::with(['usage.user', 'usage.order'])->find($id);
            
            if (!$voucher) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Không tìm thấy voucher'
                ], 404);
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Lấy thông tin sử dụng voucher thành công',
                'data' => [
                    'voucher' => $voucher,
                    'usage_list' => $voucher->usage->map(function($usage) {
                        return [
                            'user_name' => $usage->user->name ?? $usage->user->email,
                            'user_email' => $usage->user->email,
                            'order_code' => $usage->order->order_code ?? 'N/A',
                            'discount_amount' => $usage->discount_amount,
                            'used_at' => $usage->used_at->format('d/m/Y H:i:s')
                        ];
                    })
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Có lỗi xảy ra: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get voucher statistics
     */
    public function statistics()
    {
        try {
            $totalVouchers = Voucher::count();
            $activeVouchers = Voucher::where('status', true)
                                   ->where('end_date', '>', now())
                                   ->whereRaw('used_count < max_usage')
                                   ->count();
            $expiredVouchers = Voucher::where('end_date', '<', now())->count();
            $lockedVouchers = Voucher::where('status', false)->count();
            $usedUpVouchers = Voucher::whereRaw('used_count >= max_usage')->count();

            return response()->json([
                'status' => 'success',
                'message' => 'Lấy thống kê voucher thành công',
                'data' => [
                    'total' => $totalVouchers,
                    'active' => $activeVouchers,
                    'expired' => $expiredVouchers,
                    'locked' => $lockedVouchers,
                    'used_up' => $usedUpVouchers
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Có lỗi xảy ra: ' . $e->getMessage()
            ], 500);
        }
    }
} 