<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\SingleGameController;
use App\Http\Controllers\SingleMatchesController;
use App\Http\Controllers\RoundController;
use App\Http\Controllers\FileController;
use App\Http\Controllers\MatchController;
use App\Http\Controllers\GameController;
use App\Http\Controllers\MultiplayerGameControllerController;
use App\Http\Controllers\HistoryController;
use App\Http\Controllers\StatsController;
use App\Http\Controllers\LeaderboardController;
use App\Http\Controllers\StatisticsController;
use App\Http\Controllers\CoinsController;
use App\Http\Controllers\CoinTransactionController;
use App\Http\Controllers\CoinPurchaseController;

Route::post('/login', [AuthController::class, 'login']);

// public endpoint to create a user
Route::post('/users', [UserController::class, 'store']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/users/me', function (Request $request) {
    return $request->user();
    });

    Route::post('logout', [AuthController::class, 'logout']);

    Route::post('/users/verify-password', [UserController::class, 'verifyPassword']);

    Route::prefix('files')->group(function () {
        Route::post('userphoto', [FileController::class, 'uploadUserPhoto']);
    });

    Route::patch('/users/{user}/block', [UserController::class, 'updateBlocked']);
    Route::patch('/users/{user}/updateType', [UserController::class, 'updateType']);

    Route::patch('/users/{user}/photo-url', [UserController::class, 'patchPhotoURL']);

    Route::apiResource('users', UserController::class)->except(['store']);
    Route::apiResource('matches', MatchController::class);
    Route::apiResource('games', MultiplayerGameControllerController::class);
    Route::apiResource('matches.games', MultiplayerGameControllerController::class)->shallow();

    Route::get('users/me/history', [HistoryController::class, 'index']);
    Route::get('users/me/history/{matchId}', [HistoryController::class, 'showMatch']);
    Route::get('history/{user}', [HistoryController::class, 'userHistory']);

    Route::get('users/me/stats', [StatsController::class, 'personalStats']);

    Route::post('/user/theme', [UserController::class, 'updateTheme']);
    Route::post('/user/avatar', [UserController::class, 'updateAvatar']);

    Route::post('/user/coins', [UserController::class, 'updateUserCoins']);
    Route::post('/user/coins/reward', [UserController::class, 'updateRewardCoins']);

    //Route::post('/coins/purchase', [CoinsController::class, 'store']);
    Route::get('/coins/transactions/me', [CoinTransactionController::class, 'myTransactions']);
    Route::get('/coins/transactions/{userId}', [CoinTransactionController::class, 'userTransactions']);
    Route::post('/coin-purchases', [CoinPurchaseController::class, 'store']);

    // Admin statistics routes
    Route::get('admin/statistics/users', [StatisticsController::class, 'getUsersList']);
    Route::get('admin/statistics/users/{user}', [StatisticsController::class, 'userStatistics']);
});

Route::get('/metadata', function (Request $request) {
    //abort(500, 'Something went wrong');
    return ["name" => "DAD 2025/26 Worksheet API", "version" => "0.0.1"];
});

Route::apiResources([
    'games_single' => SingleGameController::class
]);

Route::apiResources([
    'single_match' => SingleMatchesController::class,
    'rounds' => RoundController::class
]);

// Public routes (no auth required)
Route::get('/leaderboards', [LeaderboardController::class, 'global']);
Route::get('/statistics', [StatisticsController::class, 'index']);

//Route::post('/single_match', [SingleMatchesController::class, 'store']);
