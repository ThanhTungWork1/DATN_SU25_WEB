<?php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthenticationController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\UserController;
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
use App\Http\Controllers\Api\FavoriteController;
use App\Http\Controllers\Api\ProductVariantController;
use App\Http\Middleware\CheckAdminMiddleware;
use App\Http\Controllers\Api\ForgotPasswordController;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use App\Http\Middleware\CheckRole;
use App\Http\Controllers\Api\ContactController;

// Test API
Route::get('test', fn() => response()->json(['status' => 'success'], 200));

// Forgot Password
Route::post('/forgot-password/send-otp', [ForgotPasswordController::class, 'sendOtp']);
Route::post('/forgot-password/verify-otp', [ForgotPasswordController::class, 'verifyOtp']);
Route::post('/forgot-password/reset', [ForgotPasswordController::class, 'resetPassword']);
Route::get('/top-selling-products', [\App\Http\Controllers\Api\ProductController::class, 'topSellingProducts']);

// Email Verification
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

// -------------------- Public Routes --------------------

Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{id}', [CategoryController::class, 'show']);
Route::get('/colors', [ColorController::class, 'index']);
Route::get('/sizes', [SizeController::class, 'index']);
Route::get('/banners', [BannerController::class, 'index']);
Route::get('/product-variants/{product_id}', [ProductVariantController::class, 'byProduct']);
Route::get('/comments/product/{product_id}', [CommentController::class, 'getByProduct']);

// Cho phép truy cập sản phẩm không cần token (sửa tại đây)
Route::prefix('product')->group(function () {
    Route::get('/', [\App\Http\Controllers\Api\ProductController::class, 'index']);
    Route::get('/search', [\App\Http\Controllers\Api\ProductController::class, 'search']);
    Route::get('/featured', [\App\Http\Controllers\Api\ProductController::class, 'featured']);
    Route::get('/category/{categoryId}', [\App\Http\Controllers\Api\ProductController::class, 'byCategory']);
    Route::get('/{id}', [\App\Http\Controllers\Api\ProductController::class, 'show']);
});

// Authentication
Route::post('/register', [AuthenticationController::class, 'register']);
Route::post('/login', [AuthenticationController::class, 'login']);
Route::post('/admin/login', [AuthenticationController::class, 'adminLogin']);
Route::post('/logout', [AuthenticationController::class, 'logout'])->middleware('auth:sanctum');

// ====================================================================
// ADMIN ROUTES
// ====================================================================

Route::prefix('admin')->group(function () {
    // --- SỬA LỖI 405 TẠI ĐÂY ---
    // 1. Dùng apiResource cho các route đơn giản: index, show, destroy
    Route::apiResource('products', ProductController::class)->except(['store', 'update']);

    // 2. Định nghĩa riêng route POST cho việc TẠO MỚI (store)
    Route::post('products', [ProductController::class, 'store']);

    // 3. ĐỊNH NGHĨA RIÊNG ROUTE POST CHO VIỆC CẬP NHẬT (update)
    // Đây là dòng quan trọng nhất để sửa lỗi 405.
    Route::post('products/{id}', [ProductController::class, 'update']);
    // --- KẾT THÚC SỬA LỖI ---

    // Các route admin khác của bạn giữ nguyên
    Route::apiResource('orders', OrderController::class);

       // THÊM MỚI: Categories
    Route::apiResource('categories', CategoryController::class);
});

// Các route Admin khác VẪN CẦN XÁC THỰC
// -------------------- Admin Routes --------------------
Route::prefix('admin')->middleware(['auth:sanctum', CheckAdminMiddleware::class])->group(function () {
    Route::apiResource('users', UserController::class);
    Route::get('dashboard', [DashboardController::class, 'index']);
    // Route::get('vouchers', [VoucherController::class, 'index']);
    // Route::get('vouchers/{code}', [VoucherController::class, 'show']);
    Route::get('contacts', [ContactController::class, 'index']);
    Route::patch('contacts/{id}/status', [ContactController::class, 'updateStatus']);
    Route::post('contacts/{id}/reply', [ContactController::class, 'reply']);
    // routes/api.php
Route::prefix('vouchers')->group(function () {
    Route::get('/', [VoucherController::class, 'index']);
    Route::post('/', [VoucherController::class, 'store']);
    Route::put('/{id}', [VoucherController::class, 'update']);
    Route::patch('/{id}/toggle', [VoucherController::class, 'toggle']);
});


});

Route::post('/contact', [ContactController::class, 'store']);

// Authenticated User Routes
// -------------------- Authenticated User Routes --------------------
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', function (Request $request) {
        return response()->json($request->user());
    });

    Route::get('/users/{id}', [UserController::class, 'show']);
    Route::post('/logout', [AuthenticationController::class, 'logout']);

    // ✅ KHÔNG cần giữ lại product ở đây vì đã move ra ngoài

    Route::prefix('favorites')->group(function () {
        Route::get('/', [FavoriteController::class, 'index']);
        Route::post('/{product_id}', [FavoriteController::class, 'toggle']);
    });

    // Orders - cho user (ClientOrderControlthler)
    Route::prefix('client/orders')->group(function () {
        Route::get('/', [ClientOrderController::class, 'index']);
        Route::get('/statistics', [ClientOrderController::class, 'statistics']);
        Route::get('/status/{status}', [ClientOrderController::class, 'getByStatus']);
        Route::get('/{id}', [ClientOrderController::class, 'show']);
        Route::post('/', [ClientOrderController::class, 'store']);
        Route::put('/{id}', [ClientOrderController::class, 'update']);
        Route::delete('/{id}', [ClientOrderController::class, 'destroy']);
    });

    // Orders - cho admin (OrderController gốc)
    Route::prefix('order')->group(function () {
        Route::get('/', [OrderController::class, 'index']);
        Route::get('/{id}', [OrderController::class, 'show']);
        Route::post('add', [OrderController::class, 'store']);
        Route::put('update/{id}', [OrderController::class, 'update']);
        Route::delete('delete/{id}', [OrderController::class, 'destroy']);
    });

    Route::prefix('user')->middleware(CheckRole::class . ':1')->group(function () {
        Route::get('/', [UserController::class, 'index']);
        Route::get('/{id}', [UserController::class, 'show']);
        Route::post('add', [UserController::class, 'store']);
        Route::put('update/{id}', [UserController::class, 'update']);
        Route::put('lock/{id}', [UserController::class, 'lock']);
        Route::put('unlock/{id}', [UserController::class, 'unlock']);
    });

    Route::prefix('vouchers')->group(function () {
        Route::get('/', [VoucherController::class, 'index']);
        Route::get('/{code}', [VoucherController::class, 'show']);
    });

    Route::prefix('payments')->group(function () {
        Route::get('/{order_id}', [PaymentController::class, 'show']);
        Route::post('/', [PaymentController::class, 'store']);
    });

    Route::apiResource('/cart', CartController::class);
    Route::post('/comments', [CommentController::class, 'store']);
    Route::post('/complaints', [ComplaintController::class, 'store']);
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/dashboard', [DashboardController::class, 'index']);
});
