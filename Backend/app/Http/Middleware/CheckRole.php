<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    public function handle(Request $request, Closure $next, $role): Response
    {
        if (auth()->check() && auth()->user()->role == $role) {
            return $next($request);
        }
        return response()->json(['message' => 'Không đủ quyền truy cập'], 403);
    }
}
