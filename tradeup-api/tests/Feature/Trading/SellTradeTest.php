<?php

use App\Domain\Trading\Ports\QuoteServicePort;
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

it('should sell btc and credit brl balance correctly', function () {
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

    $response->assertOk()
        ->assertJsonStructure([
            'transaction' => ['id', 'type', 'btcAmount', 'brlAmount', 'btcPriceBrl', 'createdAt'],
            'wallet' => ['brlBalance', 'btcBalance'],
        ])
        ->assertJsonPath('transaction.type', 'SELL')
        ->assertJsonPath('transaction.brlAmount', '1000.00');

    $this->assertDatabaseHas('transactions', ['user_id' => $user->id, 'type' => 'SELL']);
    $this->assertDatabaseHas('wallets', ['user_id' => $user->id, 'brl_balance' => '1000.00']);
});

it('should return 422 on insufficient btc balance', function () {
    $user = User::factory()->create();
    Wallet::create([
        'user_id' => $user->id,
        'brl_balance' => '10000.00',
        'btc_balance' => '0.00000001',
        'updated_at' => now(),
    ]);

    $this->actingAs($user, 'sanctum')->postJson('/api/v1/trades/sell', [
        'amountBtc' => '1.00000000',
    ])->assertUnprocessable();
});

it('should return 422 when quote is unavailable', function () {
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
        'brl_balance' => '0.00',
        'btc_balance' => '1.00000000',
        'updated_at' => now(),
    ]);

    $this->actingAs($user, 'sanctum')->postJson('/api/v1/trades/sell', [
        'amountBtc' => '0.10000000',
    ])->assertUnprocessable();
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
