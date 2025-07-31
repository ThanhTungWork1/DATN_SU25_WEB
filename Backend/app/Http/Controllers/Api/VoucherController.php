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

    // POST /api/vouchers
    public function store(Request $request)
    {
        try {
            \Log::info('Voucher store request:', $request->all());
            
            $validator = Validator::make($request->all(), [
                'code' => 'required|string|unique:vouchers,code|max:50',
                'discount_amount' => 'required|numeric|min:0',
                'expires_at' => 'required|date_format:Y-m-d|after_or_equal:today',
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
                'expires_at' => 'required|date_format:Y-m-d|after_or_equal:today',
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
            ], 500);
        }
    }
}
