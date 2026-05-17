<?php

namespace App\Http\Controllers\Api\V1\Trades;

use App\Application\Trading\Exceptions\InsufficientFundsException;
use App\Application\Trading\Exceptions\QuoteUnavailableException;
use App\Application\Trading\Exceptions\ZeroResultException;
use App\Application\Trading\UseCases\SellBtc;
use App\Application\Trading\UseCases\SellBtcInput;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Trades\SellRequest;
use Illuminate\Http\JsonResponse;

class SellTradeController extends Controller
{
    public function __construct(
        private readonly SellBtc $sellBtc,
    ) {}

    public function __invoke(SellRequest $request): JsonResponse
    {
        try {
            $result = $this->sellBtc->execute(new SellBtcInput(
                userId: $request->user()->id,
                amountBtc: $request->validated('amountBtc'),
            ));
        } catch (QuoteUnavailableException $e) {
            return response()->json(['message' => $e->getMessage(), 'errors' => ['quote' => [$e->getMessage()]]], 422);
        } catch (InsufficientFundsException $e) {
            return response()->json(['message' => $e->getMessage(), 'errors' => ['amountBtc' => [$e->getMessage()]]], 422);
        } catch (ZeroResultException $e) {
            return response()->json(['message' => $e->getMessage(), 'errors' => ['amountBtc' => [$e->getMessage()]]], 422);
        }

        $tx = $result->transaction;
        $wallet = $result->wallet;

        return response()->json([
            'transaction' => [
                'id' => $tx->id(),
                'type' => $tx->type()->value,
                'btcAmount' => $tx->btcAmount(),
                'brlAmount' => $tx->brlAmount(),
                'btcPriceBrl' => $tx->btcPriceBrl(),
                'createdAt' => $tx->createdAt()->format('Y-m-d\TH:i:s\Z'),
            ],
            'wallet' => [
                'brlBalance' => $wallet->brlBalance(),
                'btcBalance' => $wallet->btcBalance(),
            ],
        ]);
    }
}
