<?php

use App\Application\Trading\UseCases\BuyBtc;
use App\Domain\Trading\Ports\QuoteServicePort;
use App\Domain\Trading\Repositories\TransactionRepository;
use App\Jobs\Trading\ProcessBuyTradeJob;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;

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

it('should accept buy and return 202 with pending transaction', function () {
    Queue::fake();

    $user = User::factory()->create();
    Wallet::create([
        'user_id' => $user->id,
        'brl_balance' => '10000.00',
        'btc_balance' => '0.00000000',
        'updated_at' => now(),
    ]);

    $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/trades/buy', [
        'amountBrl' => '1000.00',
    ]);

    $response->assertStatus(202)
        ->assertJsonStructure([
            'transaction' => ['id', 'type', 'status', 'btcAmount', 'brlAmount', 'btcPriceBrl', 'createdAt', 'failureReason'],
        ])
        ->assertJsonPath('transaction.status', 'PENDING')
        ->assertJsonPath('transaction.type', 'BUY')
        ->assertJsonPath('transaction.brlAmount', '1000.00')
        ->assertJsonPath('transaction.failureReason', null);

    Queue::assertPushed(ProcessBuyTradeJob::class);

    $this->assertDatabaseHas('transactions', [
        'user_id' => $user->id,
        'type' => 'BUY',
        'status' => 'PENDING',
        'brl_amount' => '1000.00',
    ]);

    // Wallet is not debited until the job runs.
    $this->assertDatabaseHas('wallets', [
        'user_id' => $user->id,
        'brl_balance' => '10000.00',
    ]);
});

it('should return 422 immediately on insufficient brl funds', function () {
    $user = User::factory()->create();
    Wallet::create([
        'user_id' => $user->id,
        'brl_balance' => '10.00',
        'btc_balance' => '0.00000000',
        'updated_at' => now(),
    ]);

    $this->actingAs($user, 'sanctum')->postJson('/api/v1/trades/buy', [
        'amountBrl' => '1000.00',
    ])->assertStatus(422);

    $this->assertDatabaseMissing('transactions', ['user_id' => $user->id]);
});

it('should mark transaction as failed with reason on quote unavailable when job executes', function () {
    $this->app->bind(QuoteServicePort::class, fn () => new class implements QuoteServicePort
    {
        public function getQuote(): ?string
        {
            return null;
        }
    });

    Queue::fake();

    $user = User::factory()->create();
    Wallet::create([
        'user_id' => $user->id,
        'brl_balance' => '10000.00',
        'btc_balance' => '0.00000000',
        'updated_at' => now(),
    ]);

    $this->actingAs($user, 'sanctum')->postJson('/api/v1/trades/buy', [
        'amountBrl' => '100.00',
    ])->assertStatus(202);

    $tx = Transaction::where('user_id', $user->id)->first();

    $job = new ProcessBuyTradeJob($tx->id, $user->id);
    $job->handle(app(BuyBtc::class), app(TransactionRepository::class));

    $this->assertDatabaseHas('transactions', [
        'id' => $tx->id,
        'status' => 'FAILED',
        'failure_reason' => 'QUOTE_UNAVAILABLE',
    ]);
});

it('should return 422 on invalid amountBrl format', function () {
    $user = User::factory()->create();
    Wallet::create([
        'user_id' => $user->id,
        'brl_balance' => '10000.00',
        'btc_balance' => '0.00000000',
        'updated_at' => now(),
    ]);

    $this->actingAs($user, 'sanctum')->postJson('/api/v1/trades/buy', [
        'amountBrl' => 'not-a-number',
    ])->assertUnprocessable();

    $this->actingAs($user, 'sanctum')->postJson('/api/v1/trades/buy', [
        'amountBrl' => '100.123',
    ])->assertUnprocessable();
});
