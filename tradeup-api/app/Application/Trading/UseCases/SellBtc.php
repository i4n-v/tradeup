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

final class SellBtc
{
    public function __construct(
        private readonly WalletRepository $wallets,
        private readonly TransactionRepository $transactions,
        private readonly QuoteServicePort $quoteService,
        private readonly TransactionManagerPort $txManager,
    ) {}

    public function execute(SellBtcInput $input): TradeResult
    {
        $amountBtc = $input->amountBtc;

        if (! preg_match('/^\d+(\.\d{1,8})?$/', $amountBtc) || bccomp($amountBtc, '0', 8) <= 0) {
            throw new InvalidArgumentException('Invalid BTC amount format.');
        }

        $price = $this->quoteService->getQuote();

        if ($price === null) {
            throw new QuoteUnavailableException;
        }

        return $this->txManager->run(function () use ($input, $amountBtc, $price) {
            $wallet = $this->wallets->lockForUpdate($input->userId);

            if ($wallet === null || bccomp($wallet->btcBalance(), $amountBtc, 8) < 0) {
                throw new InsufficientFundsException('BTC');
            }

            $brlAmount = MonetaryMath::multiplyRound($amountBtc, $price, 2);

            if (bccomp($brlAmount, '0', 2) <= 0) {
                throw new ZeroResultException;
            }

            $wallet->debitBtc($amountBtc);
            $wallet->creditBrl($brlAmount);
            $this->wallets->save($wallet);

            $transaction = Transaction::record(
                userId: $input->userId,
                type: TradeType::Sell,
                btcAmount: $amountBtc,
                brlAmount: $brlAmount,
                btcPriceBrl: $price,
            );

            $savedTransaction = $this->transactions->save($transaction);

            return new TradeResult(transaction: $savedTransaction, wallet: $wallet);
        });
    }
}
