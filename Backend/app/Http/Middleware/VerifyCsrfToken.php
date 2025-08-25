<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as Middleware;

class VerifyCsrfToken extends Middleware
{
    /**
     * The URIs that should be excluded from CSRF verification.
     *
     * @var array<int, string>
     */
    protected $except = [
        '*',  // Disable CSRF for all routes
    ];
    
    // Skip CSRF token verification for all requests
    public function handle($request, \Closure $next)
    {
        return $next($request);
    }
}
