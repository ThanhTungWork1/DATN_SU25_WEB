<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Voucher;
use App\Models\Order;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class VoucherController extends Controller
{
    // GET /api/vouchers - Lấy danh sách voucher (cho admin)
    public function index()
    {
        $vouchers = Voucher::orderBy('id', 'desc')->paginate(10);
        return response()->json([
            'status' => 'success',
            'message' => 'Vouchers retrieved successfully',
            'data' => $vouchers
        ], 200);
    }

    // GET /admin/vouchers/{id}/usage - Lấy chi tiết và lịch sử sử dụng voucher
    public function usageDetails($id)
    {
        try {
            $voucher = Voucher::find($id);

            if (!$voucher) {
                return response()->json(['status' => 'error', 'message' => 'Voucher not found'], 404);
            }

            // Lấy lịch sử sử dụng từ các đơn hàng
            $usage_history = Order::where('voucher_id', $id)
                ->with('user') // Eager load thông tin user
                ->get()
                ->map(function ($order) {
                    return [
                        'user_name' => $order->user ? $order->user->name : 'N/A',
                        'user_email' => $order->user ? $order->user->email : 'N/A',
                        'order_code' => $order->code,
                        'discount_amount' => $order->discount_amount,
                        'used_at' => $order->created_at->toDateTimeString(),
                    ];
                });

            return response()->json([
                'status' => 'success',
                'message' => 'Voucher details retrieved successfully',
                'data' => [
                    'voucher' => $voucher,
                    'usage_history' => $usage_history,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching voucher usage details:', ['error' => $e->getMessage()]);
            return response()->json(['status' => 'error', 'message' => 'Internal Server Error'], 500);
        }
    }

    // POST /api/vouchers/apply - Áp dụng voucher khi đặt hàng
    public function validateVoucher(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string',
            'order_amount' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $voucher = Voucher::where('code', $request->code)->first();

        if (!$voucher) {
            return response()->json(['message' => 'Voucher không tồn tại'], 404);
        }

        if ($voucher->start_date && now()->lt(Carbon::parse($voucher->start_date))) {
            return response()->json(['message' => 'Voucher chưa được áp dụng'], 400);
        }

        if ($voucher->end_date && now()->gt(Carbon::parse($voucher->end_date))) {
            return response()->json(['message' => 'Voucher đã hết hạn'], 400);
        }

        if ($voucher->max_usage !== null && $voucher->used_count >= $voucher->max_usage) {
            return response()->json(['message' => 'Voucher đã được sử dụng hết'], 400);
        }

        if ($voucher->min_order_amount && $request->order_amount < $voucher->min_order_amount) {
            return response()->json(['message' => 'Đơn hàng không đủ điều kiện áp dụng voucher'], 400);
        }

        // Tính giảm giá
        $discount = 0;
        if ($voucher->discount_type === 'percentage') {
            $discount = $request->order_amount * $voucher->value / 100;
            if ($voucher->max_value && $discount > $voucher->max_value) {
                $discount = $voucher->max_value;
            }
        } else { // amount
            $discount = $voucher->value;
        }

        return response()->json([
            'voucher' => $voucher, // Trả về toàn bộ đối tượng voucher
            'discount_amount' => round($discount, 2),
            'message' => 'Áp dụng voucher thành công',
        ]);
    }

    // POST /api/vouchers
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'code' => 'required|string|unique:vouchers,code|max:50',
                'discount_type' => 'required|in:percentage,amount',
                'value' => 'required|numeric|min:0',
                'max_value' => 'nullable|numeric|min:0',
                'start_date' => 'required|date',
                'end_date' => 'required|date|after:start_date',
                'min_order_amount' => 'nullable|numeric|min:0',
                'max_usage' => 'required|integer|min:1',
                'description' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $voucher = Voucher::create([
                'title' => $request->code,
                'code' => $request->code,
                'discount_type' => $request->discount_type,
                'value' => $request->value,
                'max_value' => $request->max_value,
                'quantity' => $request->max_usage,
                'description' => $request->description ?? 'Voucher giảm giá',
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
                'min_order_amount' => $request->min_order_amount ?? 0,
                'max_usage' => $request->max_usage,
                'used_count' => 0,
                'status' => true,
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Voucher created successfully',
                'data' => $voucher
            ], 201);

        } catch (\Exception $e) {
            Log::error('Error creating voucher:', ['error' => $e->getMessage()]);
            return response()->json([
                'status' => 'error',
                'message' => 'Error creating voucher: ' . $e->getMessage()
            ], 500);
        }
    }

    // PUT /api/vouchers/{id}
    public function update(Request $request, $id)
    {
        try {
            $voucher = Voucher::find($id);

            if (!$voucher) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Voucher not found'
                ], 404);
            }

            $validator = Validator::make($request->all(), [
                'code' => 'required|string|max:50|unique:vouchers,code,' . $id,
                'discount_type' => 'required|in:percentage,amount',
                'value' => 'required|numeric|min:0',
                'max_value' => 'required_if:discount_type,percentage|numeric|min:0|nullable',
                'start_date' => 'required|date',
                'end_date' => 'required|date|after:start_date',
                'min_order_amount' => 'nullable|numeric|min:0',
                'max_usage' => 'required|integer|min:1',
                'description' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $validatedData = $validator->validated();

            // Nếu là giảm giá theo số tiền, gán max_value = value
            if ($validatedData['discount_type'] === 'amount') {
                $validatedData['max_value'] = $validatedData['value'];
            }

            $updateData = array_merge($validatedData, [
                'title' => $validatedData['code'],
                'description' => $validatedData['description'] ?? 'Voucher giảm giá',
                'min_order_amount' => $validatedData['min_order_amount'] ?? 0,
            ]);

            $voucher->update($updateData);

            return response()->json([
                'status' => 'success',
                'message' => 'Voucher updated successfully',
                'data' => $voucher
            ]);

        } catch (\Exception $e) {
            Log::error('Error updating voucher:', ['error' => $e->getMessage()]);
            return response()->json([
                'status' => 'error',
                'message' => 'Error updating voucher: ' . $e->getMessage()
            ], 500);
        }
    }

    // DELETE /api/vouchers/{id}
    public function destroy($id)
    {
        try {
            $voucher = Voucher::find($id);

            if (!$voucher) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Voucher not found'
                ], 404);
            }

            $voucher->delete();

            return response()->json([
                'status' => 'success',
                'message' => 'Voucher deleted successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Error deleting voucher:', ['error' => $e->getMessage()]);
            return response()->json([
                'status' => 'error',
                'message' => 'Error deleting voucher: ' . $e->getMessage()
            ], 500);
        }
    }

    // PATCH /api/vouchers/{id}/toggle
    public function toggle($id)
    {
        try {
            $voucher = Voucher::find($id);

            if (!$voucher) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Voucher not found'
                ], 404);
            }

            $voucher->update([
                'status' => !$voucher->status
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Voucher status toggled successfully',
                'data' => $voucher
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error toggling voucher: ' . $e->getMessage()
            ], 500);
        }
    }
}
