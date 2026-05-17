<?php

namespace App\Application\Trading\UseCases;

use App\Domain\Trading\Entities\Transaction;
use App\Domain\Trading\Entities\Wallet;

final readonly class TradeResult
{
    public function __construct(
        public Transaction $transaction,
        public Wallet $wallet,
    ) {}
}
