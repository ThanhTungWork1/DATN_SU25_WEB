<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class AuthenticationController extends Controller
{
    public function postLogin(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        if (Auth::attempt(['email' => $request->email, 'password' => $request->password])) {
            $user = $request->user();

            if ($user->role == 1) {
                $user->tokens()->delete();
                $token = $user->createToken('access_token')->plainTextToken;

                return response()->json([
                    'token' => $token,
                    'user' => $user,
                    'message' => 'Login successful',
                    'status_code' => 200
                ], 200);
            }

            return response()->json(['message' => 'Tài khoản không có quyền truy cập!'], 403);
        }

        return response()->json(['message' => 'Email hoặc mật khẩu không đúng!'], 401);
    }

    public function postLogout(Request $request)
    {
        $request->user()->tokens()->delete();

        return response()->json([
            'message' => 'Logout successful',
            'status_code' => 200
        ], 200);
    }
}
