<?php



namespace App\Repositories;

use App\Models\Masterlist;
use App\Models\Request;
use App\Models\RequestItem;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Collection;

class RequestRepository
{
    /**
     * Generate unique request number
     */
    public function generateRequestNumber(): string
    {
        $year = date('Y');

        return DB::transaction(function () use ($year) {
            // Lock the last request row for this year to prevent race conditions
            $lastRequest = Request::whereYear('created_at', $year)
                ->lockForUpdate()
                ->orderBy('id', 'desc')
                ->first();

            // Calculate next increment safely
            if ($lastRequest && preg_match('/REQ-\d{4}-(\d{4})$/', $lastRequest->request_number, $matches)) {
                $nextNumber = (int)$matches[1] + 1;
            } else {
                $nextNumber = 1;
            }

            return 'REQ-' . $year . '-' . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);
        });
    }
    public function createRequest(array $data): Request
    {
        return Request::create($data);
    }

    public function createRequestItem(array $data): RequestItem
    {
        return RequestItem::create($data);
    }
}
