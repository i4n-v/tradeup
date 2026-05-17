<?php

namespace App\Application\Trading\UseCases;

final readonly class BuyBtcInput
{
    public function __construct(
        public int $userId,
        public int $transactionId,
    ) {}
}
