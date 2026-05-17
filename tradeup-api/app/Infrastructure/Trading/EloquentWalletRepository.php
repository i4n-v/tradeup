<?php

namespace App\Infrastructure\Trading;

use App\Domain\Trading\Entities\Wallet as DomainWallet;
use App\Domain\Trading\Repositories\WalletRepository;
use App\Models\Wallet as EloquentWallet;

final class EloquentWalletRepository implements WalletRepository
{
    public function findByUserId(int $userId): ?DomainWallet
    {
        $model = EloquentWallet::where('user_id', $userId)->first();

        return $model ? WalletMapper::toDomain($model) : null;
    }

    public function lockForUpdate(int $userId): ?DomainWallet
    {
        $model = EloquentWallet::where('user_id', $userId)->lockForUpdate()->first();

        return $model ? WalletMapper::toDomain($model) : null;
    }

    public function save(DomainWallet $wallet): void
    {
        if ($wallet->id() === null) {
            EloquentWallet::create(WalletMapper::fromDomain($wallet));
        } else {
            EloquentWallet::where('id', $wallet->id())->update(WalletMapper::fromDomain($wallet));
        }
    }
}
