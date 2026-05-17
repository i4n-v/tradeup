<?php

namespace App\Application\Trading\UseCases;

final readonly class SellBtcInput
{
    public function __construct(
        public int $userId,
        public string $amountBtc,
    ) {}
}
