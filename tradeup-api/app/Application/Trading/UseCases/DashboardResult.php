<?php

namespace App\Application\Trading\UseCases;

final readonly class DashboardResult
{
    public function __construct(
        public string $brlBalance,
        public string $btcBalance,
        public ?string $btcPriceBrl,
        public bool $quoteAvailable,
    ) {}
}
