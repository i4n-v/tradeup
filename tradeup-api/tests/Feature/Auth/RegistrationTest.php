<?php

use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('should register user and seed wallet with 10000.00 BRL', function () {
    $response = $this->postJson('/api/v1/auth/register', [
        'name' => 'Alice',
        'email' => 'alice@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ]);

    $response->assertCreated()
        ->assertJsonStructure(['user' => ['id', 'name', 'email', 'avatarUrl', 'createdAt']]);

    $this->assertDatabaseHas('users', ['email' => 'alice@example.com']);
    $this->assertDatabaseHas('wallets', ['brl_balance' => '10000.00']);
});

it('should return 422 on duplicate email', function () {
    $payload = [
        'name' => 'Bob',
        'email' => 'bob@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ];

    $this->postJson('/api/v1/auth/register', $payload)->assertCreated();
    $this->postJson('/api/v1/auth/register', $payload)->assertUnprocessable();
});

it('should return 422 when required fields are missing', function () {
    $this->postJson('/api/v1/auth/register', [])->assertUnprocessable();

    $this->postJson('/api/v1/auth/register', [
        'name' => 'Test',
        'email' => 'test@example.com',
        'password' => 'short',
        'password_confirmation' => 'short',
    ])->assertUnprocessable();
});

it('should NOT return a token in registration response', function () {
    $response = $this->postJson('/api/v1/auth/register', [
        'name' => 'Carol',
        'email' => 'carol@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ]);

    $response->assertCreated();
    $this->assertArrayNotHasKey('token', $response->json());
});
