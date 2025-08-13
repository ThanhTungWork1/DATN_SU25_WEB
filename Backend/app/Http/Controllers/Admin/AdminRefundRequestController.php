<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\RefundRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class AdminRefundRequestController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $query = RefundRequest::with(['user', 'order'])
                                    ->orderBy('created_at', 'desc');

            if ($request->has('status') && $request->status != '') {
                $query->where('status', $request->status);
            }

            $refundRequests = $query->paginate(15);

            return response()->json($refundRequests);

        } catch (\Exception $e) {
            Log::error('Error fetching refund requests: ' . $e->getMessage());
            return response()->json(['message' => 'Đã xảy ra lỗi khi tải danh sách yêu cầu hoàn tiền.'], 500);
        }
    }

    /**
     * Update the status of the specified resource in storage.
     */
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|string|in:approved,rejected,pending',
        ]);

        try {
            $refundRequest = RefundRequest::findOrFail($id);

            $refundRequest->status = $request->status;
            $refundRequest->save();
            
            // TODO: Add logic here to update order status or trigger notifications

            return response()->json([
                'message' => 'Cập nhật trạng thái yêu cầu hoàn tiền thành công.',
                'refundRequest' => $refundRequest
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Không tìm thấy yêu cầu hoàn tiền.'], 404);
        } catch (\Exception $e) {
            Log::error("Error updating refund request status for ID {$id}: " . $e->getMessage());
            return response()->json(['message' => 'Đã xảy ra lỗi khi cập nhật trạng thái.'], 500);
        }
    }
}
