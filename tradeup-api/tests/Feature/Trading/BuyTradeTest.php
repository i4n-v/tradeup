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

it('should buy btc and debit brl balance correctly', function () {
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

    $response->assertOk()
        ->assertJsonStructure([
            'transaction' => ['id', 'type', 'btcAmount', 'brlAmount', 'btcPriceBrl', 'createdAt'],
            'wallet' => ['brlBalance', 'btcBalance'],
        ])
        ->assertJsonPath('transaction.type', 'BUY')
        ->assertJsonPath('wallet.brlBalance', '9000.00');

    $this->assertDatabaseHas('wallets', ['user_id' => $user->id, 'brl_balance' => '9000.00']);
    $this->assertDatabaseHas('transactions', ['user_id' => $user->id, 'type' => 'BUY', 'brl_amount' => '1000.00']);
});

it('should return 422 on insufficient brl funds', function () {
    $user = User::factory()->create();
    Wallet::create([
        'user_id' => $user->id,
        'brl_balance' => '10.00',
        'btc_balance' => '0.00000000',
        'updated_at' => now(),
    ]);

    $this->actingAs($user, 'sanctum')->postJson('/api/v1/trades/buy', [
        'amountBrl' => '1000.00',
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
        'brl_balance' => '10000.00',
        'btc_balance' => '0.00000000',
        'updated_at' => now(),
    ]);

    $this->actingAs($user, 'sanctum')->postJson('/api/v1/trades/buy', [
        'amountBrl' => '100.00',
    ])->assertUnprocessable();
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

it('should reject zero btc result after rounding', function () {
    $this->app->bind(QuoteServicePort::class, fn () => new class implements QuoteServicePort
    {
        public function getQuote(): ?string
        {
            return '300000.00';
        }
    });

    $user = User::factory()->create();
    Wallet::create([
        'user_id' => $user->id,
        'brl_balance' => '10000.00',
        'btc_balance' => '0.00000000',
        'updated_at' => now(),
    ]);

    $this->actingAs($user, 'sanctum')->postJson('/api/v1/trades/buy', [
        'amountBrl' => '0.00',
    ])->assertUnprocessable();
});
