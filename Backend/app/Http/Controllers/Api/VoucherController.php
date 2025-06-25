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
}
