<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Voucher;

class VoucherController extends Controller
{
    // GET /api/vouchers
    public function index()
    {
        return response()->json(Voucher::where('status', 1)->get(), 200);
    }

    // GET /api/vouchers/{code}
    public function show($code)
    {
        $voucher = Voucher::where('code', $code)->where('status', 1)->first();

        if (!$voucher) {
            return response()->json(['message' => 'Voucher not found or expired'], 404);
        }

        // Kiểm tra thời gian hiệu lực
        $now = now()->toDateString();
        if ($now < $voucher->start_date || $now > $voucher->end_date) {
            return response()->json(['message' => 'Voucher expired or not valid now'], 400);
        }

        return response()->json($voucher, 200);
    }

    // POST /api/vouchers/validate
    public function validateVoucher(Request $request)
    {
        $request->validate([
            'code' => 'required|string',
            'total_amount' => 'required|numeric'
        ]);

        $voucher = Voucher::where('code', $request->code)->where('status', 1)->first();

        if (!$voucher) {
            return response()->json([
                'status' => 'error',
                'message' => 'Mã voucher không tồn tại hoặc đã hết hạn'
            ], 404);
        }

        // Kiểm tra thời gian hiệu lực
        $now = now()->toDateString();
        if ($now < $voucher->start_date || $now > $voucher->end_date) {
            return response()->json([
                'status' => 'error',
                'message' => 'Voucher đã hết hạn hoặc chưa có hiệu lực'
            ], 400);
        }

        // Kiểm tra số lượng còn lại
        if ($voucher->quantity <= 0) {
            return response()->json([
                'status' => 'error',
                'message' => 'Voucher đã hết số lượng'
            ], 400);
        }

        // Tính toán giảm giá
        if ($voucher->value <= 100) {
            // Giảm theo %
            $discount = min($request->total_amount * ($voucher->value / 100), $voucher->max_value);
        } else {
            // Giảm cố định
            $discount = min($voucher->value, $voucher->max_value);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Voucher hợp lệ',
            'data' => [
                'voucher' => $voucher,
                'discount_amount' => $discount,
                'final_amount' => $request->total_amount - $discount
            ]
        ], 200);
    }

    // GET /api/vouchers/available/list
    public function getAvailableVouchers()
    {
        try {
            $now = now()->toDateString();
            
            $vouchers = Voucher::where('status', 1)
                ->where('start_date', '<=', $now)
                ->where('end_date', '>=', $now)
                ->where('quantity', '>', 0)
                ->select('code', 'title', 'description', 'value', 'max_value')
                ->get();

            return response()->json([
                'status' => 'success',
                'message' => 'Lấy danh sách voucher thành công',
                'data' => $vouchers
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Có lỗi xảy ra: ' . $e->getMessage()
            ], 500);
        }
    }
}
