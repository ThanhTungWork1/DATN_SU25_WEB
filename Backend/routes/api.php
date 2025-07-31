<?php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// --- API Controllers (Public & User) ---
use App\Http\Controllers\Api\AuthenticationController;
use App\Http\Controllers\Api\BannerController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\ColorController;
use App\Http\Controllers\Api\CommentController as ApiCommentController;
use App\Http\Controllers\Api\ComplaintController;
use App\Http\Controllers\Api\FavoriteController;
use App\Http\Controllers\Api\ForgotPasswordController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ProductVariantController;
use App\Http\Controllers\Api\SizeController;
use App\Http\Controllers\Api\VoucherController;

// --- ADMIN Controllers ---
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\CommentController as AdminCommentController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\UserController;

// --- Middleware ---
use App\Http\Middleware\CheckAdminMiddleware;
use App\Http\Middleware\CheckRole;
use Illuminate\Foundation\Auth\EmailVerificationRequest;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Test API
Route::get('test', fn() => response()->json(['status' => 'success'], 200));

// Forgot Password & Email Verification Routes
Route::post('/forgot-password/send-otp', [ForgotPasswordController::class, 'sendOtp']);
Route::post('/forgot-password/verify-otp', [ForgotPasswordController::class, 'verifyOtp']);
Route::post('/forgot-password/reset', [ForgotPasswordController::class, 'resetPassword']);
Route::post('/email/verification-notification', function (Request $request) {
    $request->user()->sendEmailVerificationNotification();
    return response()->json(['message' => 'Đã gửi lại email xác minh']);
})->middleware(['auth:sanctum', 'throttle:6,1']);
Route::get('/email/verify/{id}/{hash}', function ($id, Request $request) {
    $user = \App\Models\User::findOrFail($id);
    if (!hash_equals((string) $request->route('hash'), sha1($user->getEmailForVerification()))) {
        return response()->json(['message' => 'Link xác minh không hợp lệ'], 400);
    }
    if (!$user->hasVerifiedEmail()) {
        $user->markEmailAsVerified();
    }
    return response()->json(['message' => 'Xác minh email thành công']);
})->middleware(['auth:sanctum', 'signed'])->name('verification.verify');

// Public Routes (Không cần xác thực)
Route::get('/categories', [CategoryController::class, 'index']); // Public API để lấy danh sách danh mục
Route::get('/colors', [ColorController::class, 'index']);
Route::get('/sizes', [SizeController::class, 'index']);
Route::get('/banners', [BannerController::class, 'index']);
Route::get('/product-variants/{product_id}', [ProductVariantController::class, 'byProduct']);
Route::get('/comments/product/{product_id}', [ApiCommentController::class, 'getByProduct']);

// Authentication Routes
Route::post('/register', [AuthenticationController::class, 'register']);
Route::post('/login', [AuthenticationController::class, 'login']);
Route::post('/admin/login', [AuthenticationController::class, 'adminLogin']);
Route::post('/logout', [AuthenticationController::class, 'logout'])->middleware('auth:sanctum');

// ====================================================================
// ADMIN ROUTES (Gộp tất cả vào một nhóm được bảo vệ)
// ====================================================================
Route::prefix('admin')/*->middleware(['auth:sanctum', CheckAdminMiddleware::class])*/->group(function () {
    // Products
    Route::apiResource('products', ProductController::class)->except(['store', 'update']);
    Route::post('products', [ProductController::class, 'store']);
    Route::post('products/{id}', [ProductController::class, 'update']);

    // Orders
    Route::apiResource('orders', OrderController::class);

    // Categories
    Route::apiResource('categories', CategoryController::class);

    // Comments / Reviews
    Route::get('comments', [AdminCommentController::class, 'index']);
    Route::put('comments/{id}/status', [AdminCommentController::class, 'updateStatus']);
    Route::delete('comments/{id}', [AdminCommentController::class, 'destroy']);

    // Users
    Route::apiResource('users', UserController::class);

    // Dashboard & Vouchers
    Route::get('dashboard', [DashboardController::class, 'index']);
    Route::get('vouchers', [VoucherController::class, 'index']);
    Route::get('vouchers/{code}', [VoucherController::class, 'show']);
});



// Authenticated User Routes (Yêu cầu xác thực)
Route::middleware(['auth:sanctum'])->group(function () {
    Route::prefix('product')->group(function () {
        Route::get('/', [ProductController::class, 'index']);
        Route::get('/search', [ProductController::class, 'search']);
        Route::get('/featured', [ProductController::class, 'featured']);
        Route::get('/category/{categoryId}', [ProductController::class, 'byCategory']);
        Route::get('/{id}', [ProductController::class, 'show']);
    });

    Route::prefix('favorites')->group(function () {
        Route::get('/', [FavoriteController::class, 'index']);
        Route::post('/{product_id}', [FavoriteController::class, 'toggle']);
    });

    Route::prefix('order')->group(function () {
        Route::get('/', [OrderController::class, 'index']);
        Route::get('/{id}', [OrderController::class, 'show']);
        Route::post('add', [OrderController::class, 'store']);
        Route::put('update/{id}', [OrderController::class, 'update']);
        Route::delete('delete/{id}', [OrderController::class, 'destroy']);
    });

    Route::apiResource('/cart', CartController::class);
    Route::post('/comments', [ApiCommentController::class, 'store']);
    Route::post('/complaints', [ComplaintController::class, 'store']);
    Route::get('/notifications', [NotificationController::class, 'index']);
});