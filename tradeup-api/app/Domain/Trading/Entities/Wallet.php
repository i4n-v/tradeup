<?php

namespace App\Domain\Trading\Entities;

use DateTimeImmutable;

final class Wallet
{
    public function __construct(
        private readonly ?int $id,
        private readonly int $userId,
        private string $brlBalance,
        private string $btcBalance,
        private DateTimeImmutable $updatedAt,
    ) {}

    public static function openFor(int $userId): self
    {
        return new self(
            id: null,
            userId: $userId,
            brlBalance: '10000.00',
            btcBalance: '0.00000000',
            updatedAt: new DateTimeImmutable,
        );
    }

    public static function reconstitute(
        int $id,
        int $userId,
        string $brlBalance,
        string $btcBalance,
        DateTimeImmutable $updatedAt,
    ): self {
        return new self(
            id: $id,
            userId: $userId,
            brlBalance: $brlBalance,
            btcBalance: $btcBalance,
            updatedAt: $updatedAt,
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

    public function brlBalance(): string
    {
        return $this->brlBalance;
    }

    public function btcBalance(): string
    {
        return $this->btcBalance;
    }

    public function updatedAt(): DateTimeImmutable
    {
        return $this->updatedAt;
    }

    public function debitBrl(string $amount): void
    {
        $this->brlBalance = bcsub($this->brlBalance, $amount, 2);
        $this->updatedAt = new DateTimeImmutable;
    }

    public function creditBtc(string $amount): void
    {
        $this->btcBalance = bcadd($this->btcBalance, $amount, 8);
        $this->updatedAt = new DateTimeImmutable;
    }

    public function debitBtc(string $amount): void
    {
        $this->btcBalance = bcsub($this->btcBalance, $amount, 8);
        $this->updatedAt = new DateTimeImmutable;
    }

    public function creditBrl(string $amount): void
    {
        $this->brlBalance = bcadd($this->brlBalance, $amount, 2);
        $this->updatedAt = new DateTimeImmutable;
    }
}
