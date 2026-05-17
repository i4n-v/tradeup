<?php

namespace App\Infrastructure\Trading;

use App\Domain\Trading\Entities\Transaction as DomainTransaction;
use App\Domain\Trading\Repositories\TransactionRepository;
use App\Models\Transaction as EloquentTransaction;

final class EloquentTransactionRepository implements TransactionRepository
{
    public function save(DomainTransaction $transaction): DomainTransaction
    {
        $model = EloquentTransaction::create(TransactionMapper::fromDomain($transaction));

        return TransactionMapper::toDomain($model);
    }

    public function listByUserId(int $userId, int $page, int $limit): array
    {
        return EloquentTransaction::where('user_id', $userId)
            ->orderByDesc('created_at')
            ->forPage($page, $limit)
            ->get()
            ->map(fn (EloquentTransaction $m) => TransactionMapper::toDomain($m))
            ->all();
    }

    public function countByUserId(int $userId): int
    {
        return EloquentTransaction::where('user_id', $userId)->count();
    }
}
