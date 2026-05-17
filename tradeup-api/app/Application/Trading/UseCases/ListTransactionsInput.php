<?php

namespace App\Application\Trading\UseCases;

final readonly class ListTransactionsInput
{
    public function __construct(
        public int $userId,
        public int $page = 1,
        public int $limit = 50,
    ) {}
}
