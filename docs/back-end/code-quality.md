# Code quality — Back-End (tradeup-api)

Guidelines for **readable, maintainable** PHP in **tradeup-api**, aligned with [architecture.md](./architecture.md) (Clean Architecture + DDD) and Laravel 13 conventions.

---

## Documents in this folder

| Document | Content |
| -------- | ------- |
| [architecture.md](./architecture.md) | Layers, dependency rule, DDD building blocks |
| [tests.md](./tests.md) | Pest, pyramid, doubles |

---

## SOLID (practical)

### Single Responsibility (SRP)

One **reason to change** per class. A **use case** does one application story; a **repository implementation** handles persistence for one aggregate family; controllers **map HTTP ↔ use case** only. Split “god” services into named use cases or domain services.

### Open/Closed (OCP)

Extend behaviour via **new implementations** of interfaces (new strategy, new repository adapter) rather than editing large `switch` blocks. Prefer **polymorphism** at infrastructure boundaries.

### Liskov Substitution (LSP)

Implementations of domain/application **ports** must honour contracts: no surprise `throw` types, no tightened preconditions. Subtypes must remain **substitutable** where the interface is used.

### Interface Segregation (ISP)

Prefer **small, focused** interfaces (`UserRepository`, `Clock`) over a single **`GodRepository`** or wide “do everything” port. Consumers depend only on what they call.

### Dependency Inversion (DIP)

**High-level** modules (domain, application) depend on **abstractions**. **Infrastructure** and Laravel wiring implement those abstractions. **Do not** import concrete Eloquent models inside use cases except through a port’s implementation (which lives in infrastructure).

This matches the **dependency rule** in [architecture.md](./architecture.md).

---

## Related principles

- **DRY:** deduplicate **meaning**, not lines — two similar-looking pieces that encode **different rules** should not be merged blindly.
- **KISS:** simplest design that satisfies the use case; add aggregates, events, and extra layers when complexity appears, not preemptively everywhere.
- **YAGNI:** no unused abstractions “for the future” — introduce ports when you have a second implementation or a test need.

---

## Laravel & PHP style

- **Formatter:** **Laravel Pint** (`vendor/bin/pint`) — run before PR; align with project `pint.json` if present.
- **Naming:** **intent-revealing** names (`RegisterUser`, `EmailAddress`), **avoid** `Manager`, `Helper`, `Processor` without domain meaning.
- **Types:** declare **`return` types** and **parameter types** on public APIs; use **`readonly`** properties where immutability is intended (PHP 8.3+).
- **Visibility:** narrow visibility (`private` / `protected`) for implementation detail.

---

## Layer-specific checks

| Layer | Quality bar |
| ----- | ----------- |
| **Domain** | No framework imports; entities/VOs enforce invariants in constructors/methods |
| **Application** | Use cases are small; transactional boundaries explicit; DTOs for boundaries |
| **Infrastructure** | Mappers isolated; Eloquent contained; no business branching “because X column is null” without domain input |
| **Delivery** | Controllers under ~15–20 lines of glue; validation at FormRequest; authorisation in middleware/gates |

---

## Review checklist (short)

- [ ] Does this change respect **inward dependencies**?
- [ ] Is there a **use case** (or domain object) that owns the new behaviour?
- [ ] Are **interfaces** at the right layer, **implementations** in infrastructure?
- [ ] Would a **unit test** of the use case with a **fake** be straightforward?
- [ ] Naming matches **ubiquitous language** (product vocabulary)?

---

## Summary

Apply **SOLID** as a **lens** for boundaries and coupling — especially **SRP**, **ISP**, and **DIP** — together with **Pint**, **strict typing**, and **thin delivery** code. When in doubt, see [architecture.md](./architecture.md) for where a class belongs.
