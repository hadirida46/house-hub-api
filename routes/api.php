<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;

Route::post('/register', [UserController::class, 'register']);
Route::post('/login', [UserController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [UserController::class, 'logout']);
    Route::delete('/destroy', [UserController::class, 'destroy']);
});

Route::middleware('auth:sanctum')->prefix('/profile')->group(function () {
    Route::get('/', [UserController::class, 'profile']);
    Route::put('/update', [UserController::class, 'updateProfile']);
    Route::post('/update/password', [UserController::class, 'updatePassword']);
});

Route::middleware('auth:sanctum')->post('/email/verification-notification', [UserController::class, 'sendVerificationEmail']);
    Route::get('/verify-email/{id}/{hash}', [UserController::class, 'verifyEmail'])
    ->middleware(['signed'])
    ->name('verification.verify');
