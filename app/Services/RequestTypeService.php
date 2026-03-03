<?php

namespace App\Services;

use App\Repositories\RequestTypeRepository;
use Illuminate\Pagination\LengthAwarePaginator;

class RequestTypeService
{
    protected RequestTypeRepository $repository;

    public function __construct(RequestTypeRepository $repository)
    {
        $this->repository = $repository;
    }

    /**
     * Get all request types grouped by category
     */
    public function getAllGrouped(): array
    {
        return $this->repository->getAllGrouped();
    }

    /**
     * Get request types formatted for form
     */
    public function getRequestCatalog(): array
    {
        $requestTypes = $this->repository->getAllActive();

        $catalog = $requestTypes->groupBy('request_category')->map(function ($group) {
            return [
                'category' => $group->first()->request_category,
                'items' => $group->pluck('request_name')->toArray(),
            ];
        })->values()->toArray();

        return $catalog;
    }

    public function getLocationList()
    {
        return $this->repository->getLocationList();
    }

    /**
     * Get paginated request types for table display with filters
     */
    public function getAllForTable(int $perPage = 10, int $page = 1, array $filters = []): array
    {
        $paginator = $this->repository->getAllForTable($perPage, $page, $filters);

        return [
            'data' => $paginator->items(),
            'pagination' => [
                'current_page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'last_page' => $paginator->lastPage(),
                'from' => $paginator->firstItem(),
                'to' => $paginator->lastItem(),
            ]
        ];
    }

    /**
     * Create a new request type
     */
    public function create(array $data)
    {
        return $this->repository->create($data);
    }

    /**
     * Update an existing request type
     */
    public function update(int $id, array $data)
    {
        return $this->repository->update($id, $data);
    }

    /**
     * Delete a request type
     */
    public function delete(int $id): bool
    {
        return $this->repository->delete($id);
    }

    /**
     * Find request type by ID
     */
    public function findById(int $id)
    {
        return $this->repository->findById($id);
    }
}
