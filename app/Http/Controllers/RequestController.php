<?php

namespace App\Http\Controllers;

use App\Services\RequestService;
use App\Services\RequestTypeService;
use App\Services\UserRoleService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RequestController extends Controller
{
    protected RequestTypeService $requestTypesService;
    protected UserRoleService $userRoleService;
    protected RequestService $requestService;
    public function __construct(RequestTypeService $requestTypesService, UserRoleService $userRoleService, RequestService $requestService)
    {
        $this->requestTypesService = $requestTypesService;
        $this->userRoleService = $userRoleService;
        $this->requestService = $requestService;
    }

    public function index(Request $request)
    {
        return Inertia::render('Requests/Form');
    }

    public function getRequestTypes()
    {
        $catalog = $this->requestTypesService->getRequestCatalog();
        return response()->json($catalog);
    }
    public function getEmployees()
    {
        $employees = $this->userRoleService->getEmployees();

        return response()->json([
            'success' => true,
            'employees' => $employees,
        ]);
    }
    public function getStaffList(string $empId)
    {
        $staffList = $this->userRoleService->getStaffList($empId);
        return response()->json([
            'success' => true,
            'employees' => $staffList,
        ]);
    }
    public function getLocations()
    {
        $locations = $this->requestTypesService->getLocationList();
        return response()->json($locations);
    }
    // Controller
    public function store(Request $request)
    {
        // Validate required top-level fields
        $request->validate([
            'cart' => 'required|array|min:1',
            'cart.*.category' => 'required|string',
            'cart.*.mode' => 'required|in:per-item,bulk',
        ]);

        $empData = session('emp_data');

        $requestorData = [
            'requestor_id' => $empData['emp_id'] ?? $empData['EMPLOYID'],
            'requestor_name' => $empData['emp_name'] ?? $empData['EMPNAME'],
            'requestor_department' => $empData['emp_dept'] ?? null,
            'requestor_prodline' => $empData['emp_prodline'] ?? null,
            'requestor_station' => $empData['emp_station'] ?? null,
            'status' => 1,
            'created_by' => $empData['emp_id'] ?? $empData['EMPLOYID'],
        ];

        // Pass the full cart, not just the validated keys
        $cartItems = $request->input('cart');

        $result = $this->requestService->submitRequest($requestorData, $cartItems);

        return response()->json($result, $result['success'] ? 200 : 500);
    }
    public function getRequestsTable(Request $request)
    {
        $empData = session('emp_data');
        // Decode base64 filters
        $filters = $this->decodeFilters($request->input('f', ''));
        // dd($filters);
        // Validate and set defaults
        $filters = [
            'page' => (int) ($filters['page'] ?? 1),
            'pageSize' => (int) ($filters['pageSize'] ?? 10),
            'search' => trim($filters['search'] ?? ''),
            'sortField' => $filters['sortField'] ?? 'created_at',
            'sortOrder' => $filters['sortOrder'] ?? 'desc',
            'status' => $filters['status'] ?? '',
            'requestType' => $filters['requestType'] ?? '',
        ];
        // dd($empData);
        $result = $this->requestService->getRequestsTable($filters, $empData);
        // dd($result);
        return Inertia::render('Requests/RequestTable', [
            'requests' => $result['data'],
            'pagination' => $result['pagination'],
            'statusCounts' => $result['statusCounts'],
            'filters' => $result['filters'],
        ]);
    }
    public function show(Request $request, $id)
    {
        $empData = session('emp_data');

        // Decode ID
        $decodedId = base64_decode($id);
        if (!is_numeric($decodedId)) {
            abort(404);
        }

        // Decode actions
        $actions = [];
        if ($request->filled('actions')) {
            $actions = json_decode(
                base64_decode($request->input('actions')),
                true
            ) ?? [];
        }

        $request = $this->requestService->getRequestById((int) $decodedId, $empData);

        if (!$request) {
            abort(404);
        }

        return Inertia::render('Requests/RequestDetailView', [
            'request' => $request,
            'actions' => $actions,
        ]);
    }

    protected function decodeFilters(string $encoded): array
    {
        $decoded = base64_decode($encoded);
        return $decoded ? json_decode($decoded, true) : [];
    }
}
