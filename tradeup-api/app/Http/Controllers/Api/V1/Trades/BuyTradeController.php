<?php

namespace App\Http\Controllers\Api\V1\Trades;

use App\Application\Trading\Exceptions\InsufficientFundsException;
use App\Application\Trading\Exceptions\QuoteUnavailableException;
use App\Application\Trading\Exceptions\ZeroResultException;
use App\Application\Trading\UseCases\BuyBtc;
use App\Application\Trading\UseCases\BuyBtcInput;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Trades\BuyRequest;
use Illuminate\Http\JsonResponse;

class BuyTradeController extends Controller
{
    public function __construct(
        private readonly BuyBtc $buyBtc,
    ) {}

    public function __invoke(BuyRequest $request): JsonResponse
    {
        try {
            $result = $this->buyBtc->execute(new BuyBtcInput(
                userId: $request->user()->id,
                amountBrl: $request->validated('amountBrl'),
            ));
        } catch (QuoteUnavailableException $e) {
            return response()->json(['message' => $e->getMessage(), 'errors' => ['quote' => [$e->getMessage()]]], 422);
        } catch (InsufficientFundsException $e) {
            return response()->json(['message' => $e->getMessage(), 'errors' => ['amountBrl' => [$e->getMessage()]]], 422);
        } catch (ZeroResultException $e) {
            return response()->json(['message' => $e->getMessage(), 'errors' => ['amountBrl' => [$e->getMessage()]]], 422);
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
