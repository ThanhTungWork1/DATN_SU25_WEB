<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthenticationController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\UserController;


use App\Http\Controllers\Api\VoucherController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\CartController;
use App\Http\Middleware\CheckAdminMiddleware;
use App\Http\Middleware\CheckRole;

// Kiểm tra API hoạt động
Route::get('test', fn() => response()->json(['status' => 'success'], 200));

// Auth
Route::post('/login', [AuthenticationController::class, 'postLogin']);
Route::post('/logout', [AuthenticationController::class, 'postLogout'])->middleware('auth:sanctum');

// ===========================
// ✅ ADMIN routes (quản trị)
// ===========================
Route::prefix('admin')->middleware(['auth:sanctum', CheckAdminMiddleware::class])->group(function () {
    Route::apiResource('users', UserController::class);
    Route::apiResource('products', ProductController::class);
    Route::apiResource('orders', OrderController::class);
    Route::get('dashboard', [DashboardController::class, 'index']);

    // ✅ (Tuỳ chọn) Nếu muốn admin quản lý voucher:
    Route::get('vouchers', [VoucherController::class, 'index']);
    Route::get('vouchers/{code}', [VoucherController::class, 'show']);
});

// ===========================
// ✅ USER routes (khách hàng)
// ===========================
Route::middleware(['auth:sanctum'])->group(function () {

    // ✅ Products - cho user
    Route::prefix('product')->group(function () {
        Route::get('/', [ProductController::class, 'index']);
        Route::get('/search', [ProductController::class, 'search']);       // mới
        Route::get('/featured', [ProductController::class, 'featured']);   // mới
        Route::get('/category/{categoryId}', [ProductController::class, 'byCategory']); // mới
        Route::get('/{id}', [ProductController::class, 'show']);
    });
    // ✅ Favorites - sản phẩm yêu thích
    Route::prefix('favorites')->group(function () {
        Route::get('/', [\App\Http\Controllers\Api\FavoriteController::class, 'index']); // lấy danh sách sp yêu thích
        Route::post('/{product_id}', [\App\Http\Controllers\Api\FavoriteController::class, 'toggle']); // toggle yêu thích
    });

    // ✅ Orders - cho user
    Route::prefix('order')->group(function () {
        Route::get('/', [OrderController::class, 'index']);
        Route::get('/{id}', [OrderController::class, 'show']);
        Route::post('add', [OrderController::class, 'store']); // ⚠ nếu controller tên là `store`
        Route::put('update/{id}', [OrderController::class, 'update']);
        Route::delete('delete/{id}', [OrderController::class, 'destroy']);
    });

    // ✅ Users - chỉ cho admin (role = 1)
    Route::prefix('user')->middleware(CheckRole::class . ':1')->group(function () {
        Route::get('/', [UserController::class, 'index']);
        Route::get('/{id}', [UserController::class, 'show']);
        Route::post('add', [UserController::class, 'store']);
        Route::put('update/{id}', [UserController::class, 'update']);
        Route::delete('delete/{id}', [UserController::class, 'destroy']);
    });

    // ✅ Voucher routes
    Route::prefix('vouchers')->group(function () {
        Route::get('/', [VoucherController::class, 'index']);
        Route::get('/{code}', [VoucherController::class, 'show']);
    });

    // ✅ Payment routes
    Route::prefix('payments')->group(function () {
        Route::get('/{order_id}', [PaymentController::class, 'show']);
        Route::post('/', [PaymentController::class, 'store']);
    });


    Route::apiResource('/cart', CartController::class);


    Route::get('/dashboard', [DashboardController::class, 'index']);

});
