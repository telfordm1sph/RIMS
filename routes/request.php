<?php

use App\Http\Controllers\RequestController;
use Illuminate\Support\Facades\Route;




$app_name = $app_name ?? env('APP_NAME', 'app');
// dd($app_name);
Route::prefix($app_name)

    ->group(function () {


        Route::get('/jorf', [RequestController::class, 'index'])->name('request.form');

        Route::get('/requestTypes', [RequestController::class, 'getRequestTypes'])->name('request-types.list');


        Route::get('/staff/{empId}', [RequestController::class, 'getStaffList'])->name('staff.list');

        Route::get('/locations', [RequestController::class, 'getLocations'])->name('locations.list');

        Route::post('/store', [RequestController::class, 'store'])->name('request.store');
    });
