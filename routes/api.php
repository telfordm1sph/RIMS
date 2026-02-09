<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\InventoryApiTestController;
use App\Http\Controllers\InventoryController;

Route::get('/test-inventory-api', [InventoryApiTestController::class, 'test']);
Route::get('/test-parts-options', [InventoryController::class, 'partsOptions']);
Route::get('/test-parts-list', [InventoryController::class, 'getPartsList'])->name('parts.list');
