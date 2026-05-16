---
name: create-ddd-module
description: >-
  Scaffolds a vertical slice in tradeup-api following Clean Architecture +
  DDD: Domain (entity, repository interface, value objects), Application
  (use case, input/output DTOs), Infrastructure (Eloquent model, repository
  implementation, mapper), service provider bindings, thin HTTP controller and
  route. Use when adding a new bounded-context feature, capability, or use case
  to tradeup-api app/Domain, app/Application, app/Infrastructure.
---

# Create DDD module / vertical slice (tradeup-api)

Authoritative layout: **[docs/back-end/architecture.md](../../../../docs/back-end/architecture.md)**. Quality bar: **[docs/back-end/code-quality.md](../../../../docs/back-end/code-quality.md)**. Testing: **[docs/back-end/tests.md](../../../../docs/back-end/tests.md)** and skill **pest-laravel-test**.

Use **one bounded context folder name** (PascalCase namespace segment), e.g. `Identity`, `Billing`, `Catalog`.

---

## Dependency rule (non-negotiable)

```text
HTTP / Jobs   →  Application (use case)  →  Domain
                     ↓ implements
              Infrastructure (Eloquent, APIs)
```

- **`App\Domain\...`** — no Laravel facades, no `Illuminate\*` except pure PHP or rare **contracts** agreed by the team.
- **`App\Application\...`** — depends on **Domain** + **ports**; never on concrete Eloquent repositories.
- **`App\Infrastructure\...`** — implements ports; may use Eloquent, `DB`, HTTP clients.

---

## Checklist (order matters)

### 1. Domain — `app/Domain/<Context>/`

- **Value objects** first if needed (`Email`, `Money`, ids) — immutable, self-validating `__construct`.
- **Entity** (or aggregate root) — identity, behaviour, invariants; avoid anemic setters for rules that must always hold.
- **Repository interface** — `interface XRepository { public function findById(XId $id): ?X; public function save(X $aggregate): void; }` (tailor methods to the aggregate).

### 2. Application — `app/Application/<Context>/`

- **Input DTO** — `readonly class FooInput` (or array + lightweight validator only at app edge if team prefers).
- **Use case** — single public method e.g. `execute(FooInput $input): FooResult`; constructor-inject **repository interfaces** and small ports (`Clock`, `EventDispatcher` interface if used).
- **Output DTO / domain return** — prefer explicit DTO for HTTP later; returning a **domain entity** is OK if delivery maps it.

### 3. Infrastructure — `app/Infrastructure/<Context>/` (or `Persistence/Eloquent/`)

- **Eloquent model** — `app/Infrastructure/.../UserModel.php` extending `Model`; table name via convention or `$table`.
- **Mapper** — static or dedicated class: `toDomain(UserModel $m): User` / `fromDomain(User $u): array` to avoid mapping clutter in repository.
- **Repository implementation** — `class EloquentUserRepository implements UserRepository` using model + mapper.

### 4. Composition root

- Register binding in **`App\Providers\AppServiceProvider`** (or a context-specific provider):

```php
$this->app->bind(UserRepository::class, EloquentUserRepository::class);
```

Constructor-inject **`UserRepository`** into the use case; resolve use case from container when wiring delivery.

### 5. Delivery

- **`routes/api.php`** (or versioned file) — route definition only.
- **Controller** — inject use case; `__invoke` or single action; validate with **FormRequest**; map to input DTO; return `response()->json(...)` or API Resource.

---

## Naming

| Piece | Pattern |
| ----- | ------- |
| Use case | **Verb + noun** — `RegisterUser`, `CancelOrder` |
| Repo interface | `ThingRepository` in Domain |
| Eloquent impl | `EloquentThingRepository` in Infrastructure |
| Model | `ThingModel` or team convention — never confuse with domain entity name in imports |

---

## Tests to add (minimum)

1. **Domain / VO** — invariant tests (no DB).
2. **Use case** — with **fake** repository covering success + one failure path.
3. **Eloquent repository** — one **integration** test with `RefreshDatabase` if persistence is non-trivial.
4. **Feature** — HTTP **acceptance** of happy path + one validation error.

---

## Pragmatic shortcuts (small CRUD)

For trivial admin-only CRUD, a thin route → controller → **single use case** that wraps one repository call is still valid; **do not** skip the **use case** class if any non-trivial rule exists or will appear next sprint.

---

## Aftercare

- Run **`vendor/bin/pint`** on new files.
- Run **`php artisan test`** for the new / affected tests.

Reference: [architecture.md](../../../../docs/back-end/architecture.md) · [code-quality.md](../../../../docs/back-end/code-quality.md) · [tests.md](../../../../docs/back-end/tests.md)
