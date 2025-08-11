<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Voucher;
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

    // POST /api/vouchers/apply - Áp dụng voucher khi đặt hàng
    public function applyVoucher(Request $request)
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

        if ($voucher->usage_limit !== null && $voucher->used >= $voucher->usage_limit) {
            return response()->json(['message' => 'Voucher đã được sử dụng hết'], 400);
        }

        if ($voucher->min_order_amount && $request->order_amount < $voucher->min_order_amount) {
            return response()->json(['message' => 'Đơn hàng không đủ điều kiện áp dụng voucher'], 400);
        }

        // Tính giảm giá
        $discount = 0;
        if ($voucher->discount_type === 'percent') {
            $discount = $request->order_amount * $voucher->discount_value / 100;
            if ($voucher->max_discount && $discount > $voucher->max_discount) {
                $discount = $voucher->max_discount;
            }
        } else {
            $discount = $voucher->discount_value;
        }

        return response()->json([
            'voucher_id' => $voucher->id,
            'discount_amount' => round($discount),
            'message' => 'Áp dụng voucher thành công',
        ]);
    }

    // POST /api/vouchers
    public function store(Request $request)
    {
        try {
            Log::info('Voucher store request:', $request->all());
            
            $validator = Validator::make($request->all(), [
                'code' => 'required|string|unique:vouchers,code|max:50',
                'discount_amount' => 'required|numeric|min:0',
                'start_date' => 'required|date',
                'end_date' => 'required|date|after:start_date',
                'min_order_amount' => 'nullable|numeric|min:0',
                'max_usage' => 'required|integer|min:1',
                'discount_type' => 'required|in:percentage,amount',
                'description' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                Log::error('Voucher validation failed:', [
                    'request_data' => $request->all(),
                    'errors' => $validator->errors()->toArray()
                ]);
                
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $voucher = Voucher::create([
                'title' => $request->code,
                'code' => $request->code,
                'value' => $request->discount_amount,
                'max_value' => $request->discount_amount,
                'quantity' => $request->max_usage,
                'description' => $request->description ?? 'Voucher giảm giá ' . $request->discount_amount . ' VND',
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
                'discount_amount' => 'required|numeric|min:0',
                'start_date' => 'required|date',
                'end_date' => 'required|date|after:start_date',
                'min_order_amount' => 'nullable|numeric|min:0',
                'max_usage' => 'required|integer|min:1',
                'discount_type' => 'required|in:percentage,amount',
                'description' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }
            
            $voucher->update([
                'title' => $request->code,
                'code' => $request->code,
                'value' => $request->discount_amount,
                'max_value' => $request->discount_amount,
                'description' => $request->description ?? 'Voucher giảm giá ' . $request->discount_amount . ' VND',
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
                'min_order_amount' => $request->min_order_amount ?? 0,
                'max_usage' => $request->max_usage,
            ]);

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
