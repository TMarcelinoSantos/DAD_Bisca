<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\SingleGameController;

Route::post('/login', [AuthController::class, 'login']);

// public endpoint to create a user
Route::post('/users', [UserController::class, 'store']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/users/me', function (Request $request) {
    return $request->user();
    });

    Route::post('logout', [AuthController::class, 'logout']);

    Route::apiResource('users', UserController::class)->except(['store']);

    Route::post('/user/theme', [UserController::class, 'updateTheme']);
    Route::post('/user/avatar', [UserController::class, 'updateAvatar']);
});

Route::get('/metadata', function (Request $request) {
    //abort(500, 'Something went wrong');
    return ["name" => "DAD 2025/26 Worksheet API", "version" => "0.0.1"];
});

Route::apiResources([
    'games_single' => SingleGameController::class
]);