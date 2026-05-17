<?php

namespace App\Application\Trading\UseCases;

use App\Domain\Trading\Ports\QuoteServicePort;
use App\Domain\Trading\Repositories\WalletRepository;

final class GetDashboard
{
    public function __construct(
        private readonly WalletRepository $wallets,
        private readonly QuoteServicePort $quoteService,
    ) {}

    public function execute(int $userId): DashboardResult
    {
        $wallet = $this->wallets->findByUserId($userId);

        $brlBalance = $wallet?->brlBalance() ?? '0.00';
        $btcBalance = $wallet?->btcBalance() ?? '0.00000000';

        $quote = $this->quoteService->getQuote();

        return new DashboardResult(
            brlBalance: $brlBalance,
            btcBalance: $btcBalance,
            btcPriceBrl: $quote,
            quoteAvailable: $quote !== null,
        );
    }
}
