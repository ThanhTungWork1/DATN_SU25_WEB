<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class CustomAuthMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        // Debug information
        Log::info('CustomAuthMiddleware - Request details:', [
            'url' => $request->url(),
            'method' => $request->method(),
            'bearer_token' => $request->bearerToken() ? 'present' : 'missing',
            'auth_header' => $request->header('Authorization'),
            'all_headers' => $request->headers->all()
        ]);

        // Try to authenticate with Sanctum
        $user = Auth::guard('sanctum')->user();
        
        if (!$user) {
            Log::warning('CustomAuthMiddleware - Authentication failed:', [
                'bearer_token' => $request->bearerToken(),
                'auth_header' => $request->header('Authorization')
            ]);
            
            return response()->json([
                'message' => 'Vui lòng đăng nhập để tiếp tục!',
                'error' => 'Unauthorized',
                'debug_info' => [
                    'bearer_token_present' => $request->bearerToken() ? true : false,
                    'auth_header_present' => $request->header('Authorization') ? true : false,
                    'suggestion' => 'Đảm bảo gửi token trong header Authorization: Bearer {your_token}'
                ]
            ], 401);
        }

        Log::info('CustomAuthMiddleware - Authentication successful:', [
            'user_id' => $user->id,
            'user_name' => $user->name
        ]);

        // Set the authenticated user
        Auth::setUser($user);
        
        return $next($request);
    }
}
