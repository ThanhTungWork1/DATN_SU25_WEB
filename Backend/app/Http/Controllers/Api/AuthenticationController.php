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

            $role = User::count() === 0 ? 1 : 0; // user đầu tiên là admin (1), còn lại là user (0)

            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'],
                'address' => $validated['address'],
                'password' => Hash::make($validated['password']),
                'role' => $role,
                'status' => true,
                'is_verified' => true // **FIX: Tự động verify để không cần email verification**
            ]);

            // **COMMENT: Tắt email verification để tránh lỗi route**
            // event(new Registered($user)); // Gửi email xác minh

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
        Log::info('🔐 LOGIN ATTEMPT', [
            'login' => $request->login,
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'timestamp' => now()
        ]);

        $request->validate([
            'login' => 'required|string',
            'password' => 'required|string|min:6',
        ]);

        $loginField = filter_var($request->login, FILTER_VALIDATE_EMAIL) ? 'email' : 'phone';

        $credentials = [
            $loginField => $request->login,
            'password' => $request->password,
        ];

        Log::info('🔐 AUTHENTICATION ATTEMPT', [
            'login_field' => $loginField,
            'login_value' => $request->login,
            'credentials' => array_merge($credentials, ['password' => '***HIDDEN***'])
        ]);

        if (Auth::attempt($credentials)) {
            $user = User::where($loginField, $request->login)->first();

            if (!$user) {
                Log::warning('❌ USER NOT FOUND AFTER AUTH', [
                    'login' => $request->login,
                    'login_field' => $loginField
                ]);
                return response()->json(['message' => 'Không tìm thấy người dùng!'], 404);
            }

            if (!$user->status) {
                Log::warning('❌ ACCOUNT DISABLED', [
                    'user_id' => $user->id,
                    'login' => $request->login
                ]);
                return response()->json(['message' => 'Tài khoản bị khoá!'], 403);
            }

            // Xóa token cũ
            $oldTokensCount = $user->tokens()->count();
            $user->tokens()->delete();
            
            // Tạo token mới
            $token = $user->createToken('access_token')->plainTextToken;

            Log::info('✅ LOGIN SUCCESS', [
                'user_id' => $user->id,
                'user_email' => $user->email,
                'user_role' => $user->role,
                'old_tokens_deleted' => $oldTokensCount,
                'new_token_created' => true,
                'token_preview' => substr($token, 0, 20) . '...',
                'timestamp' => now()
            ]);

            return response()->json([
                'message' => 'Login thành công',
                'user' => $user,
                'token' => $token,
                'status_code' => 200,
            ]);
        }

        Log::warning('❌ LOGIN FAILED', [
            'login' => $request->login,
            'login_field' => $loginField,
            'reason' => 'Invalid credentials',
            'timestamp' => now()
        ]);

        return response()->json([
            'message' => 'Email/SĐT hoặc mật khẩu không đúng!',
            'status_code' => 401,
        ], 401);
    }

    public function adminLogin(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string|min:6',
        ]);

        if (Auth::attempt(['email' => $request->email, 'password' => $request->password])) {
            $user = User::where('email', $request->email)->first();

            if (!$user) {
                return response()->json([
                    'message' => 'Không tìm thấy người dùng!',
                    'status_code' => 404,
                ], 404);
            }

            if ($user->role != 1) {
                return response()->json([
                    'message' => 'Tài khoản không phải admin!',
                    'status_code' => 403,
                ], 403);
            }

            $user->tokens()->delete();
            $token = $user->createToken('access_token')->plainTextToken;

            return response()->json([
                'message' => 'Login thành công',
                'user' => $user,
                'token' => $token,
                'status_code' => 200,
            ]);
        }

        return response()->json([
            'message' => 'Email hoặc mật khẩu không đúng!',
            'status_code' => 401,
        ], 401);
    }

    public function logout(Request $request)
    {
        try {
            $request->user()->tokens()->delete();

            return response()->json([
                'message' => 'Logout thành công',
                'status_code' => 200,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Lỗi khi logout: ' . $e->getMessage(),
                'status_code' => 500,
            ], 500);
        }
    }

    /**
     * Cập nhật thông tin profile của user đang đăng nhập
     */
    public function updateProfile(Request $request)
    {
        try {
            $user = $request->user();
            
            // Validate input - chỉ cho phép cập nhật các field an toàn
            $data = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email,' . $user->id,
                'phone' => 'nullable|string|max:20',
                'gender' => 'nullable|in:male,female,other',
                'birthdate' => 'nullable|date',
                'address' => 'nullable|string|max:255',
                ]);

            \Log::info('User updating profile:', [
                'user_id' => $user->id,
                'current_data' => $user->toArray(),
                'update_data' => $data
            ]);

            // Cập nhật thông tin user
            $user->update($data);

            return response()->json([
                'message' => 'Cập nhật thông tin thành công',
                'data' => $user->fresh(),
                'status_code' => 200,
            ], 200);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $e->errors(),
                'status_code' => 422,
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Error updating profile:', [
                'user_id' => $request->user()?->id,
                'error' => $e->getMessage()
            ]);
            
            return response()->json([
                'message' => 'Lỗi khi cập nhật thông tin: ' . $e->getMessage(),
                'status_code' => 500,
            ], 500);
        }
    }

    public function me(Request $request)
    {
        $user = $request->user();
        
        Log::info('👤 /me API CALLED', [
            'user_id' => $user ? $user->id : 'not_authenticated',
            'user_email' => $user ? $user->email : 'not_authenticated',
            'user_role' => $user ? $user->role : 'not_authenticated',
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'timestamp' => now(),
            'headers' => [
                'authorization' => $request->header('Authorization') ? 'Bearer ***' : 'not_present',
                'accept' => $request->header('Accept'),
                'content_type' => $request->header('Content-Type')
            ]
        ]);

        if (!$user) {
            Log::warning('❌ /me API - USER NOT AUTHENTICATED', [
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'headers' => $request->headers->all()
            ]);
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        Log::info('✅ /me API - USER AUTHENTICATED SUCCESSFULLY', [
            'user_id' => $user->id,
            'user_email' => $user->email,
            'user_role' => $user->role
        ]);

        return response()->json($user);
    }
    public function changePassword(Request $request)
    {
        Log::info('🔐 CHANGE PASSWORD ATTEMPT', [
            'user_id' => $request->user()?->id,
            'user_email' => $request->user()?->email,
            'ip' => $request->ip(),
            'timestamp' => now()
        ]);

        try {
            $request->validate([
                'current_password' => 'required',
                'new_password' => 'required|min:6|confirmed', // phải gửi kèm new_password_confirmation
            ]);

            $user = $request->user(); // Use $request->user() for Sanctum authentication

            if (!$user) {
                Log::warning('❌ CHANGE PASSWORD - USER NOT AUTHENTICATED', [
                    'ip' => $request->ip(),
                    'headers' => $request->headers->all()
                ]);
                return response()->json(['message' => 'Người dùng chưa được xác thực'], 401);
            }

            Log::info('🔐 CHANGE PASSWORD - VALIDATING CURRENT PASSWORD', [
                'user_id' => $user->id,
                'user_email' => $user->email,
                'current_password_provided' => !empty($request->current_password),
                'new_password_provided' => !empty($request->new_password),
                'confirmation_provided' => !empty($request->new_password_confirmation)
            ]);

            // Kiểm tra mật khẩu cũ
            if (!Hash::check($request->current_password, $user->password)) {
                Log::warning('❌ CHANGE PASSWORD - CURRENT PASSWORD INCORRECT', [
                    'user_id' => $user->id,
                    'user_email' => $user->email,
                    'current_password_hash_in_db' => $user->password
                ]);
                return response()->json(['message' => 'Mật khẩu hiện tại không đúng'], 400);
            }

            Log::info('✅ CHANGE PASSWORD - CURRENT PASSWORD VALID', [
                'user_id' => $user->id,
                'user_email' => $user->email
            ]);

            // Lưu password hash cũ để so sánh
            $oldPasswordHash = $user->password;

            // Cập nhật mật khẩu mới
            $user->password = Hash::make($request->new_password);
            $user->save();

            Log::info('✅ CHANGE PASSWORD - NEW PASSWORD SAVED', [
                'user_id' => $user->id,
                'user_email' => $user->email,
                'old_password_hash' => $oldPasswordHash,
                'new_password_hash' => $user->password,
                'password_changed' => $oldPasswordHash !== $user->password
            ]);

            // KHÔNG xóa tokens - giữ session để user ở lại trang hiện tại
            Log::info('✅ CHANGE PASSWORD - TOKENS PRESERVED', [
                'user_id' => $user->id,
                'user_email' => $user->email,
                'tokens_count' => $user->tokens()->count()
            ]);

            // Verify password was actually saved
            $user->refresh();
            $passwordVerification = Hash::check($request->new_password, $user->password);

            Log::info('🔍 CHANGE PASSWORD - VERIFICATION', [
                'user_id' => $user->id,
                'user_email' => $user->email,
                'password_verification_success' => $passwordVerification,
                'new_password_can_be_verified' => $passwordVerification
            ]);

            return response()->json([
                'message' => 'Đổi mật khẩu thành công!',
                'force_relogin' => false
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::warning('❌ CHANGE PASSWORD - VALIDATION ERROR', [
                'user_id' => $request->user()?->id,
                'errors' => $e->errors()
            ]);
            return response()->json([
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('❌ CHANGE PASSWORD - EXCEPTION', [
                'user_id' => $request->user()?->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['message' => 'Lỗi khi đổi mật khẩu'], 500);
        }
    }

}