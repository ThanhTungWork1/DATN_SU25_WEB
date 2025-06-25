<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthenticationController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\UserController;
use App\Http\Middleware\CheckAdminMiddleware;
use App\Http\Middleware\CheckRole;
use App\Http\Controllers\Api\CartController;

// Kiểm tra API hoạt động
Route::get('test', fn() => response()->json(['status' => 'success'], 200));

// Auth
Route::post('/login', [AuthenticationController::class, 'postLogin']);
Route::post('/logout', [AuthenticationController::class, 'postLogout'])->middleware('auth:sanctum');

// ADMIN routes (quản trị)
Route::prefix('admin')->middleware(['auth:sanctum', CheckAdminMiddleware::class])->group(function () {
    Route::apiResource('users', UserController::class);
    Route::apiResource('products', ProductController::class);
    Route::apiResource('orders', OrderController::class);
    Route::get('dashboard', [DashboardController::class, 'index']);
});

// USER routes (khách hàng)
Route::middleware(['auth:sanctum'])->group(function () {

    // Categories - cho user
    Route::prefix('category')->group(function () {
        Route::get('/', [CategoryController::class, 'index']);
        Route::get('/with-products', [CategoryController::class, 'withProducts']);
        Route::get('/{id}', [CategoryController::class, 'show']);
    });

    // Products - cho user
    Route::prefix('product')->group(function () {
        Route::get('/', [ProductController::class, 'index']);
        Route::get('/search', [ProductController::class, 'search']); // API tìm kiếm và lọc
        Route::get('/featured', [ProductController::class, 'featured']); // Sản phẩm nổi bật
        Route::get('/category/{categoryId}', [ProductController::class, 'byCategory']); // Sản phẩm theo danh mục
        Route::get('/{id}', [ProductController::class, 'show']);
    });

    // Orders - cho user
    Route::prefix('order')->group(function () {
        Route::get('/', [OrderController::class, 'index']);
        Route::get('/{id}', [OrderController::class, 'show']);
        Route::post('add', [OrderController::class, 'store']); // ⚠ nếu controller tên là `store`, không phải `add`
        Route::put('update/{id}', [OrderController::class, 'update']);
        Route::delete('delete/{id}', [OrderController::class, 'destroy']);
    });

    // Users - chỉ cho admin role = 1
    Route::prefix('user')->middleware(CheckRole::class . ':1')->group(function () {
        Route::get('/', [UserController::class, 'index']);
        Route::get('/{id}', [UserController::class, 'show']);
        Route::post('add', [UserController::class, 'store']); // ⚠ tên hàm controller phải đúng
        Route::put('update/{id}', [UserController::class, 'update']);
        Route::delete('delete/{id}', [UserController::class, 'destroy']);
    });

    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Cart API (client)
    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart/add', [CartController::class, 'add']);
    Route::put('/cart/update', [CartController::class, 'update']);
    Route::delete('/cart/remove', [CartController::class, 'remove']);
});
