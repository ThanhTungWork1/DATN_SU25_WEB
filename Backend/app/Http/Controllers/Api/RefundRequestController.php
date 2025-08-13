<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use App\Models\Order;
use App\Models\RefundRequest;

class RefundRequestController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'order_id' => 'required|integer|exists:orders,id',
            'amount' => 'required|numeric|min:0',
            'reason' => 'nullable|string|max:1000',
            'bank_account_name' => 'required|string|max:100',
            'bank_account_number' => 'required|string|max:50',
            'bank_name' => 'required|string|max:100',
            'evidence_image' => 'nullable|string', // Assuming base64 string for now
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = Auth::user();
        $orderId = $request->input('order_id');

        $order = Order::where('id', $orderId)->where('user_id', $user->id)->first();

        if (!$order) {
            return response()->json(['message' => 'Bạn không có quyền thực hiện hành động này trên đơn hàng này.'], 403);
        }

        // Check if a refund request for this order already exists
        $existingRequest = RefundRequest::where('order_id', $orderId)->first();
        if ($existingRequest) {
            return response()->json(['message' => 'Yêu cầu hoàn tiền cho đơn hàng này đã tồn tại.'], 409); // 409 Conflict
        }

        // Create the refund request
        $refundRequest = RefundRequest::create([
            'order_id' => $orderId,
            'user_id' => $user->id,
            'amount' => $request->input('amount'),
            'reason' => $request->input('reason'),
            'bank_account_name' => $request->input('bank_account_name'),
            'bank_account_number' => $request->input('bank_account_number'),
            'bank_name' => $request->input('bank_name'),
            'evidence_image' => $request->input('evidence_image'), // Handle image upload/storage properly later
            'status' => 'pending', // Initial status
        ]);

        return response()->json([
            'message' => 'Yêu cầu hoàn tiền của bạn đã được gửi thành công!',
            'data' => $refundRequest
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
