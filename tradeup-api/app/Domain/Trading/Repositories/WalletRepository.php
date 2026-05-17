<?php

namespace App\Domain\Trading\Repositories;

use App\Domain\Trading\Entities\Wallet;

interface WalletRepository
{
    public function findByUserId(int $userId): ?Wallet;

    public function lockForUpdate(int $userId): ?Wallet;

    public function save(Wallet $wallet): void;
}
