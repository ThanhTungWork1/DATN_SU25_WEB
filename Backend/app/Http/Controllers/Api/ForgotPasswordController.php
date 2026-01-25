<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Hash;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Support\Str;

class ForgotPasswordController extends Controller
{
    // Gửi mail reset password
    public function sendResetLinkEmail(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $status = Password::sendResetLink($request->only('email'));

        return $status === Password::RESET_LINK_SENT
            ? response()->json(['message' => __($status)], 200)
            : response()->json(['message' => __($status)], 400);
    }

    // Alias method cho route
    public function forgotPassword(Request $request)
    {
        \Log::info('🔐 FORGOT PASSWORD REQUEST', [
            'email' => $request->email,
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'timestamp' => now()
        ]);

        try {
            $request->validate(['email' => 'required|email']);
            
            \Log::info('✅ FORGOT PASSWORD - VALIDATION PASSED', [
                'email' => $request->email
            ]);
            
            // Kiểm tra user có tồn tại không
            $user = \App\Models\User::where('email', $request->email)->first();
            
            if (!$user) {
                \Log::warning('❌ FORGOT PASSWORD - USER NOT FOUND', [
                    'email' => $request->email
                ]);
                return response()->json([
                    'message' => 'Email không tồn tại trong hệ thống',
                    'status_code' => 404
                ], 404);
            }
            
            \Log::info('✅ FORGOT PASSWORD - USER FOUND', [
                'user_id' => $user->id,
                'user_email' => $user->email,
                'user_name' => $user->name
            ]);
            
            // Tạo token reset password đơn giản
            $token = \Illuminate\Support\Str::random(60);
            
            \Log::info('🔑 FORGOT PASSWORD - TOKEN GENERATED', [
                'email' => $request->email,
                'token' => $token
            ]);
            
            // Lưu token vào database
            try {
                \DB::table('password_reset_tokens')->updateOrInsert(
                    ['email' => $request->email],
                    [
                        'email' => $request->email,
                        'token' => $token,
                        'created_at' => now()
                    ]
                );
                
                \Log::info('💾 FORGOT PASSWORD - TOKEN SAVED TO DATABASE', [
                    'email' => $request->email,
                    'token_saved' => true
                ]);
            } catch (\Exception $dbError) {
                \Log::error('❌ FORGOT PASSWORD - DATABASE ERROR', [
                    'email' => $request->email,
                    'error' => $dbError->getMessage()
                ]);
                throw $dbError;
            }
            
            // Gửi email với token
            try {
                \Log::info('📧 FORGOT PASSWORD - ATTEMPTING TO SEND EMAIL', [
                    'email' => $request->email,
                    'mail_config' => [
                        'driver' => config('mail.default'),
                        'host' => config('mail.mailers.smtp.host'),
                        'port' => config('mail.mailers.smtp.port'),
                        'encryption' => config('mail.mailers.smtp.encryption'),
                        'username' => config('mail.mailers.smtp.username') ? 'SET' : 'NOT_SET'
                    ]
                ]);
                
                // Gửi email thực tế
                \Mail::to($request->email)->send(new \App\Mail\ResetPasswordMail($token, $request->email));
                
                \Log::info('📧 FORGOT PASSWORD - EMAIL SENT SUCCESSFULLY', [
                    'email' => $request->email,
                    'token' => $token
                ]);
                
            } catch (\Exception $emailError) {
                \Log::error('❌ FORGOT PASSWORD - EMAIL ERROR', [
                    'email' => $request->email,
                    'error' => $emailError->getMessage(),
                    'trace' => $emailError->getTraceAsString()
                ]);
                // Không throw error vì token đã được lưu
            }
            
            \Log::info('✅ FORGOT PASSWORD - SUCCESS', [
                'email' => $request->email,
                'token' => $token,
                'message' => 'Đã gửi link khôi phục mật khẩu đến email của bạn'
            ]);
            
            return response()->json([
                'message' => 'Đã gửi link khôi phục mật khẩu đến email của bạn',
                'status_code' => 200,
                'token' => $token // Chỉ để test, production sẽ không trả về token
            ], 200);
            
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::warning('❌ FORGOT PASSWORD - VALIDATION ERROR', [
                'email' => $request->email,
                'errors' => $e->errors()
            ]);
            return response()->json([
                'message' => 'Email không hợp lệ',
                'errors' => $e->errors(),
                'status_code' => 422
            ], 422);
        } catch (\Exception $e) {
            \Log::error('❌ FORGOT PASSWORD - GENERAL ERROR', [
                'email' => $request->email,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'Có lỗi xảy ra, vui lòng thử lại',
                'status_code' => 500
            ], 500);
        }
    }

    // Reset password bằng token
    public function reset(Request $request)
    {
        try {
            \Log::info('🔐 RESET PASSWORD - REQUEST RECEIVED', [
                'email' => $request->email,
                'has_token' => !!$request->token,
                'has_password' => !!$request->password,
                'has_confirmation' => !!$request->password_confirmation
            ]);

            $request->validate([
                'email' => 'required|email',
                'token' => 'required',
                'password' => 'required|min:6|confirmed',
            ]);

            // Kiểm tra token có hợp lệ không
            \Log::info('🔍 RESET PASSWORD - CHECKING TOKEN', [
                'email' => $request->email,
                'token_provided' => $request->token,
                'token_length' => strlen($request->token)
            ]);

            // Kiểm tra tất cả tokens trong database
            $allTokens = \DB::table('password_reset_tokens')->get();
            \Log::info('🔍 RESET PASSWORD - ALL TOKENS IN DB', [
                'total_tokens' => $allTokens->count(),
                'tokens' => $allTokens->map(function($t) {
                    return [
                        'email' => $t->email,
                        'token' => $t->token,
                        'created_at' => $t->created_at
                    ];
                })
            ]);

            $resetRecord = \DB::table('password_reset_tokens')
                ->where('email', $request->email)
                ->where('token', $request->token)
                ->where('created_at', '>', now()->subMinutes(60)) // Token hết hạn sau 60 phút
                ->first();

            \Log::info('🔍 RESET PASSWORD - TOKEN SEARCH RESULT', [
                'email' => $request->email,
                'token_provided' => $request->token,
                'token_found' => $resetRecord ? true : false,
                'reset_record' => $resetRecord ? [
                    'email' => $resetRecord->email,
                    'token' => $resetRecord->token,
                    'created_at' => $resetRecord->created_at
                ] : null
            ]);

            if (!$resetRecord) {
                \Log::warning('❌ RESET PASSWORD - INVALID TOKEN', [
                    'email' => $request->email,
                    'token_provided' => $request->token,
                    'token_found' => $resetRecord ? true : false
                ]);
                
                return response()->json([
                    'message' => 'Token khôi phục mật khẩu không hợp lệ hoặc đã hết hạn',
                    'status_code' => 400
                ], 400);
            }

            // Tìm user
            $user = \App\Models\User::where('email', $request->email)->first();
            
            if (!$user) {
                \Log::error('❌ RESET PASSWORD - USER NOT FOUND', [
                    'email' => $request->email
                ]);
                
                return response()->json([
                    'message' => 'Email không tồn tại trong hệ thống',
                    'status_code' => 404
                ], 404);
            }

            // Cập nhật mật khẩu
            $user->password = Hash::make($request->password);
            $user->save();

            // Xóa token đã sử dụng
            \DB::table('password_reset_tokens')
                ->where('email', $request->email)
                ->delete();

            \Log::info('✅ RESET PASSWORD - SUCCESS', [
                'email' => $request->email,
                'user_id' => $user->id
            ]);

            return response()->json([
                'message' => 'Đặt lại mật khẩu thành công!',
                'status_code' => 200
            ], 200);

        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::warning('❌ RESET PASSWORD - VALIDATION ERROR', [
                'email' => $request->email,
                'errors' => $e->errors()
            ]);
            
            return response()->json([
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $e->errors(),
                'status_code' => 422
            ], 422);
            
        } catch (\Exception $e) {
            \Log::error('❌ RESET PASSWORD - GENERAL ERROR', [
                'email' => $request->email,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'message' => 'Có lỗi xảy ra, vui lòng thử lại',
                'status_code' => 500
            ], 500);
        }
    }

    // Gửi OTP
    public function sendOtp(Request $request)
    {
        try {
            $request->validate(['email' => 'required|email']);
            
            // Kiểm tra user có tồn tại không
            $user = \App\Models\User::where('email', $request->email)->first();
            
            if (!$user) {
                return response()->json([
                    'message' => 'Email không tồn tại trong hệ thống',
                    'status_code' => 404
                ], 404);
            }
            
            // Tạo OTP 6 số
            $otp = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
            
            // Lưu OTP vào database
            \DB::table('password_reset_tokens')->updateOrInsert(
                ['email' => $request->email],
                [
                    'email' => $request->email,
                    'token' => $otp,
                    'created_at' => now()
                ]
            );
            
            // TODO: Gửi email với OTP
            // Hiện tại chỉ log để test
            \Log::info("OTP for {$request->email}: {$otp}");
            
            return response()->json([
                'message' => 'Đã gửi OTP đến email của bạn',
                'status_code' => 200,
                'otp' => $otp // Chỉ để test, production sẽ không trả về OTP
            ], 200);
            
        } catch (\Exception $e) {
            \Log::error("Send OTP error: " . $e->getMessage());
            return response()->json([
                'message' => 'Có lỗi xảy ra, vui lòng thử lại',
                'status_code' => 500
            ], 500);
        }
    }

    // Xác thực OTP
    public function verifyOtp(Request $request)
    {
        try {
            $request->validate([
                'email' => 'required|email',
                'otp' => 'required|string|size:6'
            ]);
            
            // Kiểm tra OTP
            $resetRecord = \DB::table('password_reset_tokens')
                ->where('email', $request->email)
                ->where('token', $request->otp)
                ->where('created_at', '>', now()->subMinutes(10)) // OTP hết hạn sau 10 phút
                ->first();
            
            if (!$resetRecord) {
                return response()->json([
                    'message' => 'OTP không hợp lệ hoặc đã hết hạn',
                    'status_code' => 400
                ], 400);
            }
            
            return response()->json([
                'message' => 'OTP hợp lệ',
                'status_code' => 200
            ], 200);
            
        } catch (\Exception $e) {
            \Log::error("Verify OTP error: " . $e->getMessage());
            return response()->json([
                'message' => 'Có lỗi xảy ra, vui lòng thử lại',
                'status_code' => 500
            ], 500);
        }
    }

    // Reset password (alias cho reset)
    public function resetPassword(Request $request)
    {
        return $this->reset($request);
    }
}