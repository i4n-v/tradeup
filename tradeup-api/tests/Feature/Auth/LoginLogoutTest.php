<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('should return token on valid credentials', function () {
    User::factory()->create([
        'email' => 'login@example.com',
        'password' => bcrypt('password123'),
    ]);

    $response = $this->postJson('/api/v1/auth/login', [
        'email' => 'login@example.com',
        'password' => 'password123',
    ]);

    $response->assertOk()
        ->assertJsonStructure(['token', 'user' => ['id', 'name', 'email']]);
});

it('should return 422 on wrong password', function () {
    User::factory()->create([
        'email' => 'wrong@example.com',
        'password' => bcrypt('correctpassword'),
    ]);

    $this->postJson('/api/v1/auth/login', [
        'email' => 'wrong@example.com',
        'password' => 'wrongpassword',
    ])->assertUnprocessable();
});

it('should revoke token after logout so next request returns 401', function () {
    $user = User::factory()->create([
        'email' => 'logout@example.com',
        'password' => bcrypt('password123'),
    ]);

    $loginResponse = $this->postJson('/api/v1/auth/login', [
        'email' => 'logout@example.com',
        'password' => 'password123',
    ]);

    $token = $loginResponse->json('token');

    $this->withToken($token)
        ->postJson('/api/v1/auth/logout')
        ->assertNoContent();

    // Reset auth guard state — in production each request is a fresh PHP lifecycle;
    // in tests the same app instance serves all requests so we clear the guard cache manually.
    $this->app['auth']->forgetGuards();

    $this->withToken($token)
        ->getJson('/api/v1/me')
        ->assertUnauthorized();
});
