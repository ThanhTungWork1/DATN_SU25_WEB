<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\UserController;

// Admin
Route::group(
    [
        'prefix' => 'admin',
        'as' => 'admin',
    ],
    function () {
        //quản lý user
        Route::group(
            [
                'prefix' => 'users',
                'as' => 'users',
            ],
            function () {
                // Route::get('list-users', [UserController::class, 'listUsers'])->name('listUsers'); // Đã comment để tránh lỗi
            }
        );
    }
);
Route::get('/', function () {
    return view('welcome');
});

// Cart routes
// Route::get('/cart', [CartController::class, 'index'])->name('cart.index');
// Route::post('/cart/add', [CartController::class, 'add'])->name('cart.add');
// Route::post('/cart/update', [CartController::class, 'update'])->name('cart.update');
// Route::post('/cart/remove', [CartController::class, 'remove'])->name('cart.remove');
