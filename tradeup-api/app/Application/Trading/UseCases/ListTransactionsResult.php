<?php

namespace App\Application\Trading\UseCases;

use App\Domain\Trading\Entities\Transaction;

final readonly class ListTransactionsResult
{
    /**
     * @param  Transaction[]  $items
     */
    public function __construct(
        public array $items,
        public int $page,
        public int $limit,
        public int $total,
    ) {}
}
