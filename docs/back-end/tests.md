# Testing — Back-End (Laravel / tradeup-api)

Definition of how to write and organise automated tests for **tradeup-api**. The default runner is **Pest** with **`pestphp/pest-plugin-laravel`**, invoked via `php artisan test` (see `composer.json` scripts).

Tests must respect the same **layer boundaries** as production code ([architecture.md](./architecture.md)): domain and application tests stay **fast and framework-light**; database and HTTP belong in dedicated integration/feature tests.

---

## Documents in this folder

| Document | Content |
| -------- | ------- |
| [architecture.md](./architecture.md) | Domain, Application, Infrastructure, delivery |
| [code-quality.md](./code-quality.md) | SOLID, style, review checklist |

---

## Test pyramid

Prefer **many unit tests**, a **medium** number of use-case/integration tests, and **fewer** full HTTP feature tests. End-to-end browser tests are out of scope until explicitly adopted.

```
        /\
       /  \     Feature (HTTP, fewer)
      /____\
     /      \   Infrastructure / DB integration
    /________\
   /          \  Unit — Domain & Application (largest)
  /______________\
```

---

## Naming

- Pest: **`it('should …')`** or **`test('should …')`** — describe **observable behaviour**, not implementation.
- PHPUnit-style (if used): same convention with `@test` or `test_` methods aligned with project norms.

---

## What to test by layer

| Layer | Target | Database | Typical tools |
| ----- | ------ | -------- | ------------- |
| **Domain** | Entities, value objects, domain services — invariants, factories, equality | No | Pest, plain `expect()` |
| **Application** | Use cases with **fakes** or **Mockery** for ports (repositories, clock) | No* | Pest, `mock()`, or hand-written fakes |
| **Infrastructure** | Eloquent repository implementations, mappers row ↔ entity | Yes (`RefreshDatabase` or transactions) | Pest + Laravel `TestCase` |
| **Delivery** | Routes, controllers, FormRequests — status, JSON shape, auth middleware | Yes when persistence involved | Pest `get()`, `post()`, `actingAs()` |

\*If a use case intentionally wraps a single DB transaction, an **integration** test with an in-memory or sqlite DB is acceptable; still avoid testing the domain rules only through the DB.

---

## Domain & Application (unit-first)

- **Construct entities and VOs** with valid and invalid data; assert exceptions or validation failures at the right boundary.
- **Use cases:** instantiate with **interface implementations** you control:
  - **Fake / in-memory repository** (array-backed) for happy path and edge cases.
  - **Mockery** only when expecting **call counts** or **sequence** — prefer fakes for readability ([testing anti-patterns](../shared/testing-anti-patterns.md) — do not assert on mock trivia as product behaviour).
- **Do not** boot the full Laravel application for pure domain tests — no `TestCase` unless you need the container.

Example shape (conceptual):

```php
it('should reject a negative amount', function () {
    expect(fn () => Money::fromDecimal('-1', 'BRL'))
        ->toThrow(InvalidArgumentException::class);
});
```

---

## Infrastructure (integration)

- Use **`Illuminate\Foundation\Testing\RefreshDatabase`** (or project-agreed trait) when migrations must apply.
- Test **mapping** from Eloquent attributes to domain types and back; test **repository** `save` / `findById` round-trips at this layer.
- Keep one **concept per test file** where possible; share setup via Pest `beforeEach` or helpers in `tests/Pest.php` / `tests/Support`.

---

## Feature / HTTP (delivery)

- Use Pest Laravel helpers: **`get`**, **`post`**, **`put`**, **`delete`**, **`actingAs`** for authenticated routes.
- Assert **HTTP status**, **JSON structure**, and **business-relevant fields** — not every framework key unless the contract requires it.
- **Thin controllers:** when controllers only delegate to a use case, favour **one feature test per endpoint** plus **use case unit tests** for behaviour; avoid duplicating every branch only at HTTP level.

---

## Pest configuration

- `tests/Pest.php` extends **`Tests\TestCase`** for **`Feature`** tests by default — adjust `->in(...)` if you add custom suites (e.g. `Unit` without Laravel).
- Place **fast tests** under `tests/Unit/` with minimal bootstrap if you split suites later; keep **Feature** for HTTP and full app wiring.

---

## Test doubles & anti-patterns

- **Do** inject ports (interfaces) into use cases and swap fakes in tests.
- **Do not** put **business rules only in tests** — tests observe production code.
- **Do not** hit **real third-party APIs** in CI — use `Http::fake()` or interface + fake implementation.

Shared mindset: [testing anti-patterns.md](../shared/testing-anti-patterns.md).

---

## Commands

```bash
cd tradeup-api
php artisan test                 # full suite
php artisan test --filter=Name   # focused run
```

---

## Summary

- **Pest** as default; **layer-appropriate** tests (unit inward, DB/HTTP outward).
- **Fakes** over heavy mocking for use cases when possible.
- **Feature tests** validate HTTP contracts; **use case tests** own orchestration logic.
