<?php

namespace App\Application\Trading\UseCases;

use App\Application\Trading\Exceptions\InsufficientFundsException;
use App\Domain\Trading\Entities\Transaction;
use App\Domain\Trading\Repositories\TransactionRepository;
use App\Domain\Trading\Repositories\WalletRepository;
use InvalidArgumentException;

final class InitiateBuyTrade
{
    public function __construct(
        private readonly TransactionRepository $transactions,
        private readonly WalletRepository $wallets,
    ) {}

    public function execute(InitiateBuyTradeInput $input): PendingTradeResult
    {
        $amountBrl = $input->amountBrl;

        if (! preg_match('/^\d+(\.\d{1,2})?$/', $amountBrl) || bccomp($amountBrl, '0', 2) <= 0) {
            throw new InvalidArgumentException('Invalid BRL amount format.');
        }

        $wallet = $this->wallets->findByUserId($input->userId);

        if ($wallet === null || bccomp($wallet->brlBalance(), $amountBrl, 2) < 0) {
            throw new InsufficientFundsException('BRL');
        }

        $transaction = Transaction::pendingBuy($input->userId, $amountBrl);
        $saved = $this->transactions->save($transaction);

        return new PendingTradeResult(transaction: $saved);
    }
}
