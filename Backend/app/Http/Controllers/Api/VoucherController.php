<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Voucher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class VoucherController extends Controller
{
    // GET /api/vouchers - Lấy danh sách voucher (cho admin)
    public function index()
    {
        $vouchers = Voucher::orderBy('created_at', 'desc')->get();
        return response()->json($vouchers, 200);
    }

    // POST /api/vouchers - Thêm voucher mới
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|unique:vouchers,code',
            'discount_type' => 'required|in:percent,fixed',
            'discount_value' => 'required|numeric|min:0',
            'min_order_amount' => 'nullable|numeric|min:0',
            'max_discount' => 'nullable|numeric|min:0',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'usage_limit' => 'nullable|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $voucher = Voucher::create($request->all());

        return response()->json($voucher, 201);
    }

    // GET /api/vouchers/{id} - Chi tiết voucher
    public function show($id)
    {
        $voucher = Voucher::find($id);
        if (!$voucher) {
            return response()->json(['message' => 'Voucher not found'], 404);
        }
        return response()->json($voucher);
    }

    // PUT /api/vouchers/{id} - Cập nhật voucher
    public function update(Request $request, $id)
    {
        $voucher = Voucher::find($id);
        if (!$voucher) {
            return response()->json(['message' => 'Voucher not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'code' => 'required|unique:vouchers,code,' . $voucher->id,
            'discount_type' => 'required|in:percent,fixed',
            'discount_value' => 'required|numeric|min:0',
            'min_order_amount' => 'nullable|numeric|min:0',
            'max_discount' => 'nullable|numeric|min:0',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'usage_limit' => 'nullable|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $voucher->update($request->all());

        return response()->json($voucher);
    }

    // DELETE /api/vouchers/{id} - Xoá voucher
    public function destroy($id)
    {
        $voucher = Voucher::find($id);
        if (!$voucher) {
            return response()->json(['message' => 'Voucher not found'], 404);
        }

        $voucher->delete();
        return response()->json(['message' => 'Voucher deleted']);
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
}
