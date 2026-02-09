<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Http;

class InventoryApiTestController extends Controller
{
    public function test()
    {
        // Step 1: get API token from env
        $apiToken = env('INVENTORY_API_TOKEN', 'default-token');

        // Step 2: call Inventory API with Bearer token
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $apiToken,
        ])->get('http://127.0.0.1:8000/api/hardwareApi');

        // Step 3: check if request was successful
        if ($response->failed()) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch inventory API',
                'status' => $response->status(),
                'body' => $response->body(),
            ], $response->status());
        }

        // Step 4: decode JSON response
        $data = $response->json();

        // Step 5: return data to browser
        return response()->json($data);
    }
}
