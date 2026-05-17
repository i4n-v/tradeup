<?php

namespace App\Application\Trading\UseCases;

final readonly class InitiateBuyTradeInput
{
    public function __construct(
        public int $userId,
        public string $amountBrl,
    ) {}
}
