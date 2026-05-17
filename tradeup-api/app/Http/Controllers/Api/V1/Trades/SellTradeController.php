<?php

namespace App\Http\Controllers\Api\V1\Trades;

use App\Application\Trading\Exceptions\InsufficientFundsException;
use App\Application\Trading\UseCases\InitiateSellTrade;
use App\Application\Trading\UseCases\InitiateSellTradeInput;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Trades\SellRequest;
use App\Jobs\Trading\ProcessSellTradeJob;
use Illuminate\Http\JsonResponse;
use InvalidArgumentException;

class SellTradeController extends Controller
{
    public function __construct(
        private readonly InitiateSellTrade $initiateSellTrade,
    ) {}

    public function __invoke(SellRequest $request): JsonResponse
    {
        try {
            $result = $this->initiateSellTrade->execute(new InitiateSellTradeInput(
                userId: $request->user()->id,
                amountBtc: $request->validated('amountBtc'),
            ));
        } catch (InsufficientFundsException) {
            return response()->json(['message' => 'Saldo BTC insuficiente para esta operação.'], 422);
        } catch (InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        ProcessSellTradeJob::dispatch($result->transaction->id(), $request->user()->id);

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
