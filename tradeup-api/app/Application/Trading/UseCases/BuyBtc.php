<?php

namespace App\Application\Trading\UseCases;

use App\Application\Shared\Ports\TransactionManagerPort;
use App\Application\Trading\Exceptions\InsufficientFundsException;
use App\Application\Trading\Exceptions\QuoteUnavailableException;
use App\Application\Trading\Exceptions\ZeroResultException;
use App\Domain\Shared\MonetaryMath;
use App\Domain\Trading\Ports\QuoteServicePort;
use App\Domain\Trading\Repositories\TransactionRepository;
use App\Domain\Trading\Repositories\WalletRepository;

final class BuyBtc
{
    public function __construct(
        private readonly WalletRepository $wallets,
        private readonly TransactionRepository $transactions,
        private readonly QuoteServicePort $quoteService,
        private readonly TransactionManagerPort $txManager,
    ) {}

    public function execute(BuyBtcInput $input): void
    {
        $this->txManager->run(function () use ($input) {
            $transaction = $this->transactions->findById($input->transactionId);

            if ($transaction === null) {
                throw new \RuntimeException("Transaction {$input->transactionId} not found.");
            }

            $price = $this->quoteService->getQuote();

            if ($price === null) {
                throw new QuoteUnavailableException;
            }

            $wallet = $this->wallets->lockForUpdate($input->userId);
            $amountBrl = $transaction->brlAmount();

            if ($wallet === null || bccomp($wallet->brlBalance(), $amountBrl, 2) < 0) {
                throw new InsufficientFundsException('BRL');
            }

            $btcAmount = MonetaryMath::divideRound($amountBrl, $price, 8);

            if (bccomp($btcAmount, '0', 8) <= 0) {
                throw new ZeroResultException;
            }

            $wallet->debitBrl($amountBrl);
            $wallet->creditBtc($btcAmount);
            $this->wallets->save($wallet);

            $transaction->complete($btcAmount, $amountBrl, $price);
            $this->transactions->save($transaction);
        });
    }
}
