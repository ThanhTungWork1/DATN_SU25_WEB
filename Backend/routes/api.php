<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthenticationController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Client\ProductController as ClientProductController;
use App\Http\Controllers\Client\CategoryController as ClientCategoryController;
use App\Http\Controllers\Client\CartController as ClientCartController;
use App\Http\Controllers\Client\OrderController as ClientOrderController;

Route::get('test', function () {
    return response()->json([
        'status' => 'success',
    ], 200);
});

// Client routes (không cần authentication)
Route::prefix('client')->group(function () {
    // Product routes
    Route::get('/products', [ClientProductController::class, 'index']);
    Route::get('/products/{id}', [ClientProductController::class, 'show']);
    Route::get('/search', [ClientProductController::class, 'search']);
    Route::get('/filter', [ClientProductController::class, 'filter']);
    Route::get('/category/{categoryId}/products', [ClientProductController::class, 'getByCategory']);

    // Category routes
    Route::get('/categories', [ClientCategoryController::class, 'index']);
    Route::get('/categories/{id}', [ClientCategoryController::class, 'show']);
});

// Client routes (cần authentication)
Route::middleware('auth:sanctum')->prefix('client')->group(function () {
    // Cart routes
    Route::get('/cart', [ClientCartController::class, 'index']);
    Route::post('/cart', [ClientCartController::class, 'store']);
    Route::put('/cart/{productId}', [ClientCartController::class, 'update']);
    Route::delete('/cart/{productId}', [ClientCartController::class, 'destroy']);
    Route::delete('/cart', [ClientCartController::class, 'clear']);

    // Order routes
    Route::get('/orders', [ClientOrderController::class, 'index']);
    Route::get('/orders/{orderId}', [ClientOrderController::class, 'show']);
    Route::post('/orders', [ClientOrderController::class, 'store']);
    Route::put('/orders/{orderId}/cancel', [ClientOrderController::class, 'cancel']);
});

// Auth routes
Route::post('/login', [AuthenticationController::class, 'postLogin']);
Route::post('/logout', [AuthenticationController::class, 'postLogout'])->middleware('auth:sanctum');

// Protected routes
Route::middleware('auth:sanctum')->group(function () {

    Route::prefix("product")->group(function () {
        Route::get('/', [ProductController::class, 'index']);
        Route::get('/{id}', [ProductController::class, 'show']);
        Route::post('add', [ProductController::class, 'add']);
        Route::put('update/{id}', [ProductController::class, 'update']);
        Route::delete('delete/{id}', [ProductController::class, 'destroy']);
    });

    Route::prefix('category')->group(function () {
        Route::get('/', [CategoryController::class, 'index']);
        Route::get('/{id}', [CategoryController::class, 'show']);
    });

    Route::prefix('order')->group(function () {
        Route::get('/', [OrderController::class, 'index']);
        Route::get('/{id}', [OrderController::class, 'show']);
        Route::post('add', [OrderController::class, 'add']);
        Route::put('update/{id}', [OrderController::class, 'update']);
        Route::delete('delete/{id}', [OrderController::class, 'destroy']);
    });

    Route::prefix('user')->group(function () {
        Route::get('/', [UserController::class, 'index']);
        Route::get('/{id}', [UserController::class, 'show']);
        Route::post('add', [UserController::class, 'add']);
        Route::put('update/{id}', [UserController::class, 'update']);
        Route::delete('delete/{id}', [UserController::class, 'destroy']);
    });

    Route::get('/dashboard', [DashboardController::class, 'index']);
});
