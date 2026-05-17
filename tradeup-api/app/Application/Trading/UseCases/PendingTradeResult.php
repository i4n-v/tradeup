<?php

namespace App\Application\Trading\UseCases;

use App\Domain\Trading\Entities\Transaction;

final readonly class PendingTradeResult
{
    public function __construct(
        public Transaction $transaction,
    ) {}
}
