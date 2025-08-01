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
use App\Http\Controllers\Api\SizeController;
use App\Http\Controllers\Api\ColorController;
use App\Http\Controllers\Api\FavoriteController;
use App\Http\Controllers\Api\ProductVariantController;
use App\Http\Middleware\CheckAdminMiddleware;
use App\Http\Controllers\Api\ForgotPasswordController;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use App\Http\Middleware\CheckRole;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\ClientOrderController;

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

// Public orders endpoint for testing
Route::post('/orders', [\App\Http\Controllers\Api\ClientOrderController::class, 'store']);

// Simple test order endpoint
Route::post('/test-order', function(Request $request) {
    try {
        $data = $request->validate([
            'user_id' => 'required|integer',
            'total_amount' => 'required|numeric',
            'items' => 'required|array'
        ]);
        
        // Tạo order giả để test (không cần database)
        $orderId = time(); // Sử dụng timestamp làm ID
        
        return response()->json([
            'status' => 'success',
            'message' => 'Order created successfully',
            'data' => [
                'id' => $orderId,
                'user_id' => $data['user_id'],
                'total_amount' => $data['total_amount'],
                'status' => 'pending'
            ]
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => $e->getMessage()
        ], 500);
    }
});

// Create test user endpoint
Route::post('/create-test-user', function() {
    try {
        // Tạo user giả để test (không cần database)
        $userId = 1; // ID cố định
        
        return response()->json([
            'status' => 'success',
            'message' => 'Test user created successfully',
            'data' => [
                'id' => $userId,
                'name' => 'Test User',
                'email' => 'test@example.com',
                'phone' => '0123456789'
            ]
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => $e->getMessage()
        ], 500);
    }
});

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
    Route::get('vouchers', [VoucherController::class, 'index']);
    Route::get('vouchers/{code}', [VoucherController::class, 'show']);
    Route::get('contacts', [ContactController::class, 'index']);
    Route::patch('contacts/{id}/status', [ContactController::class, 'updateStatus']);
    Route::post('contacts/{id}/reply', [ContactController::class, 'reply']);

});

Route::post('/contact', [ContactController::class, 'store']);

// Authenticated User Routes
// -------------------- Authenticated User Routes --------------------
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', function (Request $request) {
        return response()->json($request->user());
    });

    Route::get('/users/{id}', [UserController::class, 'show']);
    Route::put('/users/{id}', [UserController::class, 'update']);
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
    Route::post('/validate', [VoucherController::class, 'validateVoucher']);
    Route::get('/available/list', [VoucherController::class, 'getAvailableVouchers']);
});

// Simple voucher test endpoint
Route::post('/test-voucher', function(Request $request) {
    try {
        $code = $request->input('code');
        $totalAmount = $request->input('total_amount');
        
        // Vouchers test cố định
        $vouchers = [
            'SAVE10' => [
                'title' => 'Giảm giá 10%',
                'code' => 'SAVE10',
                'value' => 10.00,
                'max_value' => 50000.00,
                'quantity' => 100,
                'description' => 'Giảm giá 10% cho đơn hàng từ 100,000 VND',
                'start_date' => '2025-01-01',
                'end_date' => '2025-12-31',
                'status' => true
            ],
            'SAVE20' => [
                'title' => 'Giảm giá 20%',
                'code' => 'SAVE20',
                'value' => 20.00,
                'max_value' => 100000.00,
                'quantity' => 50,
                'description' => 'Giảm giá 20% cho đơn hàng từ 200,000 VND',
                'start_date' => '2025-01-01',
                'end_date' => '2025-12-31',
                'status' => true
            ],
            'FIXED30K' => [
                'title' => 'Giảm giá cố định 30,000 VND',
                'code' => 'FIXED30K',
                'value' => 30000.00,
                'max_value' => 30000.00,
                'quantity' => 200,
                'description' => 'Giảm giá cố định 30,000 VND cho đơn hàng từ 150,000 VND',
                'start_date' => '2025-01-01',
                'end_date' => '2025-12-31',
                'status' => true
            ]
        ];
        
        if (!isset($vouchers[$code])) {
            return response()->json([
                'status' => 'error',
                'message' => 'Mã voucher không tồn tại'
            ], 404);
        }
        
        $voucher = $vouchers[$code];
        
        // Kiểm tra thời gian hiệu lực
        $now = date('Y-m-d');
        if ($now < $voucher['start_date'] || $now > $voucher['end_date']) {
            return response()->json([
                'status' => 'error',
                'message' => 'Voucher đã hết hạn hoặc chưa có hiệu lực'
            ], 400);
        }
        
        // Kiểm tra số lượng còn lại
        if ($voucher['quantity'] <= 0) {
            return response()->json([
                'status' => 'error',
                'message' => 'Voucher đã hết số lượng'
            ], 400);
        }
        
        // Tính toán giảm giá
        if ($voucher['code'] === 'FIXED30K') {
            // Giảm cố định
            $discount = min($voucher['value'], $voucher['max_value']);
        } else {
            // Giảm theo %
            $discount = min($totalAmount * ($voucher['value'] / 100), $voucher['max_value']);
        }
        
        return response()->json([
            'status' => 'success',
            'message' => 'Voucher hợp lệ',
            'data' => [
                'voucher' => $voucher,
                'discount_amount' => $discount,
                'final_amount' => $totalAmount - $discount
            ]
        ], 200);
        
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => 'Có lỗi xảy ra: ' . $e->getMessage()
        ], 500);
    }
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

// PUBLIC VOUCHER ROUTES (không cần authentication)
Route::post('/test-voucher', function(Request $request) {
    try {
        $code = $request->input('code');
        $totalAmount = $request->input('total_amount');
        
        // Vouchers test cố định
        $vouchers = [
            'SAVE10' => [
                'title' => 'Giảm giá 10%',
                'code' => 'SAVE10',
                'value' => 10.00,
                'max_value' => 50000.00,
                'quantity' => 100,
                'description' => 'Giảm giá 10% cho đơn hàng từ 100,000 VND',
                'start_date' => '2025-01-01',
                'end_date' => '2025-12-31',
                'status' => true
            ],
            'SAVE20' => [
                'title' => 'Giảm giá 20%',
                'code' => 'SAVE20',
                'value' => 20.00,
                'max_value' => 100000.00,
                'quantity' => 50,
                'description' => 'Giảm giá 20% cho đơn hàng từ 200,000 VND',
                'start_date' => '2025-01-01',
                'end_date' => '2025-12-31',
                'status' => true
            ],
            'FIXED30K' => [
                'title' => 'Giảm giá cố định 30,000 VND',
                'code' => 'FIXED30K',
                'value' => 30000.00,
                'max_value' => 30000.00,
                'quantity' => 200,
                'description' => 'Giảm giá cố định 30,000 VND cho đơn hàng từ 150,000 VND',
                'start_date' => '2025-01-01',
                'end_date' => '2025-12-31',
                'status' => true
            ],
            'MUA HE 2025' => [
                'title' => 'MUA HE',
                'code' => 'MUA HE 2025',
                'value' => 10.00,
                'max_value' => 50000.00,
                'quantity' => 100,
                'description' => 'Voucher giảm 10% cho đơn từ 100k, tối đa 50k',
                'start_date' => '2025-08-01',
                'end_date' => '2025-08-31',
                'status' => true
            ]
        ];
        
        if (!isset($vouchers[$code])) {
            return response()->json([
                'status' => 'error',
                'message' => 'Mã voucher không tồn tại'
            ], 404);
        }
        
        $voucher = $vouchers[$code];
        
        // Kiểm tra thời gian hiệu lực
        $now = date('Y-m-d');
        if ($now < $voucher['start_date'] || $now > $voucher['end_date']) {
            return response()->json([
                'status' => 'error',
                'message' => 'Voucher đã hết hạn hoặc chưa có hiệu lực'
            ], 400);
        }
        
        // Kiểm tra số lượng còn lại
        if ($voucher['quantity'] <= 0) {
            return response()->json([
                'status' => 'error',
                'message' => 'Voucher đã hết số lượng'
            ], 400);
        }
        
        // Tính toán giảm giá
        if ($voucher['code'] === 'FIXED30K') {
            // Giảm cố định
            $discount = min($voucher['value'], $voucher['max_value']);
        } else {
            // Giảm theo %
            $discount = min($totalAmount * ($voucher['value'] / 100), $voucher['max_value']);
        }
        
        return response()->json([
            'status' => 'success',
            'message' => 'Voucher hợp lệ',
            'data' => [
                'voucher' => $voucher,
                'discount_amount' => $discount,
                'final_amount' => $totalAmount - $discount
            ]
        ], 200);
        
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => 'Có lỗi xảy ra: ' . $e->getMessage()
        ], 500);
    }
});

// PUBLIC ORDER ROUTES (không cần authentication)
Route::post('/test-order', function(Request $request) {
    try {
        $orderData = $request->all();
        
        // Mock order creation
        $orderId = 'ORD' . date('YmdHis') . rand(100, 999);
        
        return response()->json([
            'success' => true,
            'id' => $orderId,
            'message' => 'Đặt hàng thành công',
            'order' => $orderData
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => 'Có lỗi xảy ra: ' . $e->getMessage()
        ], 500);
    }
});
