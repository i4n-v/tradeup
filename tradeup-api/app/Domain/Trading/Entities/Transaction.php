<?php

namespace App\Domain\Trading\Entities;

use App\Domain\Trading\ValueObjects\TradeType;
use DateTimeImmutable;

final class Transaction
{
    public function __construct(
        private readonly ?int $id,
        private readonly int $userId,
        private readonly TradeType $type,
        private readonly string $btcAmount,
        private readonly string $brlAmount,
        private readonly string $btcPriceBrl,
        private readonly DateTimeImmutable $createdAt,
    ) {}

    public static function record(
        int $userId,
        TradeType $type,
        string $btcAmount,
        string $brlAmount,
        string $btcPriceBrl,
    ): self {
        return new self(
            id: null,
            userId: $userId,
            type: $type,
            btcAmount: $btcAmount,
            brlAmount: $brlAmount,
            btcPriceBrl: $btcPriceBrl,
            createdAt: new DateTimeImmutable,
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
    ): self {
        return new self(
            id: $id,
            userId: $userId,
            type: $type,
            btcAmount: $btcAmount,
            brlAmount: $brlAmount,
            btcPriceBrl: $btcPriceBrl,
            createdAt: $createdAt,
        );
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
}
