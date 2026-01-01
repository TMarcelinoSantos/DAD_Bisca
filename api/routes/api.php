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
use App\Http\Controllers\HistoryController;

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

    Route::patch('/users/{user}/photo-url', [UserController::class, 'patchPhotoURL']);

    Route::apiResource('users', UserController::class)->except(['store']);
    Route::apiResource('matches', MatchController::class);
    Route::apiResource('games', GameController::class);
    Route::apiResource('matches.games', GameController::class)->shallow();

    Route::get('users/me/history', [HistoryController::class, 'index']);
    Route::get('users/me/history/{matchId}', [HistoryController::class, 'showMatch']);
    Route::get('history/{user}', [HistoryController::class, 'userHistory']);

    Route::post('/user/theme', [UserController::class, 'updateTheme']);
    Route::post('/user/avatar', [UserController::class, 'updateAvatar']);
    
    Route::post('/user/coins', [UserController::class, 'updateUserCoins']);
    Route::post('/user/coins/reward', [UserController::class, 'updateRewardCoins']);
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


//Route::post('/single_match', [SingleMatchesController::class, 'store']);
