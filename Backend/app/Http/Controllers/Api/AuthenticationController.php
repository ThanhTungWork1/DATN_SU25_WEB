<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Controller;



class AuthenticationController extends Controller
{
    public function postLogout(Request $request)
    {
        $request->user()->tokens()->delete();
        return response()->json([
            'message' => 'Logout successful',
            'status_code' => 200
        ], 200);
    }
    public function postLogin(Request $req)
    {

        if (
            Auth::attempt([
                'email' => $req->email,
                'password' => $req->password,
            ])
        ) {

            $user = Auth::user();

            if ($user->role == 1) {
                DB::table('personal_access_tokens')->where('tokenable_id', Auth::id())->delete();
                $token = User::find(Auth::id())->createToken('access_token')->plainTextToken;
                return response()->json([
                    'token' => $token,
                    'message' => 'Login successful',
                    'status_code' => 200
                ], 200);
            }
        }
        return response()->json([
            'message' => 'Tài khoản của bạn không có quyền truy cập!'
        ], 403);

    }
}
