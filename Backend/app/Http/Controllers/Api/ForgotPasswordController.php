<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\SendOtpMail;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;

class ForgotPasswordController extends Controller
{
    // Gửi mã OTP
    public function sendOtp(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $user = User::where('email', $request->email)->first();
        if (!$user) {
            return response()->json(['message' => 'Email không tồn tại'], 404);
        }
        // ✅ Nếu vẫn còn hiệu lực, không cho gửi lại
        if ($user->otp && $user->otp_expires_at && Carbon::now()->lt($user->otp_expires_at)) {
            return response()->json(['message' => 'OTP đã được gửi. Vui lòng kiểm tra email.'], 429);
        }

        $otp = rand(100000, 999999);
        $user->otp = $otp;
        $user->otp_expires_at = Carbon::now()->addMinutes(5);
        $user->save();

        Mail::to($user->email)->send(new SendOtpMail($otp));

        return response()->json(['message' => 'Đã gửi mã OTP đến email']);
    }

    // Xác minh OTP
    public function verifyOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required|digits:6'
        ]);

        $user = User::where('email', $request->email)
            ->where('otp', $request->otp)
            ->where('otp_expires_at', '>', Carbon::now())
            ->first();

        if (!$user) {
            return response()->json(['message' => 'OTP không đúng hoặc đã hết hạn'], 400);
        }

        return response()->json(['message' => 'Xác minh OTP thành công']);
    }

    // Đặt lại mật khẩu
    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required|digits:6',
            'new_password' => 'required|string|min:6|confirmed'
        ]);

        $user = User::where('email', $request->email)
            ->where('otp', $request->otp)
            ->where('otp_expires_at', '>', Carbon::now())
            ->first();

        if (!$user) {
            return response()->json(['message' => 'OTP không hợp lệ hoặc đã hết hạn'], 400);
        }

        $user->password = Hash::make($request->new_password);
        $user->otp = null;
        $user->otp_expires_at = null;
        $user->save();

        return response()->json(['message' => 'Đặt lại mật khẩu thành công']);
    }
}
