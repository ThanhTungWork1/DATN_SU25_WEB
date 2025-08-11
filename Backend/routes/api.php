<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
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
use App\Http\Controllers\Api\AddressController;
// --- ADMIN Controllers ---
use App\Http\Controllers\Admin\CommentController as AdminCommentController;
// --- Middleware ---
use App\Http\Middleware\CheckAdminMiddleware;
use App\Http\Middleware\CheckRole;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\VNPayController;
use App\Http\Controllers\Api\ZaloPayController;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
// Test API
Route::get('test', fn() => response()->json(['status' => 'success'], 200));

// Address Proxy (provinces/districts/wards) to avoid CORS
Route::prefix('addresses')->group(function () {
    Route::get('provinces', [AddressController::class, 'provinces']);
    Route::get('districts/{provinceId}', [AddressController::class, 'districts']);
    Route::get('wards/{districtId}', [AddressController::class, 'wards']);
});

// Test Auth API
Route::middleware(['auth:sanctum'])->get('test-auth', function(Request $request) {
    return response()->json([
        'status' => 'success',
        'message' => 'Authentication working',
        'user' => $request->user(),
        'token' => $request->bearerToken()
    ]);
});

// Test Order API (không cần auth để debug)
Route::post('test-order', function(Request $request) {
    try {
        // Fake user ID = 1 để test
        $order = \App\Models\Order::create([
            'user_id' => 1,
            'total_amount' => $request->total_amount ?? 100000,
            'shipping_fee' => $request->shipping_fee ?? 30000,
            'discount_amount' => $request->discount_amount ?? 0,
            'final_amount' => $request->final_amount ?? 130000,
            'voucher_code' => $request->voucher_code,
            'customer_name' => $request->customer_name ?? 'Test User',
            'customer_phone' => $request->customer_phone ?? '0123456789',
            'customer_email' => $request->customer_email ?? 'test@example.com',
            'shipping_address' => $request->shipping_address ?? 'Test Address',
            'payment_method' => $request->payment_method ?? 'cod',
            'notes' => $request->notes ?? '',
            'status' => 'pending'
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Test order created successfully',
            'data' => [
                'id' => $order->id,
                'total_amount' => $order->total_amount,
                'final_amount' => $order->final_amount,
                'status' => $order->status,
                'created_at' => $order->created_at
            ]
        ], 201);
    } catch (\Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => 'Error creating test order: ' . $e->getMessage()
        ], 500);
    }
});

// CART API
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/cart', [\App\Http\Controllers\Api\CartController::class, 'index']);
    Route::post('/cart', [\App\Http\Controllers\Api\CartController::class, 'store']);
    Route::put('/cart/{id}', [\App\Http\Controllers\Api\CartController::class, 'update']);
    Route::delete('/cart/{id}', [\App\Http\Controllers\Api\CartController::class, 'destroy']);
    Route::delete('/cart', [\App\Http\Controllers\Api\CartController::class, 'clear']);
});

// DEBUG API WITH AUTH
Route::middleware(['auth:sanctum'])->get('debug-cart', function(Request $request) {
    try {
        $user = auth()->user();
        $cart = \App\Models\Cart::where('user_id', $user->id)->first();
        
        return response()->json([
            'success' => true,
            'user' => $user,
            'cart_exists' => $cart ? true : false,
            'cart_id' => $cart ? $cart->id : null,
            'items_count' => $cart ? $cart->cartItems->count() : 0
        ]);
    } catch (Exception $e) {
        return response()->json([
            'success' => false,
            'error' => $e->getMessage(),
            'line' => $e->getLine()
        ], 500);
    }
});

// TOKEN TEST API
Route::get('test-token', function() {
    try {
        // Tìm user test hoặc tạo mới
        $user = \App\Models\User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'password' => bcrypt('password'),
                'email_verified_at' => now()
            ]
        );
        
        // Xóa token cũ
        $user->tokens()->delete();
        
        // Tạo token mới
        $token = $user->createToken('test-token')->plainTextToken;
        
        return response()->json([
            'success' => true,
            'user' => $user->email,
            'token' => $token
        ]);
    } catch (Exception $e) {
        return response()->json([
            'success' => false,
            'error' => $e->getMessage()
        ], 500);
    }
});

// SIMPLE TOKEN API
Route::get('simple-token', function() {
    try {
        // Tạo user đơn giản
        $user = \App\Models\User::where('email', 'test@example.com')->first();
        
        if (!$user) {
            $user = new \App\Models\User();
            $user->name = 'Test User';
            $user->email = 'test@example.com';
            $user->password = bcrypt('password');
            $user->role = 'customer'; // Thêm role mặc định
            $user->email_verified_at = now();
            $user->save();
        }
        
        // Xóa token cũ và tạo mới
        $user->tokens()->delete();
        $token = $user->createToken('simple-token')->plainTextToken;
        
        return response()->json([
            'success' => true,
            'token' => $token,
            'user' => $user->email,
            'user_id' => $user->id
        ]);
        
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'error' => $e->getMessage(),
            'line' => $e->getLine()
        ], 500);
    }
});

// GET ALL PRODUCTS FOR TESTING
Route::get('all-products', function() {
    try {
        $products = \App\Models\Product::with(['category', 'variants.size', 'variants.color'])
            ->where('status', 'active')
            ->take(20)
            ->get();
            
        return response()->json([
            'success' => true,
            'products' => $products
        ]);
    } catch (Exception $e) {
        return response()->json([
            'success' => false,
            'error' => $e->getMessage()
        ], 500);
    }
});

// VOUCHER API
Route::post('test-voucher', function(Request $request) {
    try {
        $code = $request->input('code');
        $totalAmount = $request->input('total_amount', 0);
        
        // Tìm voucher trong database
        $voucher = \App\Models\Voucher::where('code', $code)
            ->where('status', true)
            ->where('start_date', '<=', now())
            ->where('end_date', '>=', now())
            ->first();
            
        if (!$voucher) {
            return response()->json([
                'status' => 'error',
                'message' => 'Mã voucher không tồn tại hoặc đã hết hạn'
            ]);
        }
        
        // Kiểm tra điều kiện tối thiểu
        if ($totalAmount < $voucher->min_order_amount) {
            return response()->json([
                'status' => 'error',
                'message' => 'Đơn hàng tối thiểu ' . number_format($voucher->min_order_amount) . ' VND để sử dụng voucher này'
            ]);
        }
        
        // Kiểm tra số lượng sử dụng
        if ($voucher->used_count >= $voucher->max_usage) {
            return response()->json([
                'status' => 'error',
                'message' => 'Voucher đã hết lượt sử dụng'
            ]);
        }
        
        // Tính giảm giá đơn giản
        $discountAmount = 0;
        if ($voucher->code === 'SAVE10') {
            // Giảm 10% tối đa 50k
            $discountAmount = ($totalAmount * 10) / 100;
            if ($discountAmount > 50000) {
                $discountAmount = 50000;
            }
        } else {
            // Giảm cố định
            $discountAmount = $voucher->value;
        }
        
        $finalAmount = $totalAmount - $discountAmount;
        
        return response()->json([
            'status' => 'success',
            'message' => 'Voucher hợp lệ',
            'data' => [
                'voucher' => $voucher,
                'discount_amount' => $discountAmount,
                'final_amount' => $finalAmount
            ]
        ]);
        
    } catch (Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => 'Lỗi kiểm tra voucher: ' . $e->getMessage()
        ], 500);
    }
});

// CREATE VARIANT FOR PRODUCT
Route::get('create-variant/{productId}', function($productId) {
    try {
        $product = \App\Models\Product::find($productId);
        if (!$product) {
            return response()->json(['error' => 'Product not found'], 404);
        }
        
        // Kiểm tra xem đã có variant chưa
        $existingVariant = \App\Models\ProductVariant::where('product_id', $productId)->first();
        if ($existingVariant) {
            return response()->json([
                'success' => true,
                'message' => 'Variant already exists',
                'variant_id' => $existingVariant->id
            ]);
        }
        
        // Tạo variant mới
        $variant = \App\Models\ProductVariant::create([
            'product_id' => $productId,
            'size_id' => 1,
            'color_id' => 1,
            'price' => $product->price,
            'stock' => 100,
            'sku' => 'PROD' . $productId . '-DEFAULT'
        ]);
        
        return response()->json([
            'success' => true,
            'message' => 'Variant created successfully',
            'variant_id' => $variant->id,
            'product_id' => $productId
        ]);
        
    } catch (Exception $e) {
        return response()->json([
            'success' => false,
            'error' => $e->getMessage()
        ], 500);
    }
});

// Debug Cart API
Route::get('debug-cart', function() {
    try {
        $cart = \App\Models\Cart::with([
            'cartItems.productVariant.product',
            'cartItems.productVariant.color',
            'cartItems.productVariant.size'
        ])->latest()->first();
        
        if (!$cart) {
            return response()->json(['message' => 'No cart found'], 404);
        }
        
        return response()->json([
            'cart' => $cart,
            'formatted_items' => $cart->cartItems->map(function ($item) {
                $variant = $item->productVariant;
                $product = $variant ? $variant->product : null;
                
                return [
                    'id' => $item->id,
                    'variant_id' => $item->variant_id,
                    'stored_price' => $item->price,
                    'variant_price' => $variant ? $variant->price : null,
                    'product_price' => $product ? $product->price : null,
                    'variant_image' => $variant ? $variant->image_url : null,
                    'product_image' => $product ? $product->image_url : null,
                    'product_name' => $product ? $product->name : null,
                ];
            })
        ]);
    } catch (\Exception $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
});

// Forgot Password
Route::post('/forgot-password/send-otp', [ForgotPasswordController::class, 'sendOtp']);
Route::post('/forgot-password/verify-otp', [ForgotPasswordController::class, 'verifyOtp']);
Route::post('/forgot-password/reset', [ForgotPasswordController::class, 'resetPassword']);
Route::get('/top-selling-products', [\App\Http\Controllers\Api\ProductController::class, 'topSellingProducts']);

// Tạo voucher test
Route::get('create-test-vouchers', function() {
    try {
        // Xóa voucher cũ (nếu có)
        \App\Models\Voucher::whereIn('code', ['SAVE10', 'SAVE50K', 'FREESHIP'])->delete();
        
        // Tạo voucher đơn giản - chỉ các trường cần thiết
        $vouchers = [
            [
                'title' => 'Giảm 10%',
                'code' => 'SAVE10',
                'value' => 10,
                'max_value' => 50000,
                'min_order_amount' => 200000,
                'max_usage' => 100,
                'used_count' => 0,
                'quantity' => 100,
                'description' => 'Giảm 10% tối đa 50k',
                'start_date' => now(),
                'end_date' => now()->addDays(30),
                'status' => 1
            ],
            [
                'title' => 'Giảm 50k',
                'code' => 'SAVE50K', 
                'value' => 50000,
                'max_value' => 0,
                'min_order_amount' => 300000,
                'max_usage' => 50,
                'used_count' => 0,
                'quantity' => 50,
                'description' => 'Giảm 50k cho đơn từ 300k',
                'start_date' => now(),
                'end_date' => now()->addDays(15),
                'status' => 1
            ],
            [
                'title' => 'Miễn phí ship',
                'code' => 'FREESHIP',
                'value' => 30000,
                'max_value' => 0,
                'min_order_amount' => 100000,
                'max_usage' => 200,
                'used_count' => 0,
                'quantity' => 200,
                'description' => 'Miễn phí ship',
                'start_date' => now(),
                'end_date' => now()->addDays(60),
                'status' => 1
            ]
        ];
        
        foreach ($vouchers as $voucherData) {
            \App\Models\Voucher::create($voucherData);
        }
        
        return response()->json([
            'success' => true,
            'message' => 'Tạo thành công 3 voucher test',
            'vouchers' => [
                'SAVE10 - Giảm 10% tối đa 50k (từ 200k)',
                'SAVE50K - Giảm 50k (đơn từ 300k)',
                'FREESHIP - Miễn phí ship (đơn từ 100k)'
            ]
        ]);
        
    } catch (Exception $e) {
        return response()->json([
            'success' => false,
            'error' => $e->getMessage()
        ], 500);
    }
});

// ========== Public ==========
Route::get('test', fn() => response()->json(['status' => 'success'], 200));

Route::post('/register', [AuthenticationController::class, 'register']);
Route::post('/login', [AuthenticationController::class, 'login']);
Route::post('/admin/login', [AuthenticationController::class, 'adminLogin']);
Route::post('/logout', [AuthenticationController::class, 'logout'])->middleware('auth:sanctum');
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
})->middleware(['auth:sanctum', 'throttle:6,1']);
Route::get('/email/verify/{id}/{hash}', function ($id, Request $request) {
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
// -------------------- Public Routes --------------------


// ========== Public Resources ==========
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{id}', [CategoryController::class, 'show']);
Route::get('/colors', [ColorController::class, 'index']);
Route::get('/sizes', [SizeController::class, 'index']);
Route::get('/banners', [BannerController::class, 'index']);
Route::get('/product-variants/{product_id}', [ProductVariantController::class, 'byProduct']);
Route::get('/comments/product/{product_id}', [ApiCommentController::class, 'getByProduct']);

// Public orders endpoint for testing
Route::post('/orders', [\App\Http\Controllers\Api\ClientOrderController::class, 'store']);

// Simple test order endpoint
// Use ClientOrderController for real order creation
Route::post('/test-order', [ClientOrderController::class, 'store']);

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
    Route::get('/test', [\App\Http\Controllers\Api\ProductController::class, 'test']);
    Route::get('/debug/{id}', [\App\Http\Controllers\Api\ProductController::class, 'debug']);
    Route::get('/detail/{id}', [\App\Http\Controllers\Api\ProductController::class, 'debug']);
    Route::get('/', [\App\Http\Controllers\Api\ProductController::class, 'index']);
    Route::get('/search', [\App\Http\Controllers\Api\ProductController::class, 'search']);
    Route::get('/featured', [\App\Http\Controllers\Api\ProductController::class, 'featured']);
    Route::get('/category/{categoryId}', [\App\Http\Controllers\Api\ProductController::class, 'byCategory']);
    Route::get('/{id}', [\App\Http\Controllers\Api\ProductController::class, 'showProduct']);
});

// Authentication
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
Route::get('/comments/product/{product_id}', [CommentController::class, 'getByProduct']);
Route::post('/contact', [ContactController::class, 'store']);
Route::get('/home-sections', [HomeSectionController::class, 'index']);
Route::get('/home-sections/{id}/products', [HomeSectionProductController::class, 'index']);

// ========== Admin ==========
Route::prefix('admin')->middleware(['auth:sanctum', CheckAdminMiddleware::class])->group(function () {
    Route::apiResource('users', UserController::class);
    Route::apiResource('products', ProductController::class);
    Route::apiResource('orders', OrderController::class);

    // Categories
    Route::apiResource('categories', CategoryController::class);
});
// Các route Admin khác VẪN CẦN XÁC THỰC
// -------------------- Admin Routes --------------------
Route::prefix('admin')/*->middleware(['auth:sanctum', CheckAdminMiddleware::class])*/->group(function () {
    
    // Order statistics và export - phải đặt TRƯỚC apiResource
    Route::get('orders/statistics', [OrderController::class, 'getOrderStatistics']);
    Route::get('orders/export', [OrderController::class, 'export']);
    
    // Order routes
    Route::apiResource('orders', OrderController::class);
    
    // Dashboard routes
    Route::prefix('dashboard')->group(function () {
        Route::get('/', [DashboardController::class, 'index']);
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
    
    // Comments / Reviews
    Route::get('comments', [AdminCommentController::class, 'index']);
    Route::put('comments/{id}/status', [AdminCommentController::class, 'updateStatus']);
    Route::delete('comments/{id}', [AdminCommentController::class, 'destroy']);

    // Users
    Route::apiResource('users', UserController::class);

    // Dashboard & Vouchers
    Route::get('dashboard', [DashboardController::class, 'index']);
    Route::get('contacts', [ContactController::class, 'index']);
    Route::patch('contacts/{id}/status', [ContactController::class, 'updateStatus']);
    Route::post('contacts/{id}/reply', [ContactController::class, 'reply']);
    Route::apiResource('vouchers', VoucherController::class);
    Route::post('vouchers/validate', [VoucherController::class, 'validateVoucher']);
    Route::post('vouchers/{id}/use', [VoucherController::class, 'useVoucher']);
    Route::get('contacts', [ContactController::class, 'index']);
    Route::patch('contacts/{id}/status', [ContactController::class, 'updateStatus']);
    // Home Sections
    Route::apiResource('home-sections', HomeSectionController::class)->only(['store', 'update', 'destroy']);

    // Inventory routes
    Route::prefix('inventory')->group(function () {
        Route::get('/stats', [InventoryController::class, 'stats']);
        Route::get('/list', [InventoryController::class, 'list']);
        Route::get('/low-stock-alerts', [InventoryController::class, 'lowStockAlerts']);
        Route::post('/update-stock-for-order', [InventoryController::class, 'updateStockForOrder']);
    });

    // Voucher routes
    Route::apiResource('vouchers', \App\Http\Controllers\Admin\VoucherController::class);
    Route::get('vouchers/statistics', [\App\Http\Controllers\Admin\VoucherController::class, 'statistics']);
    Route::get('vouchers/{id}/usage', [\App\Http\Controllers\Admin\VoucherController::class, 'usageDetails']);
    Route::patch('vouchers/{id}/toggle', [\App\Http\Controllers\Admin\VoucherController::class, 'toggle']);

    Route::prefix('home-section-products')->group(function () {
        Route::post('/', [HomeSectionProductController::class, 'store']);
        Route::delete('/{section_id}/product/{product_id}', [HomeSectionProductController::class, 'destroy']);
    });


    // Inventory
    Route::prefix('inventories')->group(function () {
        Route::post('/import', [InventoryController::class, 'import']);
        Route::post('/export', [InventoryController::class, 'export']);
        Route::get('/low-stock', [InventoryController::class, 'lowStock']);
        Route::get('/', [InventoryController::class, 'index']);
    });

    Route::get('/inventory-logs', [InventoryLogController::class, 'index']);
});
    // routes/api.php
Route::prefix('vouchers')->group(function () {
    Route::get('/', [VoucherController::class, 'index']);
    Route::post('/', [VoucherController::class, 'store']);
    Route::put('/{id}', [VoucherController::class, 'update']);
    Route::patch('/{id}/toggle', [VoucherController::class, 'toggle']);
});


Route::post('/contact', [ContactController::class, 'store']);

// Authenticated User Routes
// -------------------- Authenticated User Routes --------------------
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', function (Request $request) {
        return response()->json($request->user());
    });
});


// Authenticated User Routes (Yêu cầu xác thực)
// ========== Authenticated Users ==========
Route::middleware(['auth:sanctum'])->group(function () {
    // User profile endpoints
    Route::get('/me', function(Request $request) {
        return response()->json([
            'status' => 'success',
            'data' => $request->user()
        ]);
    });
    Route::get('/me/{id}', [UserController::class, 'show']);
    Route::get('/users/{id}', [UserController::class, 'show']);
    Route::put('/users/{id}', [UserController::class, 'update']);
    Route::post('/logout', [AuthenticationController::class, 'logout']);

    // ✅ KHÔNG cần giữ lại product ở đây vì đã move ra ngoài

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
        Route::put('/{id}', [ClientOrderController::class, 'update']);
        Route::delete('/{id}', [ClientOrderController::class, 'destroy']);
    });

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
    Route::post('/validate', [VoucherController::class, 'validateVoucher']);
    Route::get('/available/list', [VoucherController::class, 'getAvailableVouchers']);
});

// Use VoucherController for voucher validation
Route::post('/test-voucher', [VoucherController::class, 'validateVoucher']);

    // Payments (ZaloPay + VNPay)
    Route::prefix('payments')->group(function () {
        Route::get('/{order_id}', [PaymentController::class, 'show']);
        Route::post('/', [PaymentController::class, 'store']);
        Route::post('/create', [PaymentController::class, 'createPayment']); // Route mới cho tất cả phương thức
        Route::get('/status/{order_id}', [PaymentController::class, 'checkStatus']);

        Route::prefix('zalopay')->group(function () {
            Route::post('/create', [ZaloPayController::class, 'createOrder']);
            Route::post('/callback', [ZaloPayController::class, 'callback']);
            Route::get('/status/{order_id}', [ZaloPayController::class, 'checkStatus']);
            Route::post('/test-zalopay', function () {
                return 'ok';
            });

        });

        Route::prefix('vnpay')->group(function () {
            Route::post('/create', [VNPayController::class, 'createPayment']);
            Route::get('/callback', [VNPayController::class, 'callback']);
            Route::post('/ipn', [VNPayController::class, 'ipn']);
        });
    });

    // Webhook routes (không cần authentication)
    Route::post('/payment-webhook', [PaymentController::class, 'webhook']);
    Route::post('/momo-webhook', [PaymentController::class, 'webhook']);
    Route::post('/banking-webhook', [PaymentController::class, 'webhook']);

    Route::apiResource('/cart', CartController::class);
    Route::post('/cart-clear', [CartController::class, 'clearCart']);
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
// Using ClientOrderController above for test-order


    // Quản lý comment (role = 1)
    Route::prefix('comments')->middleware(CheckRole::class . ':1')->group(function () {
        Route::get('/', [CommentController::class, 'index']);
        Route::put('/approve/{id}', [CommentController::class, 'approve']);
        Route::put('/hide/{id}', [CommentController::class, 'hide']);
        Route::delete('/{id}', [CommentController::class, 'destroy']);
        Route::get('/filter/spam', [CommentController::class, 'filterSpam']);
    });
});