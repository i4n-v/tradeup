<?php

namespace App\Http\Controllers\Api\V1;

use App\Application\Trading\UseCases\ListTransactions;
use App\Application\Trading\UseCases\ListTransactionsInput;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    public function __construct(
        private readonly ListTransactions $listTransactions,
    ) {}

    public function __invoke(Request $request): JsonResponse
    {
        $page = max(1, (int) $request->query('page', 1));
        $limit = min(200, max(1, (int) $request->query('limit', 50)));

        $result = $this->listTransactions->execute(new ListTransactionsInput(
            userId: $request->user()->id,
            page: $page,
            limit: $limit,
        ));

        return response()->json([
            'data' => array_map(fn ($tx) => [
                'id' => $tx->id(),
                'type' => $tx->type()->value,
                'btcAmount' => $tx->btcAmount(),
                'brlAmount' => $tx->brlAmount(),
                'btcPriceBrl' => $tx->btcPriceBrl(),
                'createdAt' => $tx->createdAt()->format('Y-m-d\TH:i:s\Z'),
            ], $result->items),
            'meta' => [
                'page' => $result->page,
                'limit' => $result->limit,
                'total' => $result->total,
            ],
        ]);
    }
}
