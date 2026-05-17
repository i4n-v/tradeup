<?php

namespace App\Jobs\Trading;

use App\Application\Trading\Exceptions\InsufficientFundsException;
use App\Application\Trading\Exceptions\QuoteUnavailableException;
use App\Application\Trading\Exceptions\ZeroResultException;
use App\Application\Trading\UseCases\SellBtc;
use App\Application\Trading\UseCases\SellBtcInput;
use App\Domain\Trading\Repositories\TransactionRepository;
use App\Domain\Trading\ValueObjects\TransactionFailureReason;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class ProcessSellTradeJob implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private readonly int $transactionId,
        private readonly int $userId,
    ) {}

    public function handle(SellBtc $sellBtc, TransactionRepository $transactions): void
    {
        try {
            $sellBtc->execute(new SellBtcInput(
                userId: $this->userId,
                transactionId: $this->transactionId,
            ));
        } catch (InsufficientFundsException) {
            $this->markFailed($transactions, TransactionFailureReason::InsufficientBtcFunds);
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
