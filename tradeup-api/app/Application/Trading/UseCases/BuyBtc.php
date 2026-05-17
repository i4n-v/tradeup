<?php

namespace App\Application\Trading\UseCases;

use App\Application\Shared\Ports\TransactionManagerPort;
use App\Application\Trading\Exceptions\InsufficientFundsException;
use App\Application\Trading\Exceptions\QuoteUnavailableException;
use App\Application\Trading\Exceptions\ZeroResultException;
use App\Domain\Shared\MonetaryMath;
use App\Domain\Trading\Entities\Transaction;
use App\Domain\Trading\Ports\QuoteServicePort;
use App\Domain\Trading\Repositories\TransactionRepository;
use App\Domain\Trading\Repositories\WalletRepository;
use App\Domain\Trading\ValueObjects\TradeType;
use InvalidArgumentException;

final class BuyBtc
{
    public function __construct(
        private readonly WalletRepository $wallets,
        private readonly TransactionRepository $transactions,
        private readonly QuoteServicePort $quoteService,
        private readonly TransactionManagerPort $txManager,
    ) {}

    public function execute(BuyBtcInput $input): TradeResult
    {
        $amountBrl = $input->amountBrl;

        if (! preg_match('/^\d+(\.\d{1,2})?$/', $amountBrl) || bccomp($amountBrl, '0', 2) <= 0) {
            throw new InvalidArgumentException('Invalid BRL amount format.');
        }

        $price = $this->quoteService->getQuote();

        if ($price === null) {
            throw new QuoteUnavailableException;
        }

        return $this->txManager->run(function () use ($input, $amountBrl, $price) {
            $wallet = $this->wallets->lockForUpdate($input->userId);

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

            $transaction = Transaction::record(
                userId: $input->userId,
                type: TradeType::Buy,
                btcAmount: $btcAmount,
                brlAmount: $amountBrl,
                btcPriceBrl: $price,
            );

            $savedTransaction = $this->transactions->save($transaction);

            return new TradeResult(transaction: $savedTransaction, wallet: $wallet);
        });
    }
}
