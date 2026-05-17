<?php

namespace App\Infrastructure\Trading;

use App\Domain\Trading\Entities\Transaction as DomainTransaction;
use App\Domain\Trading\ValueObjects\TradeType;
use App\Domain\Trading\ValueObjects\TransactionFailureReason;
use App\Domain\Trading\ValueObjects\TransactionStatus;
use App\Models\Transaction as EloquentTransaction;
use DateTimeImmutable;

final class TransactionMapper
{
    public static function toDomain(EloquentTransaction $model): DomainTransaction
    {
        return DomainTransaction::reconstitute(
            id: $model->id,
            userId: $model->user_id,
            type: TradeType::from($model->type),
            btcAmount: number_format((float) $model->btc_amount, 8, '.', ''),
            brlAmount: number_format((float) $model->brl_amount, 2, '.', ''),
            btcPriceBrl: number_format((float) $model->btc_price_brl, 2, '.', ''),
            createdAt: DateTimeImmutable::createFromMutable($model->created_at->toDateTime()),
            status: TransactionStatus::from($model->status),
            failureReason: $model->failure_reason
                ? TransactionFailureReason::tryFrom($model->failure_reason)
                : null,
        );
    }

    /** @return array<string, mixed> */
    public static function fromDomain(DomainTransaction $transaction): array
    {
        return [
            'user_id' => $transaction->userId(),
            'type' => $transaction->type()->value,
            'btc_amount' => $transaction->btcAmount(),
            'brl_amount' => $transaction->brlAmount(),
            'btc_price_brl' => $transaction->btcPriceBrl(),
            'status' => $transaction->status()->value,
            'failure_reason' => $transaction->failureReason()?->value,
            'created_at' => $transaction->createdAt()->format('Y-m-d H:i:s'),
        ];
    }

    /** @return array<string, mixed> */
    public static function fromDomainForUpdate(DomainTransaction $transaction): array
    {
        return [
            'btc_amount' => $transaction->btcAmount(),
            'brl_amount' => $transaction->brlAmount(),
            'btc_price_brl' => $transaction->btcPriceBrl(),
            'status' => $transaction->status()->value,
            'failure_reason' => $transaction->failureReason()?->value,
        ];
    }
}
