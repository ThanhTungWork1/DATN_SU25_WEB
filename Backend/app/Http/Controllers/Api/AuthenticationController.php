<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\QueryException;
use Illuminate\Auth\Events\Registered;

class AuthenticationController extends Controller
{
    public function register(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email',
                'password' => 'required|string|min:6|confirmed',
                'phone' => 'required|string|max:20|unique:users,phone',
                'address' => 'required|string|max:255'
            ]);

            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'],
                'address' => $validated['address'],
                'password' => Hash::make($validated['password']),
                'role' => 0,
                'status' => 1,
                'is_verified' => 0
            ]);

            event(new Registered($user)); // Gửi email xác minh

            Log::info('User registered:', ['user_id' => $user->id, 'role' => $user->role, 'email' => $user->email]);

            $token = $user->createToken('access_token')->plainTextToken;

            return response()->json([
                'message' => 'Đăng ký thành công. Vui lòng kiểm tra email để xác minh!',
                'user' => $user,
                'token' => $token
            ], 201);
        } catch (QueryException $e) {
            return response()->json([
                'message' => 'Lỗi khi tạo user: ' . $e->getMessage(),
                'status' => false
            ], 500);
        }
    }

    public function login(Request $request)
    {
        $request->validate([
            'login' => 'required|string',
            'password' => 'required|string|min:6'
        ]);

        $loginField = filter_var($request->login, FILTER_VALIDATE_EMAIL) ? 'email' : 'phone';

        $credentials = [
            $loginField => $request->login,
            'password' => $request->password
        ];

        if (Auth::attempt($credentials)) {
            $user = auth()->user();

            if ($user->status == 0) {
                // Tài khoản bị khoá
                return response()->json([
                    'message' => 'Tài khoản của bạn đã bị khoá!',
                    'status_code' => 403
                ], 403);
            }

            // Xoá token cũ và tạo token mới
            $user->tokens()->delete();
            $token = $user->createToken('access_token')->plainTextToken;

            return response()->json([
                'message' => 'Login thành công',
                'user' => $user,
                'token' => $token,
                'status_code' => 200
            ], 200);
        }

        // Nếu đăng nhập thất bại
        return response()->json([
            'message' => 'Email/SĐT hoặc mật khẩu không đúng!',
            'status_code' => 401
        ], 401);
    }

    public function adminLogin(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string|min:6'
        ]);

        // Tìm user theo email
        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'message' => 'Email không tồn tại!',
                'status_code' => 401
            ], 401);
        }

        // Kiểm tra mật khẩu
        if (!Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Mật khẩu không đúng!',
                'status_code' => 401
            ], 401);
        }

        // Kiểm tra role admin
        if ((int) $user->role !== 1) {
            return response()->json([
                'message' => 'Tài khoản không phải admin!',
                'status_code' => 403
            ], 403);
        }

        // Kiểm tra trạng thái
        if ($user->status == 0) {
            return response()->json([
                'message' => 'Tài khoản của bạn đã bị khoá!',
                'status_code' => 403
            ], 403);
        }

        // Tạo token
        $user->tokens()->delete();
        $token = $user->createToken('access_token')->plainTextToken;

        return response()->json([
            'message' => 'Login thành công',
            'user' => $user,
            'token' => $token,
            'status_code' => 200
        ], 200);
    }



    public function logout(Request $request)
    {
        try {
            $request->user()->tokens()->delete();

            return response()->json([
                'message' => 'Logout thành công',
                'status_code' => 200
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Lỗi khi logout: ' . $e->getMessage(),
                'status_code' => 500
            ], 500);
        }
    }
}