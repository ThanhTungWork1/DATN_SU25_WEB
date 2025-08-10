<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\VoucherController;

// Test endpoint để kiểm tra kết nối database
Route::get('/test-db', function() {
    try {
        $voucher = \App\Models\Voucher::first();
        return response()->json([
            'status' => 'success',
            'message' => 'Database connection successful',
            'data' => $voucher
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => 'Database error: ' . $e->getMessage()
        ], 500);
    }
});

// PUBLIC VOUCHER ROUTES (không cần authentication)
Route::post('/vouchers/validate', [VoucherController::class, 'validateVoucher']);
Route::get('/vouchers/available/list', [VoucherController::class, 'getAvailableVouchers']);

// Simple voucher test endpoint (public)
Route::post('/test-voucher', function(Request $request) {
    try {
        $code = $request->input('code');
        $totalAmount = $request->input('total_amount');
        
        // Vouchers test cố định
        $vouchers = [
            'SAVE10' => [
                'title' => 'Giảm giá 10%',
                'code' => 'SAVE10',
                'value' => 10.00,
                'max_value' => 50000.00,
                'quantity' => 100,
                'description' => 'Giảm giá 10% cho đơn hàng từ 100,000 VND',
                'start_date' => '2025-01-01',
                'end_date' => '2025-12-31',
                'status' => true
            ],
            'SAVE20' => [
                'title' => 'Giảm giá 20%',
                'code' => 'SAVE20',
                'value' => 20.00,
                'max_value' => 100000.00,
                'quantity' => 50,
                'description' => 'Giảm giá 20% cho đơn hàng từ 200,000 VND',
                'start_date' => '2025-01-01',
                'end_date' => '2025-12-31',
                'status' => true
            ],
            'FIXED30K' => [
                'title' => 'Giảm giá cố định 30,000 VND',
                'code' => 'FIXED30K',
                'value' => 30000.00,
                'max_value' => 30000.00,
                'quantity' => 200,
                'description' => 'Giảm giá cố định 30,000 VND cho đơn hàng từ 150,000 VND',
                'start_date' => '2025-01-01',
                'end_date' => '2025-12-31',
                'status' => true
            ],
            'MUA HE 2025' => [
                'title' => 'MUA HE',
                'code' => 'MUA HE 2025',
                'value' => 10.00,
                'max_value' => 50000.00,
                'quantity' => 100,
                'description' => 'Voucher giảm 10% cho đơn từ 100k, tối đa 50k',
                'start_date' => '2025-08-01',
                'end_date' => '2025-08-31',
                'status' => true
            ]
        ];
        
        if (!isset($vouchers[$code])) {
            return response()->json([
                'status' => 'error',
                'message' => 'Mã voucher không tồn tại'
            ], 404);
        }
        
        $voucher = $vouchers[$code];
        
        // Kiểm tra thời gian hiệu lực
        $now = date('Y-m-d');
        if ($now < $voucher['start_date'] || $now > $voucher['end_date']) {
            return response()->json([
                'status' => 'error',
                'message' => 'Voucher đã hết hạn hoặc chưa có hiệu lực'
            ], 400);
        }
        
        // Kiểm tra số lượng còn lại
        if ($voucher['quantity'] <= 0) {
            return response()->json([
                'status' => 'error',
                'message' => 'Voucher đã hết số lượng'
            ], 400);
        }
        
        // Tính toán giảm giá
        if ($voucher['code'] === 'FIXED30K') {
            // Giảm cố định
            $discount = min($voucher['value'], $voucher['max_value']);
        } else {
            // Giảm theo %
            $discount = min($totalAmount * ($voucher['value'] / 100), $voucher['max_value']);
        }
        
        return response()->json([
            'status' => 'success',
            'message' => 'Voucher hợp lệ',
            'data' => [
                'voucher' => $voucher,
                'discount_amount' => $discount,
                'final_amount' => $totalAmount - $discount
            ]
        ], 200);
        
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => 'Có lỗi xảy ra: ' . $e->getMessage()
        ], 500);
    }
}); 