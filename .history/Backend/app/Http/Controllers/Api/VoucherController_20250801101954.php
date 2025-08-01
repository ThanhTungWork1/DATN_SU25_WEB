<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Voucher;
use Illuminate\Support\Facades\Validator;

class VoucherController extends Controller
{
    // GET /api/vouchers
    public function index()
    {
        $vouchers = Voucher::orderBy('id', 'desc')->paginate(10);
        return response()->json([
            'status' => 'success',
            'message' => 'Vouchers retrieved successfully',
            'data' => $vouchers
        ], 200);
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

<<<<<<< HEAD
    // POST /api/vouchers
    public function store(Request $request)
    {
        try {
            \Log::info('Voucher store request:', $request->all());
            \Log::info('Date format check:', [
                'expires_at' => $request->expires_at,
                'parsed_date' => \Carbon\Carbon::parse($request->expires_at)->format('Y-m-d')
            ]);
            
            $validator = Validator::make($request->all(), [
                'code' => 'required|string|unique:vouchers,code|max:50',
                'discount_amount' => 'required|numeric|min:0',
                'expires_at' => 'required|date|after_or_equal:today',
            ]);

            if ($validator->fails()) {
                \Log::error('Voucher validation failed:', [
                    'request_data' => $request->all(),
                    'errors' => $validator->errors()->toArray()
                ]);
                
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Đảm bảo date format đúng
            $expiresAt = \Carbon\Carbon::parse($request->expires_at)->format('Y-m-d');
            
            $voucher = Voucher::create([
                'title' => 'Voucher ' . $request->code,
                'code' => $request->code,
                'value' => $request->discount_amount,
                'max_value' => $request->discount_amount,
                'quantity' => 100,
                'description' => 'Voucher giảm giá ' . $request->discount_amount . ' VND',
                'start_date' => now()->toDateString(),
                'end_date' => $expiresAt,
                'status' => true,
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Voucher created successfully',
                'data' => $voucher
            ], 201);

        } catch (\Exception $e) {
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
                'expires_at' => 'required|date|after_or_equal:today',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Đảm bảo date format đúng
            $expiresAt = \Carbon\Carbon::parse($request->expires_at)->format('Y-m-d');
            
            $voucher->update([
                'title' => 'Voucher ' . $request->code,
                'code' => $request->code,
                'value' => $request->discount_amount,
                'max_value' => $request->discount_amount,
                'description' => 'Voucher giảm giá ' . $request->discount_amount . ' VND',
                'end_date' => $expiresAt,
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Voucher updated successfully',
                'data' => $voucher
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error updating voucher: ' . $e->getMessage()
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
=======
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
>>>>>>> origin/hoan-cart
            ], 500);
        }
    }
}
