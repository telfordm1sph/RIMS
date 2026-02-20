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
        // Get employee from System B session
        $empData = session('emp_data');
        $employeeId = $empData['emp_id'] ?? null;

        if (!$employeeId) {
            return response()->json([
                'success' => false,
                'message' => 'Employee identification required.',
            ], 401);
        }

        // Decode frontend filters
        $filters = $request->query('f');
        $decodedFilters = $filters ? json_decode(base64_decode($filters), true) : [];

        // Pass employee_id separately in request body (not inside filters)
        $issuances = $this->issuanceService->getIssuances($decodedFilters, $employeeId);

        return response()->json($issuances);
    }


    public function acknowledgeIssuance($id, Request $request)
    {
        $data = $request->all();
        $response = $this->issuanceService->acknowledgeIssuance($id, $data);
        return response()->json($response);
    }
}
