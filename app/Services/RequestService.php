<?php

namespace App\Services;

use App\Models\Masterlist;
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
}
