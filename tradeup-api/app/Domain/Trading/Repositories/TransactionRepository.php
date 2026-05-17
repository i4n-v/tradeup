<?php

namespace App\Domain\Trading\Repositories;

use App\Domain\Trading\Entities\Transaction;

interface TransactionRepository
{
    public function save(Transaction $transaction): Transaction;

    public function findById(int $id): ?Transaction;

    /** @return Transaction[] */
    public function listByUserId(int $userId, int $page, int $limit): array;

    public function countByUserId(int $userId): int;
}
