<?php

namespace App\Services;

use App\Constants\ItemStatus;
use App\Constants\Status;
use App\Models\Location;
use App\Models\Masterlist;
use App\Models\User;
use App\Repositories\RequestRepository;
use Illuminate\Support\Facades\DB;

class RequestService
{
    protected RequestRepository $repository;

    public function __construct(RequestRepository $repository)
    {
        $this->repository = $repository;
    }

    public function submitRequest(array $requestorData, array $cart): array
    {
        DB::beginTransaction();

        try {
            // 1️⃣ Create main request
            $request = $this->repository->createRequest([
                'request_number' => $this->generateRequestNumber(),
                'requestor_id' => $requestorData['requestor_id'],
                'requestor_name' => $requestorData['requestor_name'],
                'requestor_department' => $requestorData['requestor_department'] ?? null,
                'requestor_prodline' => $requestorData['requestor_prodline'] ?? null,
                'requestor_station' => $requestorData['requestor_station'] ?? null,
                'status' => 1, // pending
                'created_by' => $requestorData['created_by'],
            ]);

            // 2️⃣ Create request items
            foreach ($cart as $cartItem) {
                $items = $this->prepareItems($request->id, $cartItem);
                foreach ($items as $itemData) {
                    $this->repository->createRequestItem($itemData);
                }
            }

            DB::commit();

            return [
                'success' => true,
                'request_number' => $request->request_number,
                'request_id' => $request->id,
                'message' => 'Request submitted successfully',
            ];
        } catch (\Exception $e) {
            DB::rollback();
            return [
                'success' => false,
                'message' => 'Failed to submit request: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Prepare items for per-item and bulk modes
     */
    protected function prepareItems(int $requestId, array $cartItem): array
    {
        $result = [];

        if ($cartItem['mode'] === 'bulk' && isset($cartItem['bulkData']['items'])) {
            $bulkData = $cartItem['bulkData'];
            $issuedTo = $bulkData['issued_to'];

            if (is_numeric($issuedTo)) {
                $exists = Masterlist::where('EMPLOYID', $issuedTo)->exists();
                if (!$exists) $issuedTo = null;
            }

            foreach ($bulkData['items'] as $bulkItem) {
                $result[] = [
                    'request_id' => $requestId,
                    'category' => $cartItem['category'],
                    'type_of_request' => $bulkItem['name'],
                    'request_mode' => 'bulk',
                    'issued_to' => $issuedTo,
                    'location' => $bulkData['location'] ?? null,
                    'quantity' => $bulkItem['qty'] ?? 1,
                    'purpose_of_request' => $bulkData['purpose'] ?? null,
                    'item_status' => 1,
                ];
            }
        }

        if ($cartItem['mode'] === 'per-item' && isset($cartItem['items'])) {
            foreach ($cartItem['items'] as $item) {
                $issuedTo = $item['issued_to'] ?? null;

                if (is_numeric($issuedTo)) {
                    $exists = Masterlist::where('EMPLOYID', $issuedTo)->exists();
                    if (!$exists) $issuedTo = null;
                }

                $result[] = [
                    'request_id' => $requestId,
                    'category' => $cartItem['category'],
                    'type_of_request' => $cartItem['name'] ?? null,
                    'request_mode' => 'per-item',
                    'issued_to' => $issuedTo,
                    'location' => $item['location'] ?? null,
                    'quantity' => $item['qty'] ?? 1,
                    'purpose_of_request' => $cartItem['purpose'] ?? null,
                    'item_status' => 1,
                ];
            }
        }

        return $result;
    }

    protected function generateRequestNumber(): string
    {
        return $this->repository->generateRequestNumber();
    }

    public function getRequestsTable(array $filters, array $empData): array
    {
        // ----- Apply role filters -----
        $roleResult = $this->applyRoleFilters($this->repository->query(), $empData);
        $tableQuery = $roleResult['query'];
        $actions    = $roleResult['actions'];

        $countResult = $this->applyRoleFilters($this->repository->query(), $empData);
        $countQuery  = $countResult['query'];

        // ----- Apply status filter -----
        if (!empty($filters['status']) && $filters['status'] !== 'all') {
            $tableQuery->where('status', $filters['status']);
        }

        // ----- Apply requestor_name filter -----
        if (!empty($filters['requestor_name'])) {
            $tableQuery->where('requestor_name', $filters['requestor_name']);
        }

        // ----- Apply search filter -----
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $tableQuery->where(function ($q) use ($search) {
                $q->where('request_number', 'like', "%{$search}%")
                    ->orWhere('requestor_name', 'like', "%{$search}%")
                    ->orWhere('requestor_department', 'like', "%{$search}%")
                    ->orWhere('requestor_prodline', 'like', "%{$search}%")
                    ->orWhere('details', 'like', "%{$search}%");
            });
        }

        // ----- Sorting -----
        $sortField = $filters['sortField'] ?? 'created_at';
        $sortOrder = $filters['sortOrder'] ?? 'desc';
        $tableQuery->orderBy($sortField, $sortOrder);

        // ----- Pagination -----
        $page     = $filters['page'] ?? 1;
        $pageSize = $filters['pageSize'] ?? 10;
        $paginated = $tableQuery->paginate($pageSize, ['*'], 'page', $page);

        // ----- Format table data -----
        $data = collect($paginated->items())->map(function ($request) use ($actions) {
            return array_merge(
                $request->toArray(),
                [
                    'status_label' => Status::getLabel($request->status),
                    'status_color' => Status::getColor($request->status),
                    'actions'      => $actions, // <-- add allowed actions here
                ]
            );
        });

        // ----- Status counts -----
        $countQuery->getQuery()->orders = [];
        $statusCounts = $this->repository->getStatusCountsFromQuery($countQuery);

        return [
            'data' => $data,
            'pagination' => [
                'current'     => $paginated->currentPage(),
                'currentPage' => $paginated->currentPage(),
                'lastPage'    => $paginated->lastPage(),
                'total'       => $paginated->total(),
                'perPage'     => $paginated->perPage(),
                'pageSize'    => $paginated->perPage(),
            ],
            'statusCounts' => $statusCounts,
            'filters'      => $filters,
        ];
    }

    public function getRequestById(int $id, array $empData): ?array
    {
        // Get request with items
        $request = $this->repository->findById($id);

        if (!$request) {
            return null;
        }

        // Collect all employee IDs and location IDs from request items
        $empIds = [];
        $locationIds = [];
        foreach ($request->items as $item) {
            if (!empty($item->issued_to)) {
                $empIds[] = $item->issued_to;
            }
            if (!empty($item->location)) {
                $locationIds[] = $item->location;
            }
        }

        // Fetch employee names
        $users = [];
        if (!empty($empIds)) {
            $users = User::whereIn('EMPLOYID', $empIds)
                ->pluck('EMPNAME', 'EMPLOYID')
                ->toArray();
        }

        // Fetch location names
        $locations = [];
        if (!empty($locationIds)) {
            $locations = Location::whereIn('id', $locationIds)
                ->pluck('location_name', 'id')
                ->toArray();
        }

        // Format items with employee names and location names
        $formattedItems = $request->items->map(function ($item) use ($users, $locations) {
            $itemArray = $item->toArray();

            // Add employee name if issued_to exists
            if (!empty($item->issued_to)) {
                $itemArray['issued_to_name'] = $users[$item->issued_to] ?? 'Unknown';
            } else {
                $itemArray['issued_to_name'] = null;
            }

            // Add location name if location exists
            if (!empty($item->location)) {
                $itemArray['location_name'] = $locations[$item->location] ?? 'Unknown';
            } else {
                $itemArray['location_name'] = null;
            }
            $itemArray['item_status_label'] = ItemStatus::getLabel($item->item_status);
            $itemArray['item_status_color'] = ItemStatus::getColor($item->item_status);
            return $itemArray;
        })->toArray();

        // Format the request data
        return array_merge(
            $request->toArray(),
            [
                'status_label' => Status::getLabel($request->status),
                'status_color' => Status::getColor($request->status),
                'items' => $formattedItems,
            ]
        );
    }
    /**
     * Apply role-based filters to a query.
     */
    protected function applyRoleFilters($query, array $empData): array
    {
        $currentEmpId = $empData['emp_id'] ?? null;
        $userRoles    = $empData['emp_user_roles'] ?? '';
        $systemRoles  = $empData['emp_system_roles'] ?? [];
        $actions      = [];

        // ---- Department Head ----
        if ($userRoles === 'DEPARTMENT_HEAD' && $currentEmpId) {
            $requestorIds = Masterlist::where(function ($q) use ($currentEmpId) {
                $q->where('APPROVER2', $currentEmpId)
                    ->orWhere('APPROVER3', $currentEmpId);
            })->pluck('EMPLOYID');

            if ($requestorIds->isEmpty()) {
                return ['query' => $query->whereRaw('1 = 0'), 'actions' => []];
            }

            $actions = ['APPROVE', 'DISAPPROVE'];
            return ['query' => $query->whereIn('requestor_id', $requestorIds), 'actions' => $actions];
        }

        // ---- Operation Director ----
        if ($userRoles === 'OPERATION_DIRECTOR' && $currentEmpId) {
            $requestorIds = Masterlist::where('ACCSTATUS', 1)
                ->where('EMPOSITION', '>=', 2)
                ->pluck('EMPLOYID');

            if ($requestorIds->isEmpty()) {
                return ['query' => $query->whereRaw('1 = 0'), 'actions' => []];
            }

            $actions = ['APPROVE', 'DISAPPROVE'];
            return [
                'query' => $query->where('status', '!=', 1)
                    ->whereIn('requestor_id', $requestorIds),
                'actions' => $actions
            ];
        }

        // ---- MIS Support ----
        if ($userRoles === 'MIS_SUPPORT') {
            $actions = ['ISSUE'];
            return ['query' => $query->where('status', '<', 2), 'actions' => $actions];
        }

        // ---- Requestor (OWN records only) ----
        if ($currentEmpId) {
            $actions = ['VIEW'];
            return ['query' => $query->where('requestor_id', $currentEmpId), 'actions' => $actions];
        }

        // ---- Default (others) ----
        return ['query' => $query, 'actions' => $actions];
    }
}
