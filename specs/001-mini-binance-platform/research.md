# Research: Mini Binance Platform

**Feature**: `001-mini-binance-platform`  
**Date**: 2026-05-16

Consolidated technical decisions (no remaining `NEEDS CLARIFICATION` for MVP scope).

---

## 1. Back-end: Laravel as stateless API with Sanctum

**Decision**: Versioned REST API (`/api/v1/...`), **Laravel Sanctum** authentication (Personal Access Tokens or SPA token flow depending on mobile setup).  
**Rationale**: Standard Laravel approach for mobile + JSON; revocable tokens; fits thin controllers + use cases.  
**Alternatives considered**: Passport (full OAuth2 — heavy for MVP); custom JWT (more security surface to own).

---

## 2. PostgreSQL + money types

**Decision**: Monetary columns as **PostgreSQL `NUMERIC`**: `brl_amount` (18,2), `btc_amount` (18,8), `btc_price_brl` (12,2). API exposes values as **decimal strings** in JSON to avoid IEEE-754 on clients.  
**Rationale**: Matches clarifications (BRL 2 dp, BTC 8 dp, price 2 dp).  
**Alternatives considered**: Integer centavos/satoshis (possible later; spec chose explicit decimal scale).

---

## 3. Redis, queues, and Horizon

**Decision**: **Redis** for `QUEUE_CONNECTION` and cache; **Laravel Horizon** for supervision and workers. Jobs for async work (cleanup, future notifications, reprocessing); **synchronous trade** in the request with DB transaction **`SERIALIZABLE` or `REPEATABLE READ` + row lock on wallet** (final choice in implementation, document in code).  
**Rationale**: Spec requires atomicity and no inconsistent states under concurrency.  
**Alternatives considered**: Trade only via job (worse UX latency / confirmation).

---

## 4. Docker Compose (infrastructure only)

**Decision**: File at **monorepo root** with **PostgreSQL** + **Redis**; Laravel runs on the **host** (local PHP) or optional future container.  
**Rationale**: Explicit user request; less friction for `php artisan` and Xdebug.  
**Alternatives considered**: Full Sail (heavier); SQLite only (does not match Horizon/Redis goals).

---

## 5. React Native stack (app)

**Decision**: **react-hook-form** + **zod** (`@hookform/resolvers/zod`); **Zustand** for minimal global state (auth/session UI, preferences); **TanStack Query** for server data; **AsyncStorage** with a single **`src/lib/storage/keys.ts`**; **NativeWind** for styling and theme tokens (primary yellow, neutrals, large radius).  
**Rationale**: Matches user request and `docs/front-end/architecture.md` (MVVM + Registry).  
**Alternatives considered**: Formik; Redux Toolkit (more weight for MVP).

---

## 6. Componentised forms

**Decision**: Component layer `FormTextField`, `FormPasswordField`, etc., accepting `control`, `name`, linked `rules`/`schema` or `useFormContext` wrapper to avoid repeating wiring per screen.  
**Rationale**: Explicit ask for composition and DRY without breaking repo patterns.  
**Alternatives considered**: Duplicated forms per feature (rejected).

---

## 7. Internal BTC quote

**Decision**: Domain service / use case **QuoteProvider** implementation that yields a price in **200,000.00–300,000.00** (deterministic or seedable pseudo-random in dev, configurable).  
**Rationale**: Spec assumes internal source; enables reproducible tests.  
**Alternatives considered**: External exchange API (out of scope v1).

---

## 8. Avatar

**Decision**: `multipart` upload to profile endpoint; storage in **`storage/app/public`** with `php artisan storage:link` in dev + MIME/size validation on FormRequest; URL returned by API.  
**Rationale**: Simple MVP; S3 can be a later phase.  
**Alternatives considered**: Base64 in DB (rejected — weight and caching).

---

## 9. Visual reference

**Decision**: Mood board in `docs/front-end/visual-reference/*.png` guides **colour, radius, hierarchy** only.  
**Rationale**: User clarified it is not the application prototype.
