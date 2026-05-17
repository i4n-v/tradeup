<?php

use App\Application\Trading\UseCases\SellBtc;
use App\Domain\Trading\Ports\QuoteServicePort;
use App\Domain\Trading\Repositories\TransactionRepository;
use App\Jobs\Trading\ProcessSellTradeJob;
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

it('should accept sell and return 202 with pending transaction', function () {
    Queue::fake();

    $user = User::factory()->create();
    Wallet::create([
        'user_id' => $user->id,
        'brl_balance' => '0.00',
        'btc_balance' => '1.00000000',
        'updated_at' => now(),
    ]);

    $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/trades/sell', [
        'amountBtc' => '0.00400000',
    ]);

    $response->assertStatus(202)
        ->assertJsonStructure([
            'transaction' => ['id', 'type', 'status', 'btcAmount', 'brlAmount', 'btcPriceBrl', 'createdAt', 'failureReason'],
        ])
        ->assertJsonPath('transaction.status', 'PENDING')
        ->assertJsonPath('transaction.type', 'SELL')
        ->assertJsonPath('transaction.btcAmount', '0.00400000')
        ->assertJsonPath('transaction.failureReason', null);

    Queue::assertPushed(ProcessSellTradeJob::class);

    $this->assertDatabaseHas('transactions', [
        'user_id' => $user->id,
        'type' => 'SELL',
        'status' => 'PENDING',
        'btc_amount' => '0.00400000',
    ]);

    // Wallet is not debited until the job runs.
    $this->assertDatabaseHas('wallets', [
        'user_id' => $user->id,
        'btc_balance' => '1.00000000',
    ]);
});

it('should return 422 immediately on insufficient btc funds', function () {
    $user = User::factory()->create();
    Wallet::create([
        'user_id' => $user->id,
        'brl_balance' => '10000.00',
        'btc_balance' => '0.00000001',
        'updated_at' => now(),
    ]);

    $this->actingAs($user, 'sanctum')->postJson('/api/v1/trades/sell', [
        'amountBtc' => '1.00000000',
    ])->assertStatus(422);

    $this->assertDatabaseMissing('transactions', ['user_id' => $user->id]);
});

it('should mark transaction as failed with reason on insufficient btc when job executes (race condition)', function () {
    Queue::fake();

    $user = User::factory()->create();
    Wallet::create([
        'user_id' => $user->id,
        'brl_balance' => '10000.00',
        'btc_balance' => '1.00000000',
        'updated_at' => now(),
    ]);

    $this->actingAs($user, 'sanctum')->postJson('/api/v1/trades/sell', [
        'amountBtc' => '1.00000000',
    ])->assertStatus(202);

    // Simulate race condition: drain wallet before job runs
    Wallet::where('user_id', $user->id)->update(['btc_balance' => '0.00000000']);

    $tx = Transaction::where('user_id', $user->id)->first();

    $job = new ProcessSellTradeJob($tx->id, $user->id);
    $job->handle(app(SellBtc::class), app(TransactionRepository::class));

    $this->assertDatabaseHas('transactions', [
        'id' => $tx->id,
        'status' => 'FAILED',
        'failure_reason' => 'INSUFFICIENT_BTC_FUNDS',
    ]);
});

it('should return 422 on invalid amountBtc format', function () {
    $user = User::factory()->create();
    Wallet::create([
        'user_id' => $user->id,
        'brl_balance' => '0.00',
        'btc_balance' => '1.00000000',
        'updated_at' => now(),
    ]);

    $this->actingAs($user, 'sanctum')->postJson('/api/v1/trades/sell', [
        'amountBtc' => 'not-a-number',
    ])->assertUnprocessable();

    $this->actingAs($user, 'sanctum')->postJson('/api/v1/trades/sell', [
        'amountBtc' => '0.000000001',
    ])->assertUnprocessable();
});
