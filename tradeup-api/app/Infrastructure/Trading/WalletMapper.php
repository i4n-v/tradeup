<?php

namespace App\Infrastructure\Trading;

use App\Domain\Trading\Entities\Wallet as DomainWallet;
use App\Models\Wallet as EloquentWallet;
use DateTimeImmutable;

final class WalletMapper
{
    public static function toDomain(EloquentWallet $model): DomainWallet
    {
        $updatedAt = $model->updated_at
            ? DateTimeImmutable::createFromMutable($model->updated_at->toDateTime())
            : new DateTimeImmutable;

        return DomainWallet::reconstitute(
            id: $model->id,
            userId: $model->user_id,
            brlBalance: number_format((float) $model->brl_balance, 2, '.', ''),
            btcBalance: number_format((float) $model->btc_balance, 8, '.', ''),
            updatedAt: $updatedAt,
        );
    }

    /** @return array<string, mixed> */
    public static function fromDomain(DomainWallet $wallet): array
    {
        return [
            'user_id' => $wallet->userId(),
            'brl_balance' => $wallet->brlBalance(),
            'btc_balance' => $wallet->btcBalance(),
            'updated_at' => $wallet->updatedAt()->format('Y-m-d H:i:s'),
        ];
    }
}
