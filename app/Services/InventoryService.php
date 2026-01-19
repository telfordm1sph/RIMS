<?php

namespace App\Services;

use App\Repositories\InventoryRepository;

class InventoryService
{
    protected InventoryRepository $inventoryRepository;

    public function __construct(InventoryRepository $inventoryRepository)
    {
        $this->inventoryRepository = $inventoryRepository;
    }

    public function getHostNames($type_of_request)
    {
        return $this->inventoryRepository->getHostNames($type_of_request);
    }

    // New method to get hardware details
    public function getHardwareDetails($search)
    {
        return $this->inventoryRepository->getHardwareDetails($search);
    }
}
