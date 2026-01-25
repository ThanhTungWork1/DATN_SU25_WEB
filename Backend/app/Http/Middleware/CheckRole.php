<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Log;

class CheckRole
{
    public function handle(Request $request, Closure $next, $role): Response
    {
        Log::info('🔒 CHECK ROLE MIDDLEWARE', [
            'url' => $request->fullUrl(),
            'method' => $request->method(),
            'required_role' => $role,
            'user_authenticated' => auth()->check(),
            'user_role' => auth()->check() ? auth()->user()->role : 'not_authenticated',
            'user_id' => auth()->check() ? auth()->user()->id : 'not_authenticated',
            'ip' => $request->ip(),
            'timestamp' => now()
        ]);

        if (auth()->check() && auth()->user()->role == $role) {
            Log::info('✅ ROLE CHECK PASSED', [
                'url' => $request->fullUrl(),
                'user_id' => auth()->user()->id,
                'user_role' => auth()->user()->role,
                'required_role' => $role
            ]);
            return $next($request);
        }

        Log::warning('❌ ROLE CHECK FAILED', [
            'url' => $request->fullUrl(),
            'user_authenticated' => auth()->check(),
            'user_role' => auth()->check() ? auth()->user()->role : 'not_authenticated',
            'required_role' => $role,
            'ip' => $request->ip()
        ]);

        return response()->json(['message' => 'Không đủ quyền truy cập'], 403);
    }
}
