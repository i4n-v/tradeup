---
name: pest-laravel-test
description: >-
  Writes Pest + Laravel tests for tradeup-api aligned with Clean Architecture:
  unit tests for domain and use cases with fakes/mocks, integration tests for
  Eloquent repositories, feature tests for HTTP delivery. Use when adding or
  fixing tests/ PHP files, use cases, repositories, controllers, or Pest
  configuration for tradeup-api.
---

# Pest & Laravel testing (trade-up / tradeup-api)

Authoritative doc: **[docs/back-end/tests.md](../../../../docs/back-end/tests.md)**. Architecture: **[docs/back-end/architecture.md](../../../../docs/back-end/architecture.md)**. Shared mindset: **[docs/shared/testing-anti-patterns.md](../../../../docs/shared/testing-anti-patterns.md)**.

---

## What to test by layer

| Layer | Target | DB | Notes |
| ----- | ------ | -- | ----- |
| **Domain** | Entities, value objects, domain services | No | Plain Pest; `expect()` / exceptions |
| **Application** | Use cases | Usually no | Inject **fake repositories** or Mockery for ports |
| **Infrastructure** | Eloquent repos, mappers | Yes | `RefreshDatabase` or agreed trait |
| **Feature / HTTP** | Routes, auth, JSON contract | If needed | `get` / `post` / `actingAs` |

Do **not** boot Laravel for **pure** domain tests (no `TestCase` unless required).

---

## Use case test (fake port)

Prefer a **small in-memory fake** implementing the domain/application repository interface:

```php
// tests/Unit/Application/Identity/RegisterUserTest.php (path illustrative)

it('should persist a new user when email is not taken', function () {
    $users = new class implements UserRepository {
        public array $saved = [];
        public function findByEmail(string $email): ?User { return null; }
        public function save(User $user): void { $this->saved[] = $user; }
    };

    $useCase = new RegisterUser($users);
    $useCase->execute(new RegisterUserInput(
        email: 'a@example.com',
        name: 'Ada',
        password: 'secret-secret',
    ));

    expect($users->saved)->toHaveCount(1);
    expect($users->saved[0]->email()->value())->toBe('a@example.com');
});
```

Adjust namespaces, DTOs, and constructor to the feature. Use **Mockery** only when behaviour is call-sequence-sensitive.

---

## Infrastructure test (repository)

```php
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('should round-trip user persistence', function () {
    $repo = app(EloquentUserRepository::class);
    $user = User::register(email: 'b@example.com', name: 'Bob');

    $repo->save($user);
    $found = $repo->findById($user->id());

    expect($found)->not->toBeNull();
    expect($found->email()->value())->toBe('b@example.com');
});
```

Wire the concrete implementation in **`TestCase`** / service provider as in production.

---

## Feature test (HTTP)

```php
it('should return 422 when email is invalid', function () {
    $this->postJson('/api/register', [
        'email' => 'not-an-email',
        'name' => 'Test',
        'password' => 'password-password',
    ])->assertUnprocessable();
});
```

Use **`actingAs($user)`** when testing authorised routes.

---

## Practices

- Case names: **`it('should …')`** or **`test('should …')`**.
- **No real HTTP** to third parties in CI — Laravel `Http::fake()` or substitute the port.
- After **mock** assertions, ask whether the test still proves **product behaviour** (see anti-patterns doc).
- **`tests/Pest.php`:** Feature suite extends `Tests\TestCase`; add `->in('Unit')` rules when you split fast vs slow folders.

---

## Commands

```bash
cd tradeup-api && php artisan test
cd tradeup-api && php artisan test --filter=RegisterUser
```
