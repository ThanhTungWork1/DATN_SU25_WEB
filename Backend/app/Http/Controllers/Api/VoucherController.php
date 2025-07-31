<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Voucher;
use Illuminate\Support\Facades\Validator;

class VoucherController extends Controller
{
    // GET /api/vouchers - Lấy danh sách voucher (cho admin)
    public function index()
    {
        $vouchers = Voucher::orderBy('created_at', 'desc')->get();
        return response()->json($vouchers, 200);
    }

    // GET /api/vouchers/active - Lấy danh sách voucher đang hoạt động (cho user)
    public function active()
    {
        $vouchers = Voucher::where('status', 1)
            ->where('used_count', '<', 'usage_limit')
            ->where('start_date', '<=', now()->toDateString())
            ->where('end_date', '>=', now()->toDateString())
            ->get();
        return response()->json($vouchers, 200);
    }

    // GET /api/vouchers/{id} - Xem chi tiết voucher
    public function show($id)
    {
        $voucher = Voucher::find($id);

        if (!$voucher) {
            return response()->json(['message' => 'Voucher not found'], 404);
        }

        return response()->json($voucher, 200);
    }

    // POST /api/vouchers - Tạo voucher mới
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:100',
            'code' => 'required|string|max:50|unique:vouchers,code',
            'value' => 'required|numeric|min:0',
            'max_value' => 'required|numeric|min:0',
            'min_order_amount' => 'required|numeric|min:0',
            'quantity' => 'required|integer|min:1',
            'usage_limit' => 'required|integer|min:1',
            'user_type' => 'required|in:all,new,existing',
            'discount_type' => 'required|in:percentage,fixed',
            'description' => 'required|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'status' => 'boolean',
            'product_categories' => 'nullable|array',
            'excluded_products' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $voucher = Voucher::create($request->all());
        return response()->json($voucher, 201);
    }

    // PUT /api/vouchers/{id} - Cập nhật voucher
    public function update(Request $request, $id)
    {
        $voucher = Voucher::find($id);

        if (!$voucher) {
            return response()->json(['message' => 'Voucher not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:100',
            'code' => 'sometimes|required|string|max:50|unique:vouchers,code,' . $id,
            'value' => 'sometimes|required|numeric|min:0',
            'max_value' => 'sometimes|required|numeric|min:0',
            'min_order_amount' => 'sometimes|required|numeric|min:0',
            'quantity' => 'sometimes|required|integer|min:1',
            'usage_limit' => 'sometimes|required|integer|min:1',
            'user_type' => 'sometimes|required|in:all,new,existing',
            'discount_type' => 'sometimes|required|in:percentage,fixed',
            'description' => 'sometimes|required|string',
            'start_date' => 'sometimes|required|date',
            'end_date' => 'sometimes|required|date|after:start_date',
            'status' => 'sometimes|boolean',
            'product_categories' => 'sometimes|nullable|array',
            'excluded_products' => 'sometimes|nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $voucher->update($request->all());
        return response()->json($voucher, 200);
    }

    // DELETE /api/vouchers/{id} - Xóa voucher
    public function destroy($id)
    {
        $voucher = Voucher::find($id);

        if (!$voucher) {
            return response()->json(['message' => 'Voucher not found'], 404);
        }

        $voucher->delete();
        return response()->json(['message' => 'Voucher deleted successfully'], 200);
    }

    // POST /api/vouchers/validate - Kiểm tra voucher (cho user)
    public function validateVoucher(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string',
            'order_amount' => 'required|numeric|min:0',
            'user_type' => 'required|in:new,existing',
            'product_ids' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $voucher = Voucher::where('code', $request->code)->first();

        if (!$voucher) {
            return response()->json(['message' => 'Voucher không tồn tại'], 404);
        }

        if (!$voucher->isUsable()) {
            return response()->json(['message' => 'Voucher không còn hiệu lực hoặc đã hết lượt sử dụng'], 400);
        }

        if (!$voucher->canApplyToOrder($request->order_amount, $request->user_type, $request->product_ids ?? [])) {
            return response()->json(['message' => 'Voucher không áp dụng được cho đơn hàng này'], 400);
        }

        $discount = $voucher->calculateDiscount($request->order_amount);
        $finalAmount = $request->order_amount - $discount;

        return response()->json([
            'voucher' => $voucher,
            'discount' => $discount,
            'final_amount' => $finalAmount,
            'message' => 'Voucher hợp lệ'
        ], 200);
    }

    // POST /api/vouchers/{id}/use - Sử dụng voucher
    public function useVoucher($id)
    {
        $voucher = Voucher::find($id);

        if (!$voucher) {
            return response()->json(['message' => 'Voucher not found'], 404);
        }

        if (!$voucher->isUsable()) {
            return response()->json(['message' => 'Voucher không còn hiệu lực'], 400);
        }

        $voucher->increment('used_count');
        return response()->json(['message' => 'Voucher đã được sử dụng'], 200);
    }
}
