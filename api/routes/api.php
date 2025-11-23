<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/users/me', function (Request $request) {
    return $request->user();
    });
    Route::post('logout', [AuthController::class, 'logout']);
    });

Route::get('/metadata', function (Request $request) {
    //abort(500, 'Something went wrong');
    return ["name" => "DAD 2025/26 Worksheet API", "version" => "0.0.1"];
});