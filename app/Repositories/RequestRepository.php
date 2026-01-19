<?php



namespace App\Repositories;

use App\Constants\Status;
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
    public function query()
    {
        return Request::query();
    }
    public function getStatusCountsFromQuery($query): array
    {
        $statusCounts = $query->clone()
            ->groupBy('status')
            ->selectRaw('status, COUNT(*) as count')
            ->pluck('count', 'status')
            ->toArray();

        $result = [];
        $total = array_sum($statusCounts);

        $result['All'] = [
            'count' => $total,
            'color' => 'default',
        ];

        foreach (Status::LABELS as $value => $label) {
            $result[$label] = [
                'count' => $statusCounts[$value] ?? 0,
                'color' => Status::COLORS[$value] ?? 'default',
            ];
        }

        return $result;
    }
    public function getRequestItems($request_id)
    {
        return RequestItem::where('request_id', $request_id)->get();
    }
    public function findById(int $id): ?Request
    {
        return Request::with('items')->find($id);
    }
}
