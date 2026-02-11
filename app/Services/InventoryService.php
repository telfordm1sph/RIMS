<?php

namespace App\Services;

use App\Repositories\InventoryRepository;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class InventoryService
{
    protected InventoryRepository $inventoryRepository;
    protected string $baseUrl;
    protected string $token;

    public function __construct(InventoryRepository $inventoryRepository)
    {
        $this->inventoryRepository = $inventoryRepository;
        $this->baseUrl = env('INVENTORY_API_URL', 'http://127.0.0.1:8000/api');
        $this->token = env('INVENTORY_API_TOKEN');
    }

    /**
     * Generic GET request to the external inventory API
     */
    protected function get(string $endpoint, array $params = [])
    {
        // If filters exist, append as path param
        if (!empty($params)) {
            $encoded = base64_encode(json_encode($params));
            $endpoint = rtrim($endpoint, '/') . '/' . $encoded;
        }

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->get("{$this->baseUrl}/{$endpoint}");

        if ($response->failed()) {
            return [
                'success' => false,
                'status' => $response->status(),
                'body' => $response->body(),
            ];
        }

        return $response->json();
    }
    protected function getTable(string $endpoint, array $params = [])
    {
        $query = [];

        if (!empty($params)) {
            $query['f'] = base64_encode(json_encode($params));
        }

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->get("{$this->baseUrl}/{$endpoint}", $query);

        if ($response->failed()) {
            return [
                'success' => false,
                'status' => $response->status(),
                'body' => $response->body(),
            ];
        }

        return $response->json();
    }


    /**
     * Generic PUT request to the external inventory API
     */
    protected function put(string $endpoint, array $payload = [])
    {
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->put("{$this->baseUrl}/{$endpoint}", $payload);

        if ($response->failed()) {
            return [
                'success' => false,
                'status' => $response->status(),
                'body' => $response->body(),
            ];
        }

        return $response->json();
    }
    protected function post(string $endpoint, array $payload = [])
    {
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->token,
        ])->post("{$this->baseUrl}/{$endpoint}", $payload);

        if ($response->failed()) {
            return [
                'success' => false,
                'status' => $response->status(),
                'body' => $response->body(),
            ];
        }

        return $response->json();
    }
    /**
     * Decode base64 encoded filters string to array
     */
    protected function decodeFilters(?string $filters): array
    {
        if (!$filters) {
            return [];
        }

        $decoded = json_decode(base64_decode($filters), true);
        return is_array($decoded) ? $decoded : [];
    }
    public function getFullHardwareDetails($hostname)
    {
        $endpoint = "hardware/{$hostname}/full-details";
        $response = $this->get($endpoint);

        return [
            'success' => true,
            'data' => is_array($response) ? $response : ($response['data'] ?? []),
        ];
    }
    /**
     * Get parts list for a hardware
     */
    public function getPartsList($hostname)
    {
        $endpoint = "hardware/{$hostname}/parts";
        $response = $this->get($endpoint);

        return [
            'success' => true,
            'data' => is_array($response) ? $response : ($response['data'] ?? []),
        ];
    }

    /**
     * Get software list for a hardware
     */
    public function getSoftwaresList($hostname)
    {
        $endpoint = "hardware/{$hostname}/software";
        $response = $this->get($endpoint);

        if (isset($response['success']) && $response['success'] === false) {
            return [
                'success' => false,
                'message' => 'Failed to fetch software',
                'status' => $response['status'] ?? 500,
                'body' => $response['body'] ?? null,
            ];
        }

        return [
            'success' => true,
            'data' => is_array($response) ? $response : ($response['data'] ?? []),
        ];
    }

    /**
     * API: Get parts options from inventory API
     * Accepts encoded string, decodes to array for API call
     */
    public function partsOptions(?string $filters = null)
    {
        $params = $this->decodeFilters($filters);
        // dd($params);
        return $this->get('hardware/parts-options', $params);
    }

    /**
     * API: Get parts inventory from inventory API
     * Accepts encoded string, decodes to array for API call
     */
    public function partsInventory(?string $filters = null)
    {
        $params = $this->decodeFilters($filters);
        return $this->get('hardware/parts-inventory', $params);
    }

    /**
     * API: Get software options from inventory API
     * Accepts encoded string, decodes to array for API call
     */
    public function softwareOptions(?string $filters = null)
    {
        $params = $this->decodeFilters($filters);
        return $this->get('hardware/software-options', $params);
    }

    /**
     * API: Get software licenses from inventory API
     * Accepts encoded string, decodes to array for API call
     */
    public function softwareLicenses(?string $filters = null)
    {
        $params = $this->decodeFilters($filters);
        return $this->get('hardware/software-licenses', $params);
    }

    /**
     * API: Get software inventory from inventory API
     * Accepts encoded string, decodes to array for API call
     */
    public function softwareInventory(?string $filters = null)
    {
        $params = $this->decodeFilters($filters);
        return $this->get('hardware/software-inventory', $params);
    }

    /**
     * API: Get software inventory options from inventory API
     */
    public function softwareInventoryOptions()
    {
        return $this->get('hardware/software-inventory-options');
    }

    /**
     * API: Update hardware with parts and software
     */
    public function updateHardware(int $hardwareId, array $data)
    {
        $endpoint = "hardware/{$hardwareId}/update";
        return $this->put($endpoint, $data);
    }

    /**
     * Repository: Get hostnames (local DB)
     */
    public function getHostNames($type_of_request)
    {
        return $this->inventoryRepository->getHostNames($type_of_request);
    }

    /**
     * Repository: Get hardware details (local DB)
     */
    public function getHardwareDetails($search)
    {
        return $this->inventoryRepository->getHardwareDetails($search);
    }
}
