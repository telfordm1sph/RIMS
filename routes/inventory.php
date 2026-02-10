<?php

use App\Http\Controllers\InventoryController;
use Illuminate\Support\Facades\Route;

$app_name = $app_name ?? env('APP_NAME', 'app');

Route::prefix($app_name)->group(function () {

    // Local repository routes
    Route::get('/hostnames', [InventoryController::class, 'getHostNames'])->name('hostnames.list');
    Route::get('/hardware/details', [InventoryController::class, 'getHardwareDetails'])->name('hardware.details');

    // Parts cascading options (query params)
    Route::get('/parts-options', [InventoryController::class, 'partsOptions'])->name('hardware.parts.options');
    Route::get('/parts-inventory', [InventoryController::class, 'partsInventory'])->name('hardware.parts.inventory');

    // Software cascading options (query params)
    Route::get('/software-options', [InventoryController::class, 'softwareOptions'])->name('hardware.software.options');
    Route::get('/software-licenses', [InventoryController::class, 'softwareLicenses'])->name('hardware.software.licenses');
    Route::get('/software-inventory-options', [InventoryController::class, 'softwareInventoryOptions'])->name('software.inventory.options');

    // Issuance routes
    Route::post('/issuance/create', [InventoryController::class, 'createIssuance'])->name('issuance.create');
    Route::post('/issuance/items/create', [InventoryController::class, 'createItemIssuance'])->name('issuance.items.create');
    Route::get('/issuance', [InventoryController::class, 'getIssuances'])->name('issuance.list');
    Route::get('/issuance/{id}', [InventoryController::class, 'getIssuanceDetails'])->name('issuance.details');
    Route::post('/issuance/{id}/acknowledge', [InventoryController::class, 'acknowledgeIssuance'])->name('issuance.acknowledge');

    // Hardware parts and software (by ID) - KEEP THESE LAST
    Route::get('/{hardwareId}/full-details', [InventoryController::class, 'getFullHardwareDetails'])->name('hardware.full.details');
    Route::get('/{hardwareId}/parts', [InventoryController::class, 'parts'])->name('hardware.parts.list');
    Route::get('/{hardwareId}/software', [InventoryController::class, 'software'])->name('hardware.software.list');
    Route::put('/{hardwareId}/update', [InventoryController::class, 'updateHardware'])->name('hardware.update');
});
