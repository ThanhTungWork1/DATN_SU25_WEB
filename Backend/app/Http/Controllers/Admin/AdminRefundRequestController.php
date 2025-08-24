<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\RefundRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use App\Mail\RefundCompletionMail;

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
        Log::info("🚀 === REFUND UPDATE START ===");
        Log::info("🔍 Request ID: " . $id);
        Log::info("🔍 Request Method: " . $request->method());
        Log::info("🔍 Content Type: " . $request->header('Content-Type'));
        
        // Try to get data from request
        $status = $request->input('status');
        $transactionCode = $request->input('transaction_code');
        $noteAdmin = $request->input('note_admin');
        $billImage = $request->file('bill_image');
        
        // If data is null, try to get from raw input
        if (!$status || !$transactionCode || !$noteAdmin) {
            Log::info("🔍 Data is null, trying to parse raw input");
            $rawInput = $request->getContent();
            Log::info("🔍 Raw input: " . $rawInput);
            
            // Try to parse as JSON first
            $jsonData = json_decode($rawInput, true);
            if ($jsonData) {
                Log::info("🔍 Parsed as JSON");
                $status = $status ?: ($jsonData['status'] ?? null);
                $transactionCode = $transactionCode ?: ($jsonData['transaction_code'] ?? null);
                $noteAdmin = $noteAdmin ?: ($jsonData['note_admin'] ?? null);
            }
        }
        
        Log::info("🔍 FormData Received:");
        Log::info("  - status: " . ($status ?: 'NULL'));
        Log::info("  - transaction_code: " . ($transactionCode ?: 'NULL'));
        Log::info("  - note_admin: " . ($noteAdmin ?: 'NULL'));
        Log::info("  - bill_image: " . ($billImage ? 'File exists' : 'NULL'));
        
        // Debug bill image details
        if ($billImage) {
            Log::info("🔍 Bill Image Details:");
            Log::info("  - Original Name: " . $billImage->getClientOriginalName());
            Log::info("  - Size: " . $billImage->getSize());
            Log::info("  - MIME Type: " . $billImage->getMimeType());
            Log::info("  - Extension: " . $billImage->getClientOriginalExtension());
            Log::info("  - Is Valid: " . ($billImage->isValid() ? 'Yes' : 'No'));
        }

        Log::info("🔍 Parsed Data Results:");
        Log::info("  - status: " . ($status ?: 'NULL'));
        Log::info("  - transaction_code: " . ($transactionCode ?: 'NULL'));
        Log::info("  - note_admin: " . ($noteAdmin ?: 'NULL'));
        Log::info("  - bill_image: " . ($billImage ? 'File exists' : 'NULL'));
        
        if ($billImage) {
            Log::info("🔍 Bill Image Details:");
            Log::info("  - Original Name: " . $billImage->getClientOriginalName());
            Log::info("  - Size: " . $billImage->getSize());
            Log::info("  - MIME Type: " . $billImage->getMimeType());
            Log::info("  - Extension: " . $billImage->getClientOriginalExtension());
        }

        // Manual validation with detailed logging
        Log::info("🔍 === VALIDATION START ===");
        
        if (!$status) {
            Log::error("❌ VALIDATION FAILED: Status is empty!");
            return response()->json(['message' => 'The status field is required.'], 422);
        }
        Log::info("✅ Status validation passed: " . $status);

        if (!in_array($status, ['approved', 'rejected', 'pending', 'refunded'])) {
            Log::error("❌ VALIDATION FAILED: Invalid status: " . $status);
            return response()->json(['message' => 'Invalid status value.'], 422);
        }
        Log::info("✅ Status value validation passed");

        if ($status === 'refunded') {
            Log::info("🔍 Refunded status - checking additional fields...");
            
            if (!$transactionCode) {
                Log::error("❌ VALIDATION FAILED: Transaction code is empty!");
                return response()->json(['message' => 'Transaction code is required for refunded status.'], 422);
            }
            Log::info("✅ Transaction code validation passed: " . $transactionCode);
            
            if (!$noteAdmin) {
                Log::error("❌ VALIDATION FAILED: Note admin is empty!");
                return response()->json(['message' => 'Note is required for refunded status.'], 422);
            }
            Log::info("✅ Note admin validation passed: " . $noteAdmin);
            
            // Validate bill image (optional for now)
            if (!$billImage) {
                Log::info("⚠️ Bill image not provided, skipping validation");
            } else {
                Log::info("✅ Bill image validation passed");
            }
        }
        
        Log::info("✅ All validations passed!");

        try {
            Log::info("🔍 === DATABASE OPERATION START ===");
            Log::info("🔍 Finding refund request with ID: " . $id);
            
            $refundRequest = RefundRequest::findOrFail($id);
            Log::info("✅ Refund request found: " . $refundRequest->id);
            Log::info("🔍 Current status: " . $refundRequest->status);

            // Validation already done above - no need for Laravel validation

            $refundRequest->status = $status;
            $refundRequest->save();
            
            // Auto update order status when refund is approved
            if ($status === 'approved') {
                $order = $refundRequest->order;
                if ($order) {
                    $order->status = 'cancelled';
                    $order->save();
                    Log::info("Order #{$order->id} status updated to 'cancelled' after refund approval");
                }
            }

            // Handle refund completion
            if ($status === 'refunded') {
                Log::info("🔍 === REFUND COMPLETION START ===");
                
                $refundRequest->transaction_code = $transactionCode;
                $refundRequest->note_admin = $noteAdmin;
                Log::info("✅ Updated transaction_code: " . $transactionCode);
                Log::info("✅ Updated note_admin: " . $noteAdmin);
                
                // Handle bill image upload
                if ($billImage) {
                    Log::info("🔍 Processing bill image upload...");
                    $billImageName = 'bill_' . time() . '_' . $refundRequest->id . '.' . $billImage->getClientOriginalExtension();
                    Log::info("🔍 Bill image name: " . $billImageName);
                    
                    $billImage->storeAs('public/refund_bills', $billImageName);
                    $refundRequest->bill_image = 'refund_bills/' . $billImageName;
                    Log::info("✅ Bill image stored: " . $refundRequest->bill_image);
                }
                
                Log::info("🔍 Saving refund request...");
                $refundRequest->save();
                Log::info("✅ Refund request saved successfully");

                // Send email notification to user
                Log::info("🔍 Sending email notification...");
                $this->sendRefundCompletionEmail($refundRequest);
                Log::info("✅ Email sent successfully");

                Log::info("🎉 Refund completed for Order #{$refundRequest->order_id}");
            }

            Log::info("🔍 === RESPONSE PREPARATION ===");
            Log::info("✅ Preparing success response...");
            
            $response = [
                'message' => 'Cập nhật trạng thái yêu cầu hoàn tiền thành công.',
                'refundRequest' => $refundRequest
            ];
            
            Log::info("🔍 Response data:", $response);
            Log::info("🎉 === REFUND UPDATE COMPLETED SUCCESSFULLY ===");
            
            return response()->json($response);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['message' => 'Không tìm thấy yêu cầu hoàn tiền.'], 404);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error("❌ === VALIDATION EXCEPTION ===");
            Log::error("Validation error for refund request ID {$id}: " . $e->getMessage());
            Log::error("Validation errors: " . json_encode($e->errors()));
            return response()->json([
                'message' => 'Dữ liệu không hợp lệ.',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error("❌ === GENERAL EXCEPTION ===");
            Log::error("Error updating refund request status for ID {$id}: " . $e->getMessage());
            Log::error("Stack trace: " . $e->getTraceAsString());
            return response()->json(['message' => 'Đã xảy ra lỗi khi cập nhật trạng thái.'], 500);
        }
    }

    /**
     * Send refund completion email to user
     */
    private function sendRefundCompletionEmail($refundRequest)
    {
        try {
            $user = $refundRequest->user;
            $order = $refundRequest->order;

            Mail::to($user->email)->send(new RefundCompletionMail($refundRequest, $order));
            
            Log::info("Refund completion email sent to {$user->email} for Order #{$order->id}");
        } catch (\Exception $e) {
            Log::error("Failed to send refund completion email: " . $e->getMessage());
        }
    }
}
