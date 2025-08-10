<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;

// --- API Controllers (Public & User) ---
use App\Http\Controllers\Api\AuthenticationController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\InventoryController;
use App\Http\Controllers\Api\VoucherController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\ComplaintController;
use App\Http\Controllers\Api\CommentController;
use App\Http\Controllers\Api\BannerController;
use App\Http\Controllers\Api\ClientOrderController;
use App\Http\Controllers\Api\SizeController;
use App\Http\Controllers\Api\ColorController;
use App\Http\Controllers\Api\CommentController as ApiCommentController;
use App\Http\Controllers\Api\FavoriteController;
use App\Http\Controllers\Api\ForgotPasswordController;
use App\Http\Controllers\Api\ProductVariantController;
use App\Http\Controllers\Admin\CommentController as AdminCommentController;
use App\Http\Middleware\CheckAdminMiddleware;
use App\Http\Middleware\CheckRole;
use App\Http\Controllers\Api\ContactController;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use App\Http\Controllers\Api\ChatbotController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// ====================================================================
// PUBLIC ROUTES (No Authentication Required)
// ====================================================================

// Test API
Route::get('test', fn() => response()->json(['status' => 'success'], 200));

// Chat
Route::post('/chatbot', [ChatbotController::class, 'handle']);

// --- Authentication ---
Route::post('/register', [AuthenticationController::class, 'register']);
Route::post('/login', [AuthenticationController::class, 'login']);
Route::post('/admin/login', [AuthenticationController::class, 'adminLogin']);

// --- Password Reset ---
Route::post('/forgot-password/send-otp', [ForgotPasswordController::class, 'sendOtp']);
Route::post('/forgot-password/verify-otp', [ForgotPasswordController::class, 'verifyOtp']);
Route::post('/forgot-password/reset', [ForgotPasswordController::class, 'resetPassword']);

// --- Top Selling Products ---
Route::get('/top-selling-products', [\App\Http\Controllers\Api\ProductController::class, 'topSellingProducts']);

// --- Public Data ---
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{id}', [CategoryController::class, 'show']);
Route::get('/colors', [ColorController::class, 'index']);
Route::get('/sizes', [SizeController::class, 'index']);
Route::get('/banners', [BannerController::class, 'index']);
Route::get('/product-variants/{product_id}', [ProductVariantController::class, 'byProduct']);
Route::get('/comments/product/{product_id}', [ApiCommentController::class, 'getByProduct']);

// --- Products (Public Access) ---
Route::prefix('product')->group(function () {
    Route::get('/test', [\App\Http\Controllers\Api\ProductController::class, 'test']);
    Route::get('/debug/{id}', [\App\Http\Controllers\Api\ProductController::class, 'debug']);
    Route::get('/detail/{id}', [\App\Http\Controllers\Api\ProductController::class, 'debug']);
    Route::get('/', [\App\Http\Controllers\Api\ProductController::class, 'index']);
    Route::get('/search', [\App\Http\Controllers\Api\ProductController::class, 'search']);
    Route::get('/featured', [\App\Http\Controllers\Api\ProductController::class, 'featured']);
    Route::get('/category/{categoryId}', [\App\Http\Controllers\Api\ProductController::class, 'byCategory']);
    Route::get('/{id}', [\App\Http\Controllers\Api\ProductController::class, 'showProduct']);
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

    Route::get('/email/verify/{id}/{hash}', function ($id, Request $request) {
        $user = \App\Models\User::findOrFail($id);
        if (!hash_equals((string) $request->route('hash'), sha1($user->getEmailForVerification()))) {
            return response()->json(['message' => 'Link xác minh không hợp lệ'], 400);
        }
        if (!$user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();
        }
        return response()->json(['message' => 'Xác minh email thành công']);
    })->middleware(['signed'])->name('verification.verify');

    // --- Cart Management ---
    Route::apiResource('/cart', CartController::class)->except(['update']);
    Route::put('/cart-item/{id}', [CartController::class, 'updateCartItem']);
    Route::delete('/cart-item/{id}', [CartController::class, 'removeCartItem']);
    Route::delete('/cart', [CartController::class, 'clearCart']);
    
    // --- Favorites, Comments, Complaints, Notifications ---
    Route::apiResource('favorites', FavoriteController::class)->only(['index', 'store', 'destroy']);
    Route::post('/comments', [ApiCommentController::class, 'store']);
    Route::get('/review-eligibility/{product_id}', [ApiCommentController::class, 'checkEligibility']);
    Route::post('/complaints', [ComplaintController::class, 'store']);
    Route::get('/notifications', [NotificationController::class, 'index']);
    
    // --- User Orders ---
    Route::apiResource('client/orders', ClientOrderController::class);
    Route::get('client/orders/statistics', [ClientOrderController::class, 'statistics']);
    Route::get('client/orders/status/{status}', [ClientOrderController::class, 'getByStatus']);

    // --- Vouchers ---
    Route::prefix('vouchers')->group(function () {
        Route::get('/', [VoucherController::class, 'index']);
        Route::get('/{code}', [VoucherController::class, 'show']);
        Route::post('/validate', [VoucherController::class, 'validateVoucher']);
        Route::get('/available/list', [VoucherController::class, 'getAvailableVouchers']);
    });

    // --- Payments ---
    Route::prefix('payments')->group(function () {
        Route::get('/{order_id}', [PaymentController::class, 'show']);
        Route::post('/', [PaymentController::class, 'store']);
    });
});

// ====================================================================
// ADMIN ROUTES (Require Login + Admin Role)
// ====================================================================
Route::prefix('admin')->middleware(['auth:sanctum', CheckAdminMiddleware::class])->group(function () {
    
    // --- Dashboard ---
    Route::get('dashboard', [DashboardController::class, 'index']);
    Route::prefix('dashboard')->group(function () {
        Route::get('/revenue-by-time', [DashboardController::class, 'revenueByTime']);
        Route::get('/orders-by-status', [DashboardController::class, 'ordersByStatus']);
        Route::get('/top-selling-products', [DashboardController::class, 'topSellingProducts']);
        Route::get('/recent-orders', [DashboardController::class, 'recentOrders']);
        Route::get('/recent-users', [DashboardController::class, 'recentUsers']);
        Route::get('/users-by-month', [DashboardController::class, 'usersByMonth']);
        Route::get('/user-growth', [DashboardController::class, 'userGrowth']);
        Route::get('/rating-stats', [DashboardController::class, 'ratingStats']);
        Route::get('/recent-reviews', [DashboardController::class, 'recentReviews']);
        Route::get('/low-stock-products', [DashboardController::class, 'lowStockProducts']);
        Route::get('/all-stats', [DashboardController::class, 'allStats']);
    });
    
    // --- Resource Management ---
    Route::apiResource('products', ProductController::class);
    Route::apiResource('categories', CategoryController::class);
    Route::apiResource('users', UserController::class);
    Route::apiResource('banners', \App\Http\Controllers\Admin\BannerController::class);

    // --- Order Management ---
    Route::get('orders/statistics', [OrderController::class, 'getOrderStatistics']);
    Route::get('orders/export', [OrderController::class, 'export']);
    Route::apiResource('orders', OrderController::class);

    // --- Comments ---
    Route::get('comments', [AdminCommentController::class, 'index']);
    Route::put('comments/{id}/status', [AdminCommentController::class, 'updateStatus']);
    Route::delete('comments/{id}', [AdminCommentController::class, 'destroy']);

    // --- Contacts ---
    Route::get('contacts', [ContactController::class, 'index']);
    Route::patch('contacts/{id}/status', [ContactController::class, 'updateStatus']);
    Route::post('contacts/{id}/reply', [ContactController::class, 'reply']);

    // --- Inventory ---
    Route::prefix('inventory')->group(function () {
        Route::get('/stats', [InventoryController::class, 'stats']);
        Route::get('/list', [InventoryController::class, 'list']);
        Route::get('/low-stock-alerts', [InventoryController::class, 'lowStockAlerts']);
        Route::post('/update-stock-for-order', [InventoryController::class, 'updateStockForOrder']);
    });

    // --- Voucher Management ---
    Route::apiResource('vouchers', \App\Http\Controllers\Admin\VoucherController::class);
    Route::get('vouchers/statistics', [\App\Http\Controllers\Admin\VoucherController::class, 'statistics']);
    Route::get('vouchers/{id}/usage', [\App\Http\Controllers\Admin\VoucherController::class, 'usageDetails']);
    Route::patch('vouchers/{id}/toggle', [\App\Http\Controllers\Admin\VoucherController::class, 'toggle']);
});