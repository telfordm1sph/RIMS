<?php

use App\Http\Controllers\InventoryController;

use Illuminate\Support\Facades\Route;

$app_name = $app_name ?? env('APP_NAME', 'app');

Route::prefix($app_name)
    ->group(function () {


        Route::get('/hostnames', [InventoryController::class, 'getHostNames'])->name('hostnames.list');
        Route::get('/hardware/details', [InventoryController::class, 'getHardwareDetails'])->name('hardware.details');
    });
