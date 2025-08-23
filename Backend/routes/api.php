<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Middleware
use App\Http\Middleware\CheckAdminMiddleware;
use App\Http\Middleware\CheckRole;
use App\Http\Controllers\Api\VNPayController;
use App\Http\Controllers\Api\ZaloPayController;
use App\Http\Controllers\Admin\AdminRefundRequestController;
// Controllers
use App\Http\Controllers\Api\{
    HomeSectionController,
    HomeSectionProductController,
    AuthenticationController,
    BannerController,
    CartController,
    CategoryController,
    ChatbotController,
    ClientOrderController,
    ColorController,
    CommentController,
    ComplaintController,
    ContactController,
    DashboardController,
    FavoriteController,
    ForgotPasswordController,
    InventoryController,
    InventoryLogController,
    NotificationController,
    OrderController,
    PaymentController,
    ProductController,
    ProductVariantController,
    RefundRequestController,
    SizeController,
    UserController,
    VoucherController
};

// ========== Public ==========
Route::get('test', fn() => response()->json(['status' => 'success'], 200));

Route::post('/register', [AuthenticationController::class, 'register']);
Route::post('/login', [AuthenticationController::class, 'login']);
Route::post('/admin/login', [AuthenticationController::class, 'adminLogin']);
Route::post('/logout', [AuthenticationController::class, 'logout'])->middleware('auth:sanctum');
Route::get('/me', [AuthenticationController::class, 'me'])->middleware('auth:sanctum');
Route::get('/home-sections/{id}', [HomeSectionController::class, 'show']);

// Forgot Password
Route::prefix('forgot-password')->group(function () {
    Route::post('/send-otp', [ForgotPasswordController::class, 'sendOtp']);
    Route::post('/verify-otp', [ForgotPasswordController::class, 'verifyOtp']);
    Route::post('/reset', [ForgotPasswordController::class, 'resetPassword']);
});

// Email Verification
Route::middleware(['auth:sanctum', 'throttle:6,1'])->post('/email/verification-notification', function (Request $request) {
    $request->user()->sendEmailVerificationNotification();
    return response()->json(['message' => 'Đã gửi lại email xác minh']);
});

Route::middleware(['auth:sanctum', 'signed'])->get('/email/verify/{id}/{hash}', function ($id, Request $request) {
    $user = \App\Models\User::findOrFail($id);
    if (!hash_equals((string) $request->route('hash'), sha1($user->getEmailForVerification()))) {
        return response()->json(['message' => 'Link xác minh không hợp lệ'], 400);
    }
    if (!$user->hasVerifiedEmail()) {
        $user->markEmailAsVerified();
    }
    return response()->json(['message' => 'Xác minh email thành công']);
})->name('verification.verify');

// ========== Public Resources ==========
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{id}', [CategoryController::class, 'show']);
Route::get('/colors', [ColorController::class, 'index']);
Route::get('/sizes', [SizeController::class, 'index']);
Route::get('/banners', [BannerController::class, 'index']);
Route::get('/product-variants/{product_id}', [ProductVariantController::class, 'byProduct']);
Route::get('/client/comments/product/{id}', [CommentController::class, 'getByProduct']);
Route::post('/contact', [ContactController::class, 'store']);
Route::get('/home-sections', [HomeSectionController::class, 'index']);
Route::get('/home-sections/{id}/products', [HomeSectionProductController::class, 'index']);
Route::get('/payments/vnpay/return', [VNPayController::class, 'callback']);

// ========== Public Product Routes ==========
Route::prefix('product')->group(function () {
    Route::get('/', [ProductController::class, 'index']);
    Route::get('/search', [ProductController::class, 'search']);
    Route::get('/featured', [ProductController::class, 'featured']);
    Route::get('/category/{categoryId}', [ProductController::class, 'byCategory']);
    Route::get('/{id}', [ProductController::class, 'show']);
});
Route::get('/products/{id}', [ProductController::class, 'show']); // Alias for frontend compatibility

// Chatbot API
Route::post('/chatbot', [ChatbotController::class, 'handle']);

// ========== Webhook VNPay (No Auth) ==========
Route::prefix('payments/vnpay')->group(function () {
    Route::get('/callback', [VNPayController::class, 'callback']); // Return URL sau khi thanh toán
    Route::post('/ipn', [VNPayController::class, 'ipn']); // IPN server-to-server
});

// ========== Admin ==========
Route::prefix('admin')->middleware(['auth:sanctum', CheckAdminMiddleware::class])->group(function () {
    Route::apiResource('users', UserController::class);
    Route::apiResource('products', \App\Http\Controllers\Admin\ProductController::class);
    Route::get('products/{id}/statistics', [ProductController::class, 'getStatistics']);
    Route::apiResource('orders', OrderController::class);

    // Category Statistics
    Route::get('categories/{id}/statistics', [CategoryController::class, 'getStatistics']);

    // Dashboard Routes
    Route::prefix('dashboard')->group(function () {
        Route::get('/', [DashboardController::class, 'index']);
        Route::get('/user-growth', [DashboardController::class, 'userGrowth']);
        Route::get('/orders-by-status', [DashboardController::class, 'ordersByStatus']);
        Route::get('/top-selling-products', [DashboardController::class, 'topSellingProducts']);
        Route::get('/revenue-by-time', [DashboardController::class, 'revenueByTime']);
        Route::get('/rating-stats', [DashboardController::class, 'ratingStats']);
    });

    Route::apiResource('vouchers', VoucherController::class);
    Route::put('vouchers/{id}', [VoucherController::class, 'update']);
    Route::post('vouchers/validate', [VoucherController::class, 'validateVoucher']);
    Route::post('vouchers/{id}/use', [VoucherController::class, 'useVoucher']);
    Route::patch('vouchers/{id}/toggle', [VoucherController::class, 'toggle']);
    Route::get('vouchers/{id}/usage', [VoucherController::class, 'usageDetails']);
    Route::get('vouchers/{id}/statistics', [VoucherController::class, 'getStatistics']);

    Route::get('contacts', [ContactController::class, 'index']);
    Route::patch('contacts/{id}/status', [ContactController::class, 'updateStatus']);
    
    // Refund Requests Management
    Route::get('refund-requests', [AdminRefundRequestController::class, 'index']);
    Route::patch('refund-requests/{id}/status', [AdminRefundRequestController::class, 'updateStatus']);
    
    // Home Sections
    Route::get('home-sections', [HomeSectionController::class, 'adminIndex']);
    Route::apiResource('home-sections', HomeSectionController::class)->only(['store', 'update', 'destroy']);

    Route::prefix('home-section-products')->group(function () {
        Route::post('/', [HomeSectionProductController::class, 'store']);
        Route::delete('/{section_id}/product/{product_id}', [HomeSectionProductController::class, 'destroy']);
    });

    // Home Section Products
    Route::get('home-sections/{id}/products', [HomeSectionProductController::class, 'index']);
    Route::post('home-sections/{id}/products', [HomeSectionProductController::class, 'store']);
    Route::delete('home-sections/{section_id}/products/{product_id}', [HomeSectionProductController::class, 'destroy']);

    // Inventory
    Route::prefix('inventory')->group(function () {
        Route::get('/stats', [\App\Http\Controllers\Admin\InventoryController::class, 'stats']);
        Route::get('/list', [\App\Http\Controllers\Admin\InventoryController::class, 'list']);
        Route::get('/low-stock-alerts', [\App\Http\Controllers\Admin\InventoryController::class, 'lowStockAlerts']);
        Route::post('/update-stock-for-order', [\App\Http\Controllers\Admin\InventoryController::class, 'updateStockForOrder']);
    });

    Route::prefix('inventories')->group(function () {
        Route::post('/import', [InventoryController::class, 'import']);
        Route::post('/export', [InventoryController::class, 'export']);
        Route::get('/low-stock', [InventoryController::class, 'lowStock']);
        Route::get('/', [InventoryController::class, 'index']);
    });

    Route::get('/inventory-logs', [InventoryLogController::class, 'index']);
});

// ========== Authenticated Users ==========
Route::middleware(['auth:sanctum'])->group(function () {

    Route::prefix('favorites')->group(function () {
        Route::get('/', [FavoriteController::class, 'index']);
        Route::post('/{product_id}', [FavoriteController::class, 'toggle']);
    });

    // Orders cho user
    Route::prefix('client/orders')->group(function () {
        Route::get('/', [ClientOrderController::class, 'index']);
        Route::get('/statistics', [ClientOrderController::class, 'statistics']);
        Route::get('/status/{status}', [ClientOrderController::class, 'getByStatus']);
        Route::get('/{id}', [ClientOrderController::class, 'show']);
        Route::post('/', [ClientOrderController::class, 'store']);
        Route::post('/calculate-shipping', [ClientOrderController::class, 'calculateShippingFee']); // API tính phí ship
        Route::put('/{id}', [ClientOrderController::class, 'update']);
        Route::delete('/{id}', [ClientOrderController::class, 'destroy']);
    });

    // User profile update
    Route::put('/users/{id}', [UserController::class, 'update']);

    // Orders cho admin
    Route::prefix('order')->group(function () {
        Route::get('/', [OrderController::class, 'index']);
        Route::get('/{id}', [OrderController::class, 'show']);
        Route::post('/add', [OrderController::class, 'store']);
        Route::put('/update/{id}', [OrderController::class, 'update']);
        Route::delete('/delete/{id}', [OrderController::class, 'destroy']);
        Route::put('/{id}/mark-paid', [OrderController::class, 'markAsPaid']);
        Route::post('/payment-webhook', [OrderController::class, 'paymentWebhook']);
    });

    // User management (role = 1)
    Route::prefix('user')->middleware(CheckRole::class . ':1')->group(function () {
        Route::get('/', [UserController::class, 'index']);
        Route::get('/{id}', [UserController::class, 'show']);
        Route::post('/add', [UserController::class, 'store']);
        Route::put('/update/{id}', [UserController::class, 'update']);
        Route::put('/lock/{id}', [UserController::class, 'lock']);
        Route::put('/unlock/{id}', [UserController::class, 'unlock']);
    });

    // Vouchers
    Route::prefix('vouchers')->group(function () {
        Route::get('/', [VoucherController::class, 'index']);
        Route::get('/{code}', [VoucherController::class, 'show']);
        Route::post('/validate', [VoucherController::class, 'validateVoucher']); // Route cho user validate voucher
    });

    // Payments (ZaloPay + VNPay)
    Route::prefix('payments')->group(function () {
        Route::get('/{order_id}', [PaymentController::class, 'show']);
        Route::post('/', [PaymentController::class, 'store']);

        Route::prefix('zalopay')->group(function () {
            Route::post('/create', [ZaloPayController::class, 'createOrder']);
            Route::post('/callback', [ZaloPayController::class, 'callback']);
        });

        Route::prefix('vnpay')->group(function () {
            Route::post('/create', [VNPayController::class, 'createPayment']);
            Route::post('/check-status', [VNPayController::class, 'checkStatus']);
        });
    });

    Route::apiResource('/cart', CartController::class);
        Route::put('/cart/items/{cartItem}', [CartController::class, 'updateItem']); // Route để cập nhật một item cụ thể
        Route::delete('/cart/items/{cartItem}', [CartController::class, 'destroyItem']); // Route để xóa một item cụ thể
                Route::post('/cart/clear', [CartController::class, 'clear']); // Route để xóa toàn bộ giỏ hàng (sử dụng POST do hạn chế của môi trường dev)
    Route::post('/comments', [CommentController::class, 'store']);
    Route::post('/complaints', [ComplaintController::class, 'store']);

    // Refund Requests
    Route::apiResource('/refund-requests', RefundRequestController::class);

    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Comments and Reviews
    Route::get('/client/review-eligibility/{id}', [CommentController::class, 'checkEligibility']);

    // Quản lý comment (role = 1)
    Route::prefix('comments')->middleware(CheckRole::class . ':1')->group(function () {
        Route::get('/', [CommentController::class, 'index']);
        Route::put('/approve/{id}', [CommentController::class, 'approve']);
        Route::put('/hide/{id}', [CommentController::class, 'hide']);
        Route::delete('/{id}', [CommentController::class, 'destroy']);
        Route::get('/filter/spam', [CommentController::class, 'filterSpam']);
    });
});
