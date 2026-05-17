<?php

namespace App\Jobs\Trading;

use App\Application\Trading\Exceptions\InsufficientFundsException;
use App\Application\Trading\Exceptions\QuoteUnavailableException;
use App\Application\Trading\Exceptions\ZeroResultException;
use App\Application\Trading\UseCases\BuyBtc;
use App\Application\Trading\UseCases\BuyBtcInput;
use App\Domain\Trading\Repositories\TransactionRepository;
use App\Domain\Trading\ValueObjects\TransactionFailureReason;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class ProcessBuyTradeJob implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private readonly int $transactionId,
        private readonly int $userId,
    ) {}

    public function handle(BuyBtc $buyBtc, TransactionRepository $transactions): void
    {
        try {
            $buyBtc->execute(new BuyBtcInput(
                userId: $this->userId,
                transactionId: $this->transactionId,
            ));
        } catch (InsufficientFundsException) {
            $this->markFailed($transactions, TransactionFailureReason::InsufficientBrlFunds);
        } catch (QuoteUnavailableException) {
            $this->markFailed($transactions, TransactionFailureReason::QuoteUnavailable);
        } catch (ZeroResultException|\InvalidArgumentException) {
            $this->markFailed($transactions, TransactionFailureReason::ZeroResult);
        } catch (\Throwable $e) {
            $this->markFailed($transactions, TransactionFailureReason::Unknown);
            throw $e;
        }
    }

    private function markFailed(TransactionRepository $transactions, TransactionFailureReason $reason): void
    {
        $transaction = $transactions->findById($this->transactionId);
        $transaction?->fail($reason);

        if ($transaction !== null) {
            $transactions->save($transaction);
        }
    }
}
