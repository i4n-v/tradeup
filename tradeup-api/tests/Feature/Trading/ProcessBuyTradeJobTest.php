<?php

use App\Application\Trading\UseCases\BuyBtc;
use App\Domain\Trading\Ports\QuoteServicePort;
use App\Domain\Trading\Repositories\TransactionRepository;
use App\Jobs\Trading\ProcessBuyTradeJob;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->app->bind(QuoteServicePort::class, fn () => new class implements QuoteServicePort
    {
        public function getQuote(): ?string
        {
            return '250000.00';
        }
    });
});

it('should complete transaction and debit wallet when job executes', function () {
    $user = User::factory()->create();
    Wallet::create([
        'user_id' => $user->id,
        'brl_balance' => '10000.00',
        'btc_balance' => '0.00000000',
        'updated_at' => now(),
    ]);

    $tx = Transaction::create([
        'user_id' => $user->id,
        'type' => 'BUY',
        'btc_amount' => '0.00000000',
        'brl_amount' => '1000.00',
        'btc_price_brl' => '0.00',
        'status' => 'PENDING',
        'created_at' => now(),
    ]);

    $job = new ProcessBuyTradeJob($tx->id, $user->id);
    $job->handle(app(BuyBtc::class), app(TransactionRepository::class));

    $this->assertDatabaseHas('transactions', [
        'id' => $tx->id,
        'status' => 'COMPLETED',
        'brl_amount' => '1000.00',
    ]);
    $this->assertDatabaseHas('wallets', ['user_id' => $user->id, 'brl_balance' => '9000.00']);
});

it('should mark transaction as failed on insufficient brl balance', function () {
    $user = User::factory()->create();
    Wallet::create([
        'user_id' => $user->id,
        'brl_balance' => '10.00',
        'btc_balance' => '0.00000000',
        'updated_at' => now(),
    ]);

    $tx = Transaction::create([
        'user_id' => $user->id,
        'type' => 'BUY',
        'btc_amount' => '0.00000000',
        'brl_amount' => '1000.00',
        'btc_price_brl' => '0.00',
        'status' => 'PENDING',
        'created_at' => now(),
    ]);

    $job = new ProcessBuyTradeJob($tx->id, $user->id);
    $job->handle(app(BuyBtc::class), app(TransactionRepository::class));

    $this->assertDatabaseHas('transactions', [
        'id' => $tx->id,
        'status' => 'FAILED',
        'failure_reason' => 'INSUFFICIENT_BRL_FUNDS',
    ]);
    $this->assertDatabaseHas('wallets', ['user_id' => $user->id, 'brl_balance' => '10.00']);
});

it('should mark transaction as failed when quote is unavailable', function () {
    $this->app->bind(QuoteServicePort::class, fn () => new class implements QuoteServicePort
    {
        public function getQuote(): ?string
        {
            return null;
        }
    });

    $user = User::factory()->create();
    Wallet::create([
        'user_id' => $user->id,
        'brl_balance' => '10000.00',
        'btc_balance' => '0.00000000',
        'updated_at' => now(),
    ]);

    $tx = Transaction::create([
        'user_id' => $user->id,
        'type' => 'BUY',
        'btc_amount' => '0.00000000',
        'brl_amount' => '1000.00',
        'btc_price_brl' => '0.00',
        'status' => 'PENDING',
        'created_at' => now(),
    ]);

    $job = new ProcessBuyTradeJob($tx->id, $user->id);
    $job->handle(app(BuyBtc::class), app(TransactionRepository::class));

    $this->assertDatabaseHas('transactions', [
        'id' => $tx->id,
        'status' => 'FAILED',
        'failure_reason' => 'QUOTE_UNAVAILABLE',
    ]);
    $this->assertDatabaseHas('wallets', ['user_id' => $user->id, 'brl_balance' => '10000.00']);
});
