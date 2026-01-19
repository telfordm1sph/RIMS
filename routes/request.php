<?php

use App\Http\Controllers\RequestController;
use Illuminate\Support\Facades\Route;

$app_name = $app_name ?? env('APP_NAME', 'app');

Route::prefix($app_name)
    ->group(function () {
        Route::get('/request', [RequestController::class, 'index'])->name('request.form');

        Route::get('/requestTypes', [RequestController::class, 'getRequestTypes'])->name('request-types.list');

        Route::get('/staff/{empId}', [RequestController::class, 'getStaffList'])->name('staff.list');

        Route::get('/locations', [RequestController::class, 'getLocations'])->name('locations.list');

        Route::post('/store', [RequestController::class, 'store'])->name('request.store');

        Route::get('/request/table', [RequestController::class, 'getRequestsTable'])->name('request.table');

        // Add this new route for viewing individual requests
        Route::get('/requests/show/{id}', [RequestController::class, 'show'])->name('request.show');

        Route::post('/request/action', [RequestController::class, 'RequestAction'])->name('request.action');
    });
