<?php

use App\Domain\Trading\Ports\QuoteServicePort;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('should return wallet balances and quote for authenticated user', function () {
    $user = User::factory()->create();
    Wallet::create([
        'user_id' => $user->id,
        'brl_balance' => '10000.00',
        'btc_balance' => '0.00000000',
        'updated_at' => now(),
    ]);

    $response = $this->actingAs($user, 'sanctum')->getJson('/api/v1/dashboard');

    $response->assertOk()
        ->assertJsonStructure(['brlBalance', 'btcBalance', 'btcPriceBrl'])
        ->assertJsonPath('brlBalance', '10000.00')
        ->assertJsonPath('btcBalance', '0.00000000');
});

it('should return 401 for unauthenticated request', function () {
    $this->getJson('/api/v1/dashboard')->assertUnauthorized();
});

it('should return null btcPriceBrl and quoteAvailable false when quote unavailable', function () {
    $user = User::factory()->create();
    Wallet::create([
        'user_id' => $user->id,
        'brl_balance' => '10000.00',
        'btc_balance' => '0.00000000',
        'updated_at' => now(),
    ]);

    $this->app->bind(QuoteServicePort::class, fn () => new class implements QuoteServicePort
    {
        public function getQuote(): ?string
        {
            return null;
        }
    });

    $response = $this->actingAs($user, 'sanctum')->getJson('/api/v1/dashboard');

    $response->assertOk()
        ->assertJsonPath('btcPriceBrl', null)
        ->assertJsonPath('quoteAvailable', false);
});
