<?php

namespace App\Domain\Trading\Entities;

use App\Domain\Trading\ValueObjects\TradeType;
use App\Domain\Trading\ValueObjects\TransactionFailureReason;
use App\Domain\Trading\ValueObjects\TransactionStatus;
use DateTimeImmutable;

final class Transaction
{
    public function __construct(
        private readonly ?int $id,
        private readonly int $userId,
        private readonly TradeType $type,
        private string $btcAmount,
        private string $brlAmount,
        private string $btcPriceBrl,
        private readonly DateTimeImmutable $createdAt,
        private TransactionStatus $status,
        private ?TransactionFailureReason $failureReason = null,
    ) {}

    public static function pendingBuy(int $userId, string $brlAmount): self
    {
        return new self(
            id: null,
            userId: $userId,
            type: TradeType::Buy,
            btcAmount: '0.00000000',
            brlAmount: $brlAmount,
            btcPriceBrl: '0.00',
            createdAt: new DateTimeImmutable,
            status: TransactionStatus::Pending,
        );
    }

    public static function pendingSell(int $userId, string $btcAmount): self
    {
        return new self(
            id: null,
            userId: $userId,
            type: TradeType::Sell,
            btcAmount: $btcAmount,
            brlAmount: '0.00',
            btcPriceBrl: '0.00',
            createdAt: new DateTimeImmutable,
            status: TransactionStatus::Pending,
        );
    }

    public static function reconstitute(
        int $id,
        int $userId,
        TradeType $type,
        string $btcAmount,
        string $brlAmount,
        string $btcPriceBrl,
        DateTimeImmutable $createdAt,
        TransactionStatus $status,
        ?TransactionFailureReason $failureReason = null,
    ): self {
        return new self(
            id: $id,
            userId: $userId,
            type: $type,
            btcAmount: $btcAmount,
            brlAmount: $brlAmount,
            btcPriceBrl: $btcPriceBrl,
            createdAt: $createdAt,
            status: $status,
            failureReason: $failureReason,
        );
    }

    public function complete(string $btcAmount, string $brlAmount, string $btcPriceBrl): void
    {
        $this->btcAmount = $btcAmount;
        $this->brlAmount = $brlAmount;
        $this->btcPriceBrl = $btcPriceBrl;
        $this->status = TransactionStatus::Completed;
        $this->failureReason = null;
    }

    public function fail(TransactionFailureReason $reason = TransactionFailureReason::Unknown): void
    {
        $this->status = TransactionStatus::Failed;
        $this->failureReason = $reason;
    }

    public function id(): ?int
    {
        return $this->id;
    }

    public function userId(): int
    {
        return $this->userId;
    }

    public function type(): TradeType
    {
        return $this->type;
    }

    public function btcAmount(): string
    {
        return $this->btcAmount;
    }

    public function brlAmount(): string
    {
        return $this->brlAmount;
    }

    public function btcPriceBrl(): string
    {
        return $this->btcPriceBrl;
    }

    public function createdAt(): DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function status(): TransactionStatus
    {
        return $this->status;
    }

    public function failureReason(): ?TransactionFailureReason
    {
        return $this->failureReason;
    }
}
