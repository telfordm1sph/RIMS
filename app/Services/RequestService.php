<?php

namespace App\Services;

use App\Constants\ItemStatus;
use App\Constants\Status;
use App\Models\Location;
use App\Models\Masterlist;
use App\Models\User;
use App\Repositories\RequestRepository;
use App\Repositories\UserRepository;
use Illuminate\Support\Facades\DB;

class RequestService
{
    protected RequestRepository $repository;
    protected UserRepository $userRepository;

    public function __construct(RequestRepository $repository, UserRepository $userRepository)
    {
        $this->repository = $repository;
        $this->userRepository = $userRepository;
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
        $currentEmpId = $empData['emp_id'] ?? null;

        // ----- Apply role filters -----
        $roleResult = $this->applyRoleFilters($this->repository->query(), $empData);
        $tableQuery = $roleResult['query'];
        $role       = $roleResult['role']; // Get the active role

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

        // ----- Format table data with per-request actions -----
        // ----- Format table data with per-request actions -----
        $data = collect($paginated->items())->map(function ($request) use ($role, $currentEmpId) {
            // Convert request to array for consistency
            $requestArray = is_array($request) ? $request : $request->toArray();

            // Get actions specific to this request
            $requestActions = $this->getActionsForRequest($requestArray, $role, $currentEmpId);

            return array_merge(
                $requestArray,
                [
                    'status_label' => Status::getLabel($requestArray['status']),
                    'status_color' => Status::getColor($requestArray['status']),
                    'actions'      => $requestActions, // Per-request actions
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
                $itemArray['location_name'] = $locations[$item->location] ?? $item->location;
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
        $userRoles    = $empData['emp_user_roles'] ?? [];
        $actions      = [];
        $role         = null; // Add this to track which role is active

        // Convert to array if it's a string (for backward compatibility)
        if (is_string($userRoles)) {
            $userRoles = [$userRoles];
        }

        // ---- Operation Director (check first - higher priority) ----
        if (in_array('OPERATION_DIRECTOR', $userRoles) && $currentEmpId) {
            $requestorIds = Masterlist::where('ACCSTATUS', 1)
                ->where('EMPPOSITION', '>=', 2)
                ->pluck('EMPLOYID');

            if ($requestorIds->isEmpty()) {
                return ['query' => $query->whereRaw('1 = 0'), 'actions' => [], 'role' => null];
            }

            $query = $query->whereIn('requestor_id', $requestorIds);
            $role = 'OPERATION_DIRECTOR';

            return ['query' => $query, 'actions' => [], 'role' => $role];
        }

        // ---- Department Head ----
        if (in_array('DEPARTMENT_HEAD', $userRoles) && $currentEmpId) {
            $requestorIds = Masterlist::where(function ($q) use ($currentEmpId) {
                $q->where('APPROVER2', $currentEmpId)
                    ->orWhere('APPROVER3', $currentEmpId);
            })->pluck('EMPLOYID');

            if ($requestorIds->isEmpty()) {
                return ['query' => $query->whereRaw('1 = 0'), 'actions' => [], 'role' => null];
            }

            // Show ALL requests - no status filter
            $query = $query->whereIn('requestor_id', $requestorIds)
                ->where('requestor_id', '!=', $currentEmpId);

            $role = 'DEPARTMENT_HEAD';

            return ['query' => $query, 'actions' => [], 'role' => $role];
        }

        // ---- MIS Support ----
        if (in_array('MIS_SUPPORT', $userRoles)) {
            $actions = ['ISSUE'];
            $role = 'MIS_SUPPORT';
            return ['query' => $query->where('status', '>=', 2), 'actions' => $actions, 'role' => $role];
        }

        // ---- Requestor (OWN records only) ----
        if ($currentEmpId) {
            $actions = ['VIEW'];
            $role = 'REQUESTOR';
            return ['query' => $query->where('requestor_id', $currentEmpId), 'actions' => $actions, 'role' => $role];
        }

        // ---- Default (others) ----
        return ['query' => $query, 'actions' => $actions, 'role' => null];
    }
    /**
     * Get the active role for the user based on their empData
     */
    public function getRoleForUser(array $empData): array
    {
        $roleResult = $this->applyRoleFilters($this->repository->query(), $empData);
        return ['role' => $roleResult['role']];
    }

    /**
     * Get actions for a specific request based on role and request status
     */
    public function getActionsForSpecificRequest($request, $role, $currentEmpId): array
    {
        return $this->getActionsForRequest($request, $role, $currentEmpId);
    }

    /**
     * Helper method to determine actions for a request based on role and status
     */
    private function getActionsForRequest($request, $role, $currentEmpId): array
    {
        // Convert to array if it's an object
        $requestData = is_array($request) ? $request : $request->toArray();

        switch ($role) {
            case 'OPERATION_DIRECTOR':
                // Can approve/disapprove status 2 requests
                return $requestData['status'] == 2
                    ? ['APPROVE', 'DISAPPROVE', 'VIEW']
                    : ['VIEW'];

            case 'DEPARTMENT_HEAD':
                // Can approve/disapprove status 1 requests (not their own)
                if ($requestData['requestor_id'] != $currentEmpId && $requestData['status'] == 1) {
                    return ['APPROVE', 'DISAPPROVE', 'VIEW'];
                }
                return ['VIEW'];

            case 'MIS_SUPPORT':
                return ['ISSUE', 'VIEW'];

            case 'REQUESTOR':
            default:
                return ['VIEW'];
        }
    }
    public function requestAction(
        string $requestId,
        array $empData,
        string $actionType = 'APPROVE',
        string $remarks = '',
    ): bool {
        $actionType = strtoupper($actionType);

        if (!in_array($actionType, ['APPROVE', 'DISAPPROVE', 'ACKNOWLEDGE'])) {
            throw new \InvalidArgumentException('Invalid action type');
        }

        if (empty($remarks)) {
            throw new \InvalidArgumentException('Remarks are required for this action.');
        }

        return DB::transaction(function () use ($requestId, $empData, $actionType, $remarks) {

            $request = $this->repository->getRequestById($requestId);
            if (!$request) return false;

            // Get user roles directly from empData array
            $userRoles = $empData['emp_user_roles'] ?? [];

            // Convert to array if it's a string
            if (is_string($userRoles)) {
                $userRoles = [$userRoles];
            }

            // Determine the actual action based on role and action type
            $effectiveAction = $actionType;

            if ($actionType === 'APPROVE') {
                // Check Operation Director first (higher priority)
                if (in_array('OPERATION_DIRECTOR', $userRoles)) {
                    $effectiveAction = 'APPROVE';
                } elseif (in_array('DEPARTMENT_HEAD', $userRoles)) {
                    // Check if requestor has Operation Director as their only approver
                    if ($this->userRepository->hasOperationDirectorAsOnlyApprover($request->requestor_id)) {
                        $effectiveAction = 'APPROVE';
                    } else {
                        $effectiveAction = 'TRIAGE';
                    }
                }
            }

            // Map action to status
            $statusMap = [
                'TRIAGE'        => 2,
                'APPROVE'       => 3,
                'DISAPPROVE'    => 4,
                'ACKNOWLEDGE'   => 5,
            ];

            $newStatus = $statusMap[$effectiveAction] ?? null;

            if (is_null($newStatus)) {
                throw new \InvalidArgumentException("No status mapping found for action $effectiveAction");
            }

            $updateData = [
                'status' => $newStatus,
            ];

            $this->repository->updateRequest($request, $updateData);

            return true;
        });
    }
    /**
     * Update request status based on its items
     * If all items are ISSUED (2) -> request becomes ISSUED (4)
     * If there are any PENDING (1) items -> request stays APPROVED (3)
     */
    public function updateRequestStatusBasedOnItems(int $requestId): array
    {
        try {
            $request = $this->repository->findById($requestId);

            if (!$request) {
                return [
                    'success' => false,
                    'message' => 'Request not found'
                ];
            }

            // Only update if request is in APPROVED status
            // You might want to also check if it's in other statuses that can be issued
            if (!in_array($request->status, [Status::APPROVED, Status::TRIAGED])) {
                return [
                    'success' => false,
                    'message' => 'Request is not in a status that can be issued',
                    'current_status' => $request->status
                ];
            }

            // Get all items for this request
            $items = $request->items;

            if ($items->isEmpty()) {
                return [
                    'success' => false,
                    'message' => 'No items found for this request'
                ];
            }

            // Check item statuses
            $hasPending = false;
            $allIssued = true;

            foreach ($items as $item) {
                if ($item->item_status == ItemStatus::PENDING) { // 1 = PENDING
                    $hasPending = true;
                    $allIssued = false;
                    break; // Can break early since we found a pending item
                }

                if ($item->item_status != ItemStatus::ISSUED) { // If any item is not ISSUED (2)
                    $allIssued = false;
                }
            }

            $newStatus = null;
            $statusChanged = false;

            if ($hasPending) {
                // There are still pending items -> stay at APPROVED (3)
                if ($request->status != Status::APPROVED) {
                    $newStatus = Status::APPROVED;
                    $statusChanged = true;
                }
            } elseif ($allIssued) {
                // All items are ISSUED (2) -> request becomes ISSUED (4)
                if ($request->status != Status::ISSUED) {
                    $newStatus = Status::ISSUED;
                    $statusChanged = true;
                }
            }

            // Update request status if changed
            if ($statusChanged && $newStatus !== null) {
                $this->repository->updateRequest($request, [
                    'status' => $newStatus,
                    'updated_at' => now()
                ]);

                return [
                    'success' => true,
                    'message' => "Request status updated to " . Status::getLabel($newStatus),
                    'new_status' => $newStatus,
                    'new_status_label' => Status::getLabel($newStatus)
                ];
            }

            return [
                'success' => true,
                'message' => 'Request status is already correct',
                'new_status' => $request->status,
                'new_status_label' => Status::getLabel($request->status)
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Error updating request status: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Update request item status
     */
    public function updateRequestItemStatus(int $itemId, int $status): array
    {
        try {
            // Validate status
            if (!in_array($status, [ItemStatus::PENDING, ItemStatus::ISSUED, ItemStatus::CANCELED])) {
                return [
                    'success' => false,
                    'message' => 'Invalid item status'
                ];
            }

            $item = $this->repository->getRequestItemById($itemId);

            if (!$item) {
                return [
                    'success' => false,
                    'message' => 'Request item not found',
                ];
            }

            $oldStatus = $item->item_status;
            $updated = $this->repository->updateRequestItemStatus($itemId, $status);

            if ($updated) {
                $result = [
                    'success' => true,
                    'message' => 'Request item status updated successfully',
                    'item_id' => $itemId,
                    'old_status' => $oldStatus,
                    'new_status' => $status
                ];

                // After updating the item, check and update the parent request status
                // Only do this if the item status changed to/from ISSUED or if all items might now be issued
                if ($status == ItemStatus::ISSUED || $oldStatus == ItemStatus::ISSUED) {
                    $requestUpdateResult = $this->updateRequestStatusBasedOnItems($item->request_id);

                    $result['request_status_updated'] = $requestUpdateResult['success'];
                    $result['request_new_status'] = $requestUpdateResult['new_status'] ?? null;
                    $result['request_new_status_label'] = $requestUpdateResult['new_status_label'] ?? null;
                    $result['request_message'] = $requestUpdateResult['message'] ?? null;
                }

                return $result;
            }

            return [
                'success' => false,
                'message' => 'Failed to update request item status',
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Error updating request item status: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Bulk update request items status
     */
    public function bulkUpdateRequestItemsStatus(array $itemIds, int $status): array
    {
        try {
            DB::beginTransaction();

            $requestIds = [];
            $updatedCount = 0;
            $results = [];

            foreach ($itemIds as $itemId) {
                $result = $this->updateRequestItemStatus($itemId, $status);
                $results[] = $result;

                if ($result['success']) {
                    $updatedCount++;
                    // Get the item to find its request_id
                    $item = $this->repository->getRequestItemById($itemId);
                    if ($item) {
                        $requestIds[$item->request_id] = true;
                    }
                }
            }

            // Update status for all affected requests
            $requestResults = [];
            foreach (array_keys($requestIds) as $requestId) {
                $requestResults[] = $this->updateRequestStatusBasedOnItems($requestId);
            }

            DB::commit();

            return [
                'success' => true,
                'message' => "Updated {$updatedCount} out of " . count($itemIds) . " items",
                'updated_count' => $updatedCount,
                'total_items' => count($itemIds),
                'item_results' => $results,
                'requests_updated' => $requestResults
            ];
        } catch (\Exception $e) {
            DB::rollBack();
            return [
                'success' => false,
                'message' => 'Error in bulk update: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Get request by request number
     */
    public function getRequestByNumber(string $requestNumber): ?array
    {
        $request = $this->repository->getRequestByNumber($requestNumber);

        if (!$request) {
            return null;
        }

        return $this->getRequestById($request->id, session('emp_data') ?? []);
    }

    /**
     * Get request ID by number
     */
    public function getRequestIdByNumber(string $requestNumber): ?int
    {
        $request = $this->repository->getRequestByNumber($requestNumber);
        return $request ? $request->id : null;
    }

    /**
     * Check if request can be fully issued
     */
    public function canRequestBeIssued(int $requestId): array
    {
        $request = $this->repository->findById($requestId);

        if (!$request) {
            return [
                'can_issue' => false,
                'reason' => 'Request not found'
            ];
        }

        // Check if request is in APPROVED status
        if ($request->status != Status::APPROVED) {
            return [
                'can_issue' => false,
                'reason' => 'Request must be in Approved status to issue items'
            ];
        }

        // Check if there are any pending items
        $hasPending = false;
        foreach ($request->items as $item) {
            if ($item->item_status == ItemStatus::PENDING) {
                $hasPending = true;
                break;
            }
        }

        if (!$hasPending) {
            return [
                'can_issue' => false,
                'reason' => 'No pending items to issue'
            ];
        }

        return [
            'can_issue' => true,
            'reason' => 'Request can be issued',
            'pending_items_count' => $request->items->where('item_status', ItemStatus::PENDING)->count()
        ];
    }
}
