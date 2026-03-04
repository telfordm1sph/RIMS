<?php

namespace App\Services;


use Illuminate\Support\Facades\Http;


class IssuanceService
{

    protected string $baseUrl;
    protected string $token;

    public function __construct()
    {

        $this->baseUrl = config('services.inventory.url');
        $this->token   = config('services.inventory.token');
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

    /**
     * API: Create whole unit issuance
     */
    public function createIssuance(array $data)
    {
        $endpoint = "issuance/create";
        return $this->post($endpoint, $data);
    }

    /**
     * API: Create individual item issuance
     */
    public function createItemIssuance(array $data)
    {
        $endpoint = "issuance/items/create";
        return $this->post($endpoint, $data);
    }

    /**
     * API: Get issuances
     */
    public function getIssuances(array $filters = [], ?int $employeeId = null)
    {
        $endpoint = "issuance/table";

        $payload = [
            'f' => base64_encode(json_encode($filters)),
            'employee_id' => $employeeId
        ];

        $response = $this->post($endpoint, $payload);

       return $response;
    }

    public function acknowledgeIssuance(int $id, array $data)
    {
        $endpoint = "issuance/acknowledge/{$id}";
        return $this->put($endpoint, $data);
    }
}
