<?php

namespace App\Http\Controllers;

use App\Services\IssuanceService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class IssuanceController extends Controller
{
    protected IssuanceService $issuanceService;

    public function __construct(IssuanceService $issuanceService)
    {
        $this->issuanceService = $issuanceService;
    }

    public function getIssuanceTable()
    {
        return Inertia::render(
            'Issuance/IssuanceTable'
        );
    }
    public function getIssuanceItemsTable()
    {
        return Inertia::render(
            'Issuance/IssuanceItemsTable'
        );
    }
    /**
     * Create whole unit issuance
     */
    public function createIssuance(Request $request)
    {
        $data = $request->all();
        $response = $this->issuanceService->createIssuance($data);
        return response()->json($response);
    }

    /**
     * Create individual item issuance
     */
    public function createItemIssuance(Request $request)
    {
        $data = $request->all();
        $response = $this->issuanceService->createItemIssuance($data);
        return response()->json($response);
    }

    /**
     * Get issuances - read filters from query parameter 'f'
     */
    public function getIssuances(Request $request)
    {
        $filters = $request->query('f'); // base64 string
        $decodedFilters = $filters ? json_decode(base64_decode($filters), true) : [];

        $issuances = $this->issuanceService->getIssuances($decodedFilters);
        return response()->json($issuances);
    }

    public function getIssuanceItems(Request $request)
    {
        $filters = $request->query('f'); // base64 string
        $decodedFilters = $filters ? json_decode(base64_decode($filters), true) : [];

        $issuanceItems = $this->issuanceService->getIssuanceItems($decodedFilters);
        return response()->json($issuanceItems);
    }
    public function acknowledgeIssuance($id, Request $request)
    {
        $data = $request->all();
        $response = $this->issuanceService->acknowledgeIssuance($id, $data);
        return response()->json($response);
    }
}
