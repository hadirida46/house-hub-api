<?php

use App\Http\Controllers\ApartmentController;
use App\Http\Controllers\BuildingController;
use App\Http\Controllers\BuildingResidentController;
use App\Http\Controllers\RoleController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\HouseHubController;

Route::post('/register', [UserController::class, 'register']);
Route::post('/login', [UserController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [UserController::class, 'logout']);
    Route::delete('/destroy', [UserController::class, 'destroy']);
    Route::get('/househubs', [UserController::class, 'getUserHouseHubs']);
});

//                      PROFILE ROUTES
Route::middleware('auth:sanctum')->prefix('/profile')->group(function () {
    Route::get('/', [UserController::class, 'profile']);
    Route::patch('/update', [UserController::class, 'updateProfile']);
    Route::patch('/update/password', [UserController::class, 'updatePassword']);
});

//                      VERIFICATION ROUTES
Route::middleware('auth:sanctum')->post('/email/verification-notification', [UserController::class, 'sendVerificationEmail']);
Route::get('/verify-email/{id}/{hash}', [UserController::class, 'verifyEmail'])
    ->middleware(['signed'])
    ->name('verification.verify');
Route::get('/accept-invite', [RoleController::class, 'acceptRole'])->name('accept-invite');

//                      HOUSE-HUB ROUTES
Route::middleware('auth:sanctum')->prefix('/house-hub')->group(function () {
    Route::post('/store', [HouseHubController::class, 'store']);
    Route::patch('/update/{houseHub}', [HouseHubController::class, 'update']);
    Route::get('/show/{househub}', [HouseHubController::class, 'show']);
    Route::get('/show/buildings/{houseHub}', [HouseHubController::class, 'showBuildings']);
    Route::delete('/destroy/{houseHub}', [HouseHubController::class, 'destroy']);
});

//                      BUILDING ROUTES
Route::middleware('auth:sanctum')->prefix('buildings')->group(function () {
    Route::post('/store', [BuildingController::class, 'store']);
    Route::patch('/update/{building}', [BuildingController::class, 'update']);
    Route::get('/show/{building}', [BuildingController::class, 'show']);
    Route::get('/show/apartments/{building}', [BuildingController::class, 'showApartments']);
    Route::delete('/destroy/{building}', [BuildingController::class, 'destroy']);
});

//                      APARTMENT ROUTES
Route::middleware('auth:sanctum')->prefix('/apartments')->group(function () {
    Route::post('/store', [ApartmentController::class, 'store']);
    Route::patch('/update/{apartment}', [ApartmentController::class, 'update']);
    Route::get('/show/{apartment}', [ApartmentController::class, 'show']);
    Route::get('/show/residents/{apartment}', [ApartmentController::class, 'showResidents']);
    Route::delete('/destroy/{apartment}', [ApartmentController::class, 'destroy']);
});

//                      RESIDENTS ROUTES
Route::middleware('auth:sanctum')->prefix('/residents')->group(function () {
    Route::post('/store', [BuildingResidentController::class, 'store']);
    Route::get('/show/{resident}', [BuildingResidentController::class, 'show']);
    Route::delete('/destroy/{resident}', [BuildingResidentController::class, 'destroy']);
});


//                      ROLES ROUTES
Route::middleware('auth:sanctum')->prefix('/roles')->group(function () {
    Route::post('/store', [RoleController::class, 'store']);
    Route::get('/show/{househub_id}', [RoleController::class, 'showRoles']);
    Route::delete('/destroy/{role}', [RoleController::class, 'destroyRole']);
});
