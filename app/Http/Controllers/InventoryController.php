<?php

namespace App\Http\Controllers;

use App\Services\InventoryService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class InventoryController extends Controller
{
    protected InventoryService $inventoryService;

    public function __construct(InventoryService $inventoryService)
    {
        $this->inventoryService = $inventoryService;
    }

    /**
     * Get hostnames from local repository
     */
    public function getHostNames(Request $request)
    {
        $type_of_request = $request->input('type_of_request');
        $hostnames = $this->inventoryService->getHostNames($type_of_request);
        return response()->json($hostnames);
    }

    /**
     * Get hardware details from local repository
     */
    public function getHardwareDetails(Request $request)
    {
        $search = $request->input('search');

        if (!$search) {
            return response()->json(['success' => false, 'message' => 'No hostname or serial provided']);
        }

        $hardware = $this->inventoryService->getHardwareDetails($search);

        if (!$hardware) {
            return response()->json(['success' => false, 'message' => 'Hardware not found']);
        }

        return response()->json(['success' => true, 'item' => $hardware]);
    }

    /**
     * Get parts options - read filters from query parameter 'f'
     */
    public function partsOptions(Request $request)
    {
        // DEBUG: Log what we received
        Log::info('System B Controller partsOptions', [
            'query_f' => $request->query('f'),
            'all_query' => $request->query(),
            'full_url' => $request->fullUrl()
        ]);

        $filters = $request->query('f');
        $options = $this->inventoryService->partsOptions($filters);

        // DEBUG: Log what we're returning
        Log::info('System B Controller partsOptions response', [
            'options' => $options
        ]);

        return response()->json($options);
    }

    /**
     * Get parts inventory - read filters from query parameter 'f'
     */
    public function partsInventory(Request $request)
    {
        $filters = $request->query('f');
        $inventory = $this->inventoryService->partsInventory($filters);
        return response()->json($inventory);
    }

    /**
     * Get software options - read filters from query parameter 'f'
     */
    public function softwareOptions(Request $request)
    {
        $filters = $request->query('f');
        $options = $this->inventoryService->softwareOptions($filters);
        return response()->json($options);
    }

    /**
     * Get software licenses - read filters from query parameter 'f'
     */
    public function softwareLicenses(Request $request)
    {
        $filters = $request->query('f');
        $licenses = $this->inventoryService->softwareLicenses($filters);
        return response()->json($licenses);
    }

    /**
     * Get software inventory options from external API
     */
    public function softwareInventoryOptions()
    {
        $options = $this->inventoryService->softwareInventoryOptions();
        return response()->json($options);
    }

    public function getFullHardwareDetails($hardwareId)
    {
        $parts = $this->inventoryService->getFullHardwareDetails($hardwareId);
        return response()->json($parts);
    }
    /**
     * Get hardware parts list
     */
    public function parts($hardwareId)
    {
        $parts = $this->inventoryService->getPartsList($hardwareId);
        return response()->json($parts);
    }

    /**
     * Get hardware software list
     */
    public function software($hardwareId)
    {
        $softwares = $this->inventoryService->getSoftwaresList($hardwareId);
        return response()->json($softwares);
    }

    /**
     * Update hardware with parts and software
     */
    public function updateHardware($hardwareId, Request $request)
    {
        $data = $request->all();
        $response = $this->inventoryService->updateHardware($hardwareId, $data);
        return response()->json($response);
    }
}
