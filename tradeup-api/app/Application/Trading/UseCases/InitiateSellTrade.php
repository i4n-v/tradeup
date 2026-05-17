<?php

namespace App\Application\Trading\UseCases;

use App\Application\Trading\Exceptions\InsufficientFundsException;
use App\Domain\Trading\Entities\Transaction;
use App\Domain\Trading\Repositories\TransactionRepository;
use App\Domain\Trading\Repositories\WalletRepository;
use InvalidArgumentException;

final class InitiateSellTrade
{
    public function __construct(
        private readonly TransactionRepository $transactions,
        private readonly WalletRepository $wallets,
    ) {}

    public function execute(InitiateSellTradeInput $input): PendingTradeResult
    {
        $amountBtc = $input->amountBtc;

        if (! preg_match('/^\d+(\.\d{1,8})?$/', $amountBtc) || bccomp($amountBtc, '0', 8) <= 0) {
            throw new InvalidArgumentException('Invalid BTC amount format.');
        }

        $wallet = $this->wallets->findByUserId($input->userId);

        if ($wallet === null || bccomp($wallet->btcBalance(), $amountBtc, 8) < 0) {
            throw new InsufficientFundsException('BTC');
        }

        $transaction = Transaction::pendingSell($input->userId, $amountBtc);
        $saved = $this->transactions->save($transaction);

        return new PendingTradeResult(transaction: $saved);
    }
}
