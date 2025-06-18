<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\UserControl;

// Admin
Route::group([
    'prefix' => 'admin',
    'as' => 'admin',
], function () {
    //quản lý user
    Route::group(
        [
            'prefix' => 'users',
            'as' => 'users',
        ],
        function () {
            Route::get('list-users', [UserControl::class, 'listUsers'])->name('listUsers');
        }
    );
});