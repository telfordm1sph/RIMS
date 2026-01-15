<?php

namespace App\Http\Controllers;

use App\Services\RequestTypeService;
use App\Services\UserRoleService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RequestController extends Controller
{
    protected RequestTypeService $requestTypesService;
    protected UserRoleService $userRoleService;
    public function __construct(RequestTypeService $requestTypesService, UserRoleService $userRoleService)
    {
        $this->requestTypesService = $requestTypesService;
        $this->userRoleService = $userRoleService;
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
}
