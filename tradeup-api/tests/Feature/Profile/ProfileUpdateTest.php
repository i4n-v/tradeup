<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

it('should return authenticated user profile at /me', function () {
    $user = User::factory()->create(['name' => 'Alice']);

    $this->actingAs($user, 'sanctum')->getJson('/api/v1/me')
        ->assertOk()
        ->assertJsonStructure(['id', 'name', 'email', 'avatarUrl', 'createdAt'])
        ->assertJsonPath('name', 'Alice');
});

it('should return 401 at /me when unauthenticated', function () {
    $this->getJson('/api/v1/me')->assertUnauthorized();
});

it('should update name successfully', function () {
    $user = User::factory()->create(['name' => 'Old Name']);

    $this->actingAs($user, 'sanctum')->patchJson('/api/v1/profile', ['name' => 'New Name'])
        ->assertOk()
        ->assertJsonPath('name', 'New Name');

    $this->assertDatabaseHas('users', ['id' => $user->id, 'name' => 'New Name']);
});

it('should not update email', function () {
    $user = User::factory()->create(['email' => 'original@example.com']);

    $this->actingAs($user, 'sanctum')->patchJson('/api/v1/profile', ['name' => 'New Name'])
        ->assertOk()
        ->assertJsonPath('email', 'original@example.com');

    $this->assertDatabaseHas('users', ['id' => $user->id, 'email' => 'original@example.com']);
});

it('should upload avatar and return public URL', function () {
    Storage::fake('public');

    $user = User::factory()->create();
    $file = UploadedFile::fake()->image('avatar.jpg', 100, 100);

    $response = $this->actingAs($user, 'sanctum')->post('/api/v1/profile/avatar', [
        'avatar' => $file,
    ]);

    $response->assertOk()
        ->assertJsonStructure(['avatarUrl']);

    $avatarUrl = $response->json('avatarUrl');
    expect($avatarUrl)->toBeString()->not->toBeEmpty();
});

it('should reject avatar with invalid mime type', function () {
    Storage::fake('public');

    $user = User::factory()->create();
    $file = UploadedFile::fake()->create('document.pdf', 100, 'application/pdf');

    $this->actingAs($user, 'sanctum')
        ->withHeader('Accept', 'application/json')
        ->post('/api/v1/profile/avatar', ['avatar' => $file])
        ->assertUnprocessable();
});

it('should reject avatar larger than 5MB', function () {
    Storage::fake('public');

    $user = User::factory()->create();
    $file = UploadedFile::fake()->image('big.jpg')->size(6000);

    $this->actingAs($user, 'sanctum')
        ->withHeader('Accept', 'application/json')
        ->post('/api/v1/profile/avatar', ['avatar' => $file])
        ->assertUnprocessable();
});

it('should return 422 when name is missing on PATCH /profile', function () {
    $user = User::factory()->create();

    $this->actingAs($user, 'sanctum')->patchJson('/api/v1/profile', [])->assertUnprocessable();
});

it('should return 401 when updating profile without auth', function () {
    $this->patchJson('/api/v1/profile', ['name' => 'Test'])->assertUnauthorized();
});
