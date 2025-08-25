<?php

use Illuminate\Foundation\Application;
use App\Http\Middleware\CheckAdminMiddleware;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            // 'role' => \App\Http\Middleware\RoleMiddleware::class,
            // 'verify' => \App\Http\Middleware\VerifyCustomMiddleware::class,
            // 'verify-register' => \App\Http\Middleware\RegisterMiddleware::class,
            // 'verify-register2' => \App\Http\Middleware\Register2Middleware::class,
            'checkAdmin' => CheckAdminMiddleware::class, // 
        ]);
        // Thêm CORS middleware trước để xử lý preflight requests
        $middleware->prepend(\App\Http\Middleware\CorsMiddleware::class);
        
        $middleware->api(prepend: [
            EnsureFrontendRequestsAreStateful::class, // Thêm Sanctum middleware
        ]);
        
    })

    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
