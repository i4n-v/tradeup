<?php

use App\Http\Controllers\Api\V1\Auth\LoginController;
use App\Http\Controllers\Api\V1\Auth\LogoutController;
use App\Http\Controllers\Api\V1\Auth\RegisterController;
use App\Http\Controllers\Api\V1\DashboardController;
use App\Http\Controllers\Api\V1\MeController;
use App\Http\Controllers\Api\V1\ProfileController;
use App\Http\Controllers\Api\V1\Trades\BuyTradeController;
use App\Http\Controllers\Api\V1\Trades\SellTradeController;
use App\Http\Controllers\Api\V1\TransactionController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::post('/auth/register', RegisterController::class)->name('auth.register');
    Route::post('/auth/login', LoginController::class)->name('auth.login');

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/auth/logout', LogoutController::class)->name('auth.logout');
        Route::get('/me', MeController::class)->name('me');
        Route::get('/dashboard', DashboardController::class)->name('dashboard');
        Route::post('/trades/buy', BuyTradeController::class)->name('trades.buy');
        Route::post('/trades/sell', SellTradeController::class)->name('trades.sell');
        Route::get('/transactions', TransactionController::class)->name('transactions.index');
        Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
        Route::post('/profile/avatar', [ProfileController::class, 'uploadAvatar'])->name('profile.avatar');
    });
});
