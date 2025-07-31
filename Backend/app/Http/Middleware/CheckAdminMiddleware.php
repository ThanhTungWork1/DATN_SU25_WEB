<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckAdminMiddleware
{
   public function handle(Request $request, Closure $next): Response
{
    $user = $request->user();

    // Chấp nhận cả role là số 1 hoặc chuỗi 'admin'
    if ($user && ($user->role == 1 || $user->role === 'admin')) {
        return $next($request);
    }

    return response()->json(['message' => 'Bạn không có quyền truy cập!'], 403);
}
}
