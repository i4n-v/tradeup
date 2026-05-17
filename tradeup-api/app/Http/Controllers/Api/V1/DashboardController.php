<?php

namespace App\Http\Controllers\Api\V1;

use App\Application\Trading\UseCases\GetDashboard;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __construct(
        private readonly GetDashboard $getDashboard,
    ) {}

    public function __invoke(Request $request): JsonResponse
    {
        $result = $this->getDashboard->execute($request->user()->id);

        $payload = [
            'brlBalance' => $result->brlBalance,
            'btcBalance' => $result->btcBalance,
            'btcPriceBrl' => $result->btcPriceBrl,
        ];

        if (! $result->quoteAvailable) {
            $payload['quoteAvailable'] = false;
        }

        return response()->json($payload);
    }
}
