<?php

use App\Http\Controllers\IssuanceController;
use Illuminate\Support\Facades\Route;

$app_name = $app_name ?? env('APP_NAME', 'app');

Route::prefix($app_name)
    ->group(function () {
        Route::get('/issuance', [IssuanceController::class, 'getIssuanceTable'])->name('issuance.table');
        Route::get('/issuance/items', [IssuanceController::class, 'getIssuanceItemsTable'])->name('issuance.items.table');
        // Issuance routes
        Route::post('/issuance/create', [IssuanceController::class, 'createIssuance'])->name('issuance.create');
        Route::post('/issuance/items/create', [IssuanceController::class, 'createItemIssuance'])->name('issuance.items.create');

        Route::get('/issuance/list', [IssuanceController::class, 'getIssuances'])
            ->name('issuance.list');
        Route::get('/issuance/items/list', [IssuanceController::class, 'getIssuanceItems'])
            ->name('issuance.items.list');
        Route::put('/issuance/acknowledge/{id}', [IssuanceController::class, 'acknowledgeIssuance'])
            ->name('issuance.acknowledge');
    });
