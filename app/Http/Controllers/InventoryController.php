<?php

namespace App\Http\Controllers;

use App\Services\InventoryService;
use Illuminate\Http\Request;

class InventoryController extends Controller
{
    protected InventoryService $inventoryService;

    public function __construct(InventoryService $inventoryService)
    {
        $this->inventoryService = $inventoryService;
    }

    // Existing method
    public function getHostNames(Request $request)
    {
        $type_of_request = $request->input('type_of_request');
        $locations = $this->inventoryService->getHostNames($type_of_request);
        return response()->json($locations);
    }

    // New method to fetch hardware details
    public function getHardwareDetails(Request $request)
    {
        // dd($request->all());
        $search = $request->input('search'); // hostname or serial

        if (!$search) {
            return response()->json(['success' => false, 'message' => 'No hostname or serial provided']);
        }

        $hardware = $this->inventoryService->getHardwareDetails($search);

        if (!$hardware) {
            return response()->json(['success' => false, 'message' => 'Hardware not found']);
        }

        return response()->json(['success' => true, 'item' => $hardware]);
    }
}
