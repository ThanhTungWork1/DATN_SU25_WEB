<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthenticationController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\DashboardController;

Route::get('test', function () {
    return response()->json([
        'status' => 'success',
    ], 200);
});

// Auth
Route::post('/login', [AuthenticationController::class, 'postLogin']);
Route::post('/logout', [AuthenticationController::class, 'postLogout'])->middleware('auth:sanctum');




// Protected routes
Route::middleware('auth:sanctum')->group(function () {

    Route::prefix("product")->group(function () {
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
    // Voucher routes
    Route::prefix('vouchers')->group(function () {
        Route::get('/', [VoucherController::class, 'index']);
        Route::get('/{code}', [VoucherController::class, 'show']);
    });

    // Payment routes
    Route::prefix('payments')->group(function () {
        Route::get('/{order_id}', [PaymentController::class, 'show']);
        Route::post('/', [PaymentController::class, 'store']);
    });

    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Cart API (client)
    Route::apiResource('/cart', CartController::class);
});
