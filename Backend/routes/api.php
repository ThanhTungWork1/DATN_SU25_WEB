<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;

// --- API Controllers (Public & User) ---
use App\Http\Controllers\Api\AuthenticationController;
use App\Http\Controllers\Api\BannerController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\ColorController;
use App\Http\Controllers\Api\CommentController as ApiCommentController;
use App\Http\Controllers\Api\ComplaintController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\FavoriteController;
use App\Http\Controllers\Api\ForgotPasswordController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\ProductVariantController;
use App\Http\Controllers\Api\SizeController;
use App\Http\Controllers\Api\ClientOrderController;

// --- ADMIN Controllers ---
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\CommentController as AdminCommentController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\UserController;

// --- Middleware ---
use App\Http\Middleware\CheckAdminMiddleware;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// ====================================================================
// PUBLIC ROUTES (No Authentication Required)
// ====================================================================

// --- Authentication ---
Route::post('/register', [AuthenticationController::class, 'register']);
Route::post('/login', [AuthenticationController::class, 'login']);
Route::post('/admin/login', [AuthenticationController::class, 'adminLogin']);

// --- Password Reset ---
Route::post('/forgot-password/send-otp', [ForgotPasswordController::class, 'sendOtp']);
Route::post('/forgot-password/verify-otp', [ForgotPasswordController::class, 'verifyOtp']);
Route::post('/forgot-password/reset', [ForgotPasswordController::class, 'resetPassword']);

// --- Public Data ---
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{id}', [CategoryController::class, 'show']);
Route::get('/colors', [ColorController::class, 'index']);
Route::get('/sizes', [SizeController::class, 'index']);
Route::get('/banners', [BannerController::class, 'index']);
Route::get('/product-variants/{product_id}', [ProductVariantController::class, 'byProduct']);
Route::get('/comments/product/{product_id}', [ApiCommentController::class, 'getByProduct']);
Route::get('/top-selling-products', [\App\Http\Controllers\Api\ProductController::class, 'topSellingProducts']);

// --- Products (Public Access) ---
Route::prefix('product')->group(function () {
    Route::get('/', [\App\Http\Controllers\Api\ProductController::class, 'index']);
    Route::get('/search', [\App\Http\Controllers\Api\ProductController::class, 'search']);
    Route::get('/featured', [\App\Http\Controllers\Api\ProductController::class, 'featured']);
    Route::get('/category/{categoryId}', [\App\Http\Controllers\Api\ProductController::class, 'byCategory']);
    Route::get('/{id}', [\App\Http\Controllers\Api\ProductController::class, 'show']);
});

// --- Contact Form ---
Route::post('/contact', [ContactController::class, 'store']);


// ====================================================================
// AUTHENTICATED USER ROUTES (Require Login)
// ====================================================================
Route::middleware(['auth:sanctum'])->group(function () {
    
    // --- General Authenticated User Info ---
    Route::post('/logout', [AuthenticationController::class, 'logout']);
    Route::get('/me', fn(Request $request) => response()->json($request->user()));
    Route::put('/me', [AuthenticationController::class, 'updateProfile']);

    // --- Email Verification ---
    Route::post('/email/verification-notification', function (Request $request) {
        $request->user()->sendEmailVerificationNotification();
        return response()->json(['message' => 'Đã gửi lại email xác minh']);
    })->middleware('throttle:6,1');

    // --- Cart Management ---
    Route::apiResource('/cart', CartController::class)->except(['update']); // `apiResource` handles index, store, show, destroy
    Route::put('/cart-item/{id}', [CartController::class, 'updateCartItem']); // Specific route for updating quantity
    Route::delete('/cart-item/{id}', [CartController::class, 'removeCartItem']); // Specific route for removing an item
    Route::delete('/cart', [CartController::class, 'clearCart']); // Overwrite the destroy from apiResource to have a clear name
    
    // --- Favorites, Comments, Complaints, Notifications ---
    Route::apiResource('favorites', FavoriteController::class)->only(['index', 'store', 'destroy']);
    Route::post('/comments', [ApiCommentController::class, 'store']);
    Route::post('/complaints', [ComplaintController::class, 'store']);
    Route::get('/notifications', [NotificationController::class, 'index']);
    
    // --- User Orders ---
    Route::apiResource('client/orders', ClientOrderController::class);
    Route::get('client/orders/statistics', [ClientOrderController::class, 'statistics']);
    Route::get('client/orders/status/{status}', [ClientOrderController::class, 'getByStatus']);
});


// ====================================================================
// ADMIN ROUTES (Require Login + Admin Role)
// ====================================================================
Route::prefix('admin')->middleware(['auth:sanctum', CheckAdminMiddleware::class])->group(function () {
    
    Route::get('dashboard', [DashboardController::class, 'index']);
    
    // --- Resource Management ---
    Route::apiResource('products', ProductController::class);
    Route::apiResource('orders', AdminOrderController::class);
    Route::apiResource('categories', CategoryController::class);
    Route::apiResource('users', UserController::class);

    // --- Comments ---
    Route::get('comments', [AdminCommentController::class, 'index']);
    Route::put('comments/{id}/status', [AdminCommentController::class, 'updateStatus']);
    Route::delete('comments/{id}', [AdminCommentController::class, 'destroy']);

    // --- Vouchers & Contacts ---
    // Route::get('vouchers', [VoucherController::class, 'index']);
    // Route::get('vouchers/{code}', [VoucherController::class, 'show']);
    Route::get('contacts', [ContactController::class, 'index']);
    Route::patch('contacts/{id}/status', [ContactController::class, 'updateStatus']);
    Route::post('contacts/{id}/reply', [ContactController::class, 'reply']);
});