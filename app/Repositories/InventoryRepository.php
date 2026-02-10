<?php

namespace App\Repositories;

use App\Models\Hardware;

class InventoryRepository
{
    public function getHostNames($type_of_request)
    {
        return Hardware::where('category', $type_of_request)
            ->select('hostname', 'serial_number')
            ->distinct()
            ->get();
    }

    // New method to fetch hardware details by hostname or serial_number
    public function getHardwareDetails($search)
    {
        $hardware = Hardware::where('hostname', $search)
            ->orWhere('serial_number', $search)
            ->first();

        if (!$hardware) {
            return null;
        }


        return $hardware;
    }
}
