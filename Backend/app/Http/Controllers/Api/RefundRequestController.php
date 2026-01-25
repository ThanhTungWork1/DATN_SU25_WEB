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
        Log::info('🔍 Refund request received:', [
            'all_data' => $request->all(),
            'files' => $request->allFiles(),
            'headers' => $request->headers->all(),
            'content_type' => $request->header('Content-Type'),
            'method' => $request->method()
        ]);

        $validator = Validator::make($request->all(), [
            'order_id' => 'required|integer|exists:orders,id',
            'amount' => 'required|numeric|min:0',
            'reason' => 'nullable|string|max:1000',
            'bank_account_name' => 'required|string|max:100',
            'bank_account_number' => 'required|string|max:50',
            'bank_name' => 'required|string|max:100',
            'evidence_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp,bmp,tiff,svg|max:10240', // 10MB max, nhiều định dạng hơn
        ], [
            'order_id.required' => 'ID đơn hàng là bắt buộc',
            'order_id.exists' => 'Đơn hàng không tồn tại',
            'amount.required' => 'Số tiền là bắt buộc',
            'amount.numeric' => 'Số tiền phải là số',
            'amount.min' => 'Số tiền phải lớn hơn 0',
            'bank_account_name.required' => 'Tên chủ tài khoản là bắt buộc',
            'bank_account_name.max' => 'Tên chủ tài khoản không được quá 100 ký tự',
            'bank_account_number.required' => 'Số tài khoản là bắt buộc',
            'bank_account_number.max' => 'Số tài khoản không được quá 50 ký tự',
            'bank_name.required' => 'Tên ngân hàng là bắt buộc',
            'bank_name.max' => 'Tên ngân hàng không được quá 100 ký tự',
            'evidence_image.image' => 'File phải là hình ảnh',
            'evidence_image.mimes' => 'Chỉ chấp nhận file ảnh (JPG, PNG, GIF, WEBP, BMP, TIFF, SVG)',
            'evidence_image.max' => 'Kích thước file không được quá 10MB'
        ]);

        if ($validator->fails()) {
            Log::error('🔍 Validation failed:', [
                'errors' => $validator->errors()->toArray()
            ]);
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = Auth::user();
        $orderId = $request->input('order_id');

        $order = Order::where('id', $orderId)->where('user_id', $user->id)->first();

        if (!$order) {
            return response()->json(['message' => 'Bạn không có quyền thực hiện hành động này trên đơn hàng này.'], 403);
        }

        // 🔧 FIX: Logic nghiệp vụ đúng cho phép hoàn tiền
        // Cho phép hoàn tiền khi:
        // 1. Đơn hàng đã giao (delivered) - có vấn đề khi giao hàng
        // 2. Đơn hàng đã hủy (cancelled) - đã thanh toán nhưng hủy đơn
        // 3. KHÔNG cho phép khi đã hoàn thành (completed) - đã hoàn tất bình thường
        $allowedStatuses = ['delivered', 'cancelled'];
        if (!in_array($order->status, $allowedStatuses)) {
            return response()->json([
                'message' => 'Chỉ có thể yêu cầu hoàn tiền cho đơn hàng đã giao hoặc đã hủy.'
            ], 422);
        }

        // 🔧 FIX: Kiểm tra đơn hàng đã thanh toán chưa
        // Lý do: Chỉ hoàn tiền cho đơn hàng đã thanh toán
        if (!$order->is_paid) {
            return response()->json([
                'message' => 'Chỉ có thể yêu cầu hoàn tiền cho đơn hàng đã thanh toán.'
            ], 422);
        }

        // Check if a refund request for this order already exists
        $existingRequest = RefundRequest::where('order_id', $orderId)->first();
        if ($existingRequest) {
            return response()->json(['message' => 'Yêu cầu hoàn tiền cho đơn hàng này đã tồn tại.'], 409); // 409 Conflict
        }

        // Handle image upload
        $evidenceImagePath = null;
        if ($request->hasFile('evidence_image')) {
            $file = $request->file('evidence_image');
            $fileName = time() . '_' . $file->getClientOriginalName();
            $evidenceImagePath = $file->storeAs('refund-evidence', $fileName, 'public');
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
            'evidence_image' => $evidenceImagePath,
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
