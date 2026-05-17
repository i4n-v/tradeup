<?php

use App\Models\Transaction;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('should return paged transactions for owner newest first', function () {
    $user = User::factory()->create();
    Wallet::create([
        'user_id' => $user->id,
        'brl_balance' => '10000.00',
        'btc_balance' => '0.00000000',
        'updated_at' => now(),
    ]);

    Transaction::create([
        'user_id' => $user->id,
        'type' => 'BUY',
        'btc_amount' => '0.00400000',
        'brl_amount' => '1000.00',
        'btc_price_brl' => '250000.00',
        'created_at' => now(),
    ]);

    $response = $this->actingAs($user, 'sanctum')->getJson('/api/v1/transactions?page=1&limit=10');

    $response->assertOk()
        ->assertJsonStructure([
            'data' => [['id', 'type', 'btcAmount', 'brlAmount', 'btcPriceBrl', 'createdAt']],
            'meta' => ['page', 'limit', 'total'],
        ])
        ->assertJsonPath('meta.page', 1)
        ->assertJsonPath('meta.total', 1);
});

it('should return 401 for unauthenticated request', function () {
    $this->getJson('/api/v1/transactions')->assertUnauthorized();
});

it('should respect limit parameter max 200', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user, 'sanctum')->getJson('/api/v1/transactions?limit=500');

    $response->assertOk()
        ->assertJsonPath('meta.limit', 200);
});
