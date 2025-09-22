<?php

use App\Http\Controllers\ApartmentController;
use App\Http\Controllers\BuildingController;
use App\Http\Controllers\BuildingResidentController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\HouseHubController;

Route::post('/register', [UserController::class, 'register']);
Route::post('/login', [UserController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [UserController::class, 'logout']);
    Route::delete('/destroy', [UserController::class, 'destroy']);
});

Route::middleware('auth:sanctum')->prefix('/profile')->group(function () {
    Route::get('/', [UserController::class, 'profile']);
    Route::patch('/update', [UserController::class, 'updateProfile']);
    Route::patch('/update/password', [UserController::class, 'updatePassword']);
});

Route::middleware('auth:sanctum')->post('/email/verification-notification', [UserController::class, 'sendVerificationEmail']);
Route::get('/verify-email/{id}/{hash}', [UserController::class, 'verifyEmail'])
    ->middleware(['signed'])
    ->name('verification.verify');

Route::middleware('auth:sanctum')->prefix('/house-hub')->group(function () {
    Route::post('/store', [HouseHubController::class, 'store']);
    Route::get('/show/{househub}', [HouseHubController::class, 'show']);
    Route::patch('/update/{houseHub}', [HouseHubController::class, 'update']);
    Route::get('/show/buildings/{houseHub}', [HouseHubController::class, 'showBuildings']);
    Route::delete('/destroy/{houseHub}', [HouseHubController::class, 'destroy']);
});

Route::middleware('auth:sanctum')->prefix('buildings')->group(function () {
    Route::post('/store', [BuildingController::class, 'store']);
    Route::patch('/update/{building}', [BuildingController::class, 'update']);
    Route::get('/show/{building}', [BuildingController::class, 'show']);
    Route::delete('/destroy/{building}', [BuildingController::class, 'destroy']);
});

Route::middleware('auth:sanctum')->prefix('/apartments')->group(function () {
    Route::post('/store', [ApartmentController::class, 'store']);
    Route::patch('/update/{apartment}', [ApartmentController::class, 'update']);
});
