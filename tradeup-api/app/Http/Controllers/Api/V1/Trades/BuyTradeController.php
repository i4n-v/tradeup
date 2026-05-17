<?php

namespace App\Http\Controllers\Api\V1\Trades;

use App\Application\Trading\Exceptions\InsufficientFundsException;
use App\Application\Trading\UseCases\InitiateBuyTrade;
use App\Application\Trading\UseCases\InitiateBuyTradeInput;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Trades\BuyRequest;
use App\Jobs\Trading\ProcessBuyTradeJob;
use Illuminate\Http\JsonResponse;
use InvalidArgumentException;

class BuyTradeController extends Controller
{
    public function __construct(
        private readonly InitiateBuyTrade $initiateBuyTrade,
    ) {}

    public function __invoke(BuyRequest $request): JsonResponse
    {
        try {
            $result = $this->initiateBuyTrade->execute(new InitiateBuyTradeInput(
                userId: $request->user()->id,
                amountBrl: $request->validated('amountBrl'),
            ));
        } catch (InsufficientFundsException) {
            return response()->json(['message' => 'Saldo BRL insuficiente para esta operação.'], 422);
        } catch (InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        ProcessBuyTradeJob::dispatch($result->transaction->id(), $request->user()->id);

        $tx = $result->transaction;

        return response()->json([
            'transaction' => [
                'id' => $tx->id(),
                'type' => $tx->type()->value,
                'status' => $tx->status()->value,
                'btcAmount' => $tx->btcAmount(),
                'brlAmount' => $tx->brlAmount(),
                'btcPriceBrl' => $tx->btcPriceBrl(),
                'createdAt' => $tx->createdAt()->format('Y-m-d\TH:i:s\Z'),
                'failureReason' => $tx->failureReason()?->value,
            ],
        ], 202);
    }
}
