<?php

namespace App\Repositories;

use App\Models\Hardware;

class InventoryRepository
{
    public function getHostNames($type_of_request)
    {
        return Hardware::where('category', $type_of_request)
            ->select('hostname', 'serial')
            ->distinct()
            ->get();
    }

    // New method to fetch hardware details by hostname or serial
    public function getHardwareDetails($search)
    {
        $hardware = Hardware::with(['parts', 'software'])
            ->where('hostname', $search)
            ->orWhere('serial', $search)
            ->first();

        if (!$hardware) {
            return null;
        }

        // Format parts
        $hardware->parts_data = $hardware->parts
            ->groupBy('part_type')
            ->map(function ($group) {
                return $group->map(function ($p) {
                    return [
                        'part_type' => $p->part_type,
                        'brand' => $p->brand,
                        'model' => $p->model,
                        'serial' => $p->serial,
                        'details' => $p->details,
                        'remarks' => $p->remarks,
                    ];
                });
            });

        // Format software
        $hardware->software_data = $hardware->software
            ->keyBy('type')
            ->map(function ($s) {
                return [
                    'name' => $s->name,
                    'type' => $s->type,
                    'expiration_date' => $s->expiration_date,
                    'license_key' => $s->license_key,
                    'qty' => $s->qty,
                ];
            });

        return $hardware;
    }
}
