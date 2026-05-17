---
description: "Task list — Mini Binance Platform (compact phases by feature)"
---

# Tasks: Mini Binance Platform

**Feature dir**: `/Users/vinicius/personal-projects/trade-up/specs/001-mini-binance-platform/`  
**Inputs**: [`plan.md`](./plan.md), [`spec.md`](./spec.md), [`data-model.md`](./data-model.md), [`contracts/openapi.yaml`](./contracts/openapi.yaml), [`quickstart.md`](./quickstart.md)

**Tests**: Automated tests **required** for behavioral changes (`.specify/memory/constitution.md`): **Pest** under `/Users/vinicius/personal-projects/trade-up/tradeup-api/tests/`; React Native with Jest + RNTL per `docs/front-end/tests.md`. Write tests first where noted (**red → green**).

## Official checkbox format

`- [ ] Tnnn [P] [USn] Description with absolute path OR path from repo root`

- **`[P]`**: parallelizable (distinct files, no dependency on incomplete peer work)
- **`[USn]`**: User Story (`spec.md` § User Scenarios): US1 registration … US7 profile

**Path conventions** (monorepo):

- API: `/Users/vinicius/personal-projects/trade-up/tradeup-api/...`
- App: `/Users/vinicius/personal-projects/trade-up/tradeup-app/src/...`
- Contracts: `/Users/vinicius/personal-projects/trade-up/specs/001-mini-binance-platform/contracts/openapi.yaml`
- Compose: `/Users/vinicius/personal-projects/trade-up/docker-compose.yml`

---

## Phase 1: Setup — minimal infrastructure

**Purpose**: Postgres + Redis in Compose, env wiring, and navigable app shell (aligned with `plan.md` P0).

- [X] T001 Confirm or update `postgres` + `redis` services in `/Users/vinicius/personal-projects/trade-up/docker-compose.yml` for local dev with ports consistent with `tradeup-api/.env.example`
- [X] T002 Sync `/Users/vinicius/personal-projects/trade-up/tradeup-api/.env.example` with Compose (DB_HOST, REDIS_HOST, SESSION/Sanctum) and local URLs for QA/spec runs
- [X] T003 [P] Sync `/Users/vinicius/personal-projects/trade-up/tradeup-app/.env.example` (`API_BASE_URL` → `http://localhost:8000/api/v1` or equivalent)
- [X] T004 Verify MVP bootstrap steps in `/Users/vinicius/personal-projects/trade-up/specs/001-mini-binance-platform/quickstart.md` still match T001–T003

---

## Phase 2: Foundational — blocks all feature work

**Purpose**: single relational model + Sanctum + HTTP `/api/v1` skeleton + RN Registry/HTTP client/theme before registration/login.

**Checkpoint**: migrations apply cleanly; `/api/v1` answers (health/ping); RN has HTTP layer.

- [X] T005 Consolidate `users`, `wallets`, `transactions` migrations per `/Users/vinicius/personal-projects/trade-up/specs/001-mini-binance-platform/data-model.md` under `/Users/vinicius/personal-projects/trade-up/tradeup-api/database/migrations/`
- [X] T006 [P] Update Eloquent `User` model and factory in `/Users/vinicius/personal-projects/trade-up/tradeup-api/app/Models/User.php` (`/Users/vinicius/personal-projects/trade-up/tradeup-api/database/factories/UserFactory.php` as needed)
- [X] T007 Configure Sanctum (API guard, PAT), CORS/`Accept` JSON-only, `/api/v1` prefix in `/Users/vinicius/personal-projects/trade-up/tradeup-api/routes/api.php` + `/Users/vinicius/personal-projects/trade-up/tradeup-api/bootstrap/app.php` (Laravel 13 style)
- [X] T008 [P] Scaffold `Wallet` / `Transaction` Eloquent + initial domain mapping in `/Users/vinicius/personal-projects/trade-up/tradeup-api/app/Infrastructure/Trading/` (or path created by create-ddd-module)
- [X] T009 Update `/Users/vinicius/personal-projects/trade-up/specs/001-mini-binance-platform/contracts/openapi.yaml`: **POST /auth/register `201` returns no Bearer** (FR-001a); **GET /transactions** uses `page` + `limit` (FR-027); decimal fields as strings in JSON
- [X] T010 [P] RN core modules: `/Users/vinicius/personal-projects/trade-up/tradeup-app/src/configs/di-container.config.ts` Registry, HTTP client abstraction, Bearer interceptor placeholder
- [X] T011 [P] Centralize AsyncStorage keys in `/Users/vinicius/personal-projects/trade-up/tradeup-app/src/lib/storage/keys.ts`; add brief comment only for future SecureStore migration
- [X] T012 [P] Apply NativeWind base theme (mood-board colors) in `/Users/vinicius/personal-projects/trade-up/tradeup-app/App.tsx` + shell components in `/Users/vinicius/personal-projects/trade-up/tradeup-app/src/components/`

---

## Phase 3: Registration feature — US1 + initial wallet (P1) 🎯 MVP

**Goal**: Create `User` + seed `Wallet` (10,000.00 BRL); **no** PAT in response (FR-001a).

**Independent test**: Register → DB consistent; protected call without login → 401; OpenAPI + Pest confirm no token payload.

### Tests first

- [X] T013 [P] [US1] Pest feature `RegistrationTest.php` in `/Users/vinicius/personal-projects/trade-up/tradeup-api/tests/Feature/Auth/RegistrationTest.php` (201, wallet seed, duplicate email 422)
- [X] T014 [P] [US1] RN register ViewModel TDD `register.view-model.test.ts` in `/Users/vinicius/personal-projects/trade-up/tradeup-app/src/screens/register/register.view-model.test.ts` (valid / invalid zod paths; mocks)

### Implementation

- [X] T015 [US1] Register user + provision wallet use case under `tradeup-api/app/Application/` (e.g. `/Users/vinicius/personal-projects/trade-up/tradeup-api/app/Application/Auth/` per `.cursor/skills/back-end/create-ddd-module/SKILL.md`)
- [X] T016 [US1] Thin `POST /api/v1/auth/register` controller in `/Users/vinicius/personal-projects/trade-up/tradeup-api/app/Http/Controllers/Api/V1/Auth/RegisterController.php`
- [X] T017 [P] [US1] RN folder `/Users/vinicius/personal-projects/trade-up/tradeup-app/src/screens/register/` (MVVM: model, view-model, view, component binder; react-hook-form + zod)
- [X] T018 [US1] Router `/Users/vinicius/personal-projects/trade-up/tradeup-app/src/routes/router.tsx` + `unauth/unauth.route.tsx` + `auth/auth.route.tsx` — token hydration + reactive auth/unauth switch

---

## Phase 4: Login / session feature — US2 Sanctum (P1)

**Goal**: PAT 7-day TTL, logout revokes token; Bearer on subsequent calls.

**Independent test**: Login → token persisted + interceptor; logout → next protected 401; Pest + RN session/query tests.

### Tests first

- [X] T019 [P] [US2] Pest `LoginLogoutTest.php` in `/Users/vinicius/personal-projects/trade-up/tradeup-api/tests/Feature/Auth/LoginLogoutTest.php`
- [X] T020 [P] [US2] RN login ViewModel TDD `login.view-model.test.ts` in `/Users/vinicius/personal-projects/trade-up/tradeup-app/src/screens/login/login.view-model.test.ts`

### Implementation

- [X] T021 [US2] `POST /auth/login`, `POST /auth/logout` with Sanctum `createToken` + revoke under `/Users/vinicius/personal-projects/trade-up/tradeup-api/app/Http/Controllers/Api/V1/Auth/`
- [X] T022 [US2] Zustand session store `/Users/vinicius/personal-projects/trade-up/tradeup-app/src/stores/session.store.ts` + login MVVM `/Users/vinicius/personal-projects/trade-up/tradeup-app/src/screens/login/` (persist Bearer token, reactive router switch)

---

## Phase 5: Dashboard feature — US3 balances + quote (P1)

**Goal**: Aggregated endpoint + explicit “quote unavailable” without fake compliant price (FR-012 / FR-014).

**Independent test**: Balances match authoritative wallet; valid quote inside band OR payload explicitly unavailable.

### Tests first

- [X] T023 [P] [US3] Pest `GetDashboardTest.php` in `/Users/vinicius/personal-projects/trade-up/tradeup-api/tests/Feature/Dashboard/GetDashboardTest.php`
- [X] T024 [P] [US3] RN `dashboard.view-model.test.ts` in `/Users/vinicius/personal-projects/trade-up/tradeup-app/src/screens/dashboard/dashboard.view-model.test.ts`

### Implementation

- [X] T025 [US3] MVP quote service + failure path in `/Users/vinicius/personal-projects/trade-up/tradeup-api/app/Application/Trading/` or matching `Infrastructure/` (no synthetic compliant price when authority missing per FR-012)
- [X] T026 [US3] `GET /dashboard` controller assembling wallet + quote state in `/Users/vinicius/personal-projects/trade-up/tradeup-api/app/Http/Controllers/Api/V1/DashboardController.php`
- [X] T027 [P] [US3] RN Dashboard MVVM in `/Users/vinicius/personal-projects/trade-up/tradeup-app/src/screens/dashboard/` (NativeWind yellow balance card, quote card, loaders/empty/error)

---

## Phase 6: Trading feature — US4 BUY + US5 SELL (P1) — two checkpoints in one condensed phase

**Goal**: BUY/SELL inside one DB transaction; reject insufficient funds, missing quote, post-round zero BTC/BRL (FR-019 / FR-023), concurrency-safe wallet updates.

### Checkpoint **Buy (US4)**

#### Tests first

- [X] T028 [P] [US4] Pest concurrency + rounding `BuyTradeTest.php` in `/Users/vinicius/personal-projects/trade-up/tradeup-api/tests/Feature/Trading/BuyTradeTest.php`

#### Implementation

- [X] T029 [US4] BUY use case + wallet lock (`amountBRL`, btcGain FR-019) in `/Users/vinicius/personal-projects/trade-up/tradeup-api/app/Application/Trading/UseCases/` (or bounded-context path from create-ddd-module)
- [X] T030 [US4] `POST /trades/buy` in `/Users/vinicius/personal-projects/trade-up/tradeup-api/app/Http/Controllers/Api/V1/Trades/BuyTradeController.php`
- [X] T031 [P] [US4] RN buy MVVM + optimistic update in `/Users/vinicius/personal-projects/trade-up/tradeup-app/src/screens/buy-trade/` (TDD: `buy-trade.view-model.test.ts`)

### Checkpoint **Sell (US5)**

#### Tests first

- [X] T032 [P] [US5] Pest `SellTradeTest.php` in `/Users/vinicius/personal-projects/trade-up/tradeup-api/tests/Feature/Trading/SellTradeTest.php`

#### Implementation

- [X] T033 [US5] SELL use case (`brlGain` FR-023) in same bounded context as T029 under `/Users/vinicius/personal-projects/trade-up/tradeup-api/app/Application/Trading/` (or equivalent)
- [X] T034 [US5] `POST /trades/sell` in `/Users/vinicius/personal-projects/trade-up/tradeup-api/app/Http/Controllers/Api/V1/Trades/SellTradeController.php`
- [X] T035 [P] [US5] RN sell MVVM + optimistic update in `/Users/vinicius/personal-projects/trade-up/tradeup-app/src/screens/sell-trade/`

---

## Phase 7: History feature — US6 paged list (P2)

**Goal**: `page`/`limit`, max 200, default 50, owner-only, `created_at` DESC UTC (FR-027 / FR-031).

### Tests first

- [X] T036 [P] [US6] Pest pagination `TransactionsListTest.php` in `/Users/vinicius/personal-projects/trade-up/tradeup-api/tests/Feature/Trading/TransactionsListTest.php`
- [X] T037 [P] [US6] RN history ViewModel covered by service contract; MVVM in `/Users/vinicius/personal-projects/trade-up/tradeup-app/src/screens/history/` (page-based pagination)

### Implementation

- [X] T038 [US6] Query repository + presenter for `GET /transactions` under `/Users/vinicius/personal-projects/trade-up/tradeup-api/app/Infrastructure/Trading/` and controller `/Users/vinicius/personal-projects/trade-up/tradeup-api/app/Http/Controllers/Api/V1/TransactionController.php`
- [X] T039 [US6] RN History MVVM in `/Users/vinicius/personal-projects/trade-up/tradeup-app/src/screens/history/` (FlatList, type badges, BUY/SELL row, empty + error states)

---

## Phase 8: Profile feature — US7 name + avatar (P2)

**Goal**: PATCH name OK; multipart avatar validates JPEG/PNG/WebP ≤ 5 MB / ≤ 4096 px; email untouched (FR-007).

### Tests first

- [X] T040 [P] [US7] Pest multipart `ProfileUpdateTest.php` in `/Users/vinicius/personal-projects/trade-up/tradeup-api/tests/Feature/Profile/ProfileUpdateTest.php`
- [X] T041 [P] [US7] RN profile ViewModel covered by service layer; MVVM in `/Users/vinicius/personal-projects/trade-up/tradeup-app/src/screens/profile/`

### Implementation

- [X] T042 [US7] Avatar disk storage under `tradeup-api/storage/app/public/avatars/` + `php artisan storage:link` documented in `/Users/vinicius/personal-projects/trade-up/tradeup-api/README.md` if missing
- [X] T043 [US7] `PATCH /profile`, `POST /profile/avatar` in `/Users/vinicius/personal-projects/trade-up/tradeup-api/app/Http/Controllers/Api/V1/ProfileController.php`
- [X] T044 [P] [US7] RN Profile MVVM in `/Users/vinicius/personal-projects/trade-up/tradeup-app/src/screens/profile/` (name update + optimistic, logout with token clear)

---

## Phase 9: Polish — short cross-cutting pass

- [X] T045 [P] Re-read `openapi.yaml` and refresh excerpt in `/Users/vinicius/personal-projects/trade-up/specs/001-mini-binance-platform/contracts/README.md`
- [X] T046 [P] Extra indexes per “Indexes” in `specs/001-mini-binance-platform/data-model.md` via new migration `/Users/vinicius/personal-projects/trade-up/tradeup-api/database/migrations/*_add_mini_binance_indexes.php` or extend existing migrations (document rollback)
- [X] T047 [P] Accessibility: `accessibilityRole`, `accessibilityLabel`, `hitSlop` on all screens under `/Users/vinicius/personal-projects/trade-up/tradeup-app/src/screens/` + compound Button with `accessibilityState`
- [X] T048 Run manual sanity checklist from `/Users/vinicius/personal-projects/trade-up/specs/001-mini-binance-platform/quickstart.md`

---

## Dependencies & ordering

| Gate | Depends on |
|------|-------------|
| Phase 2 | after Phase 1 |
| Registration → Login → Dashboard → Trading → History → Profile | after Phase 2; **registration before login**; typical cascade: login before Dashboard/Trade/History/Profile |
| History (US6) | meaningful verification after BUY/SELL created ≥1 tx (parallel API stubs possible but QA needs real trades) |

### Useful parallelism (examples)

- **US1**: RN form (`T017`) can advance in parallel conceptually once DTO/use case stabilizes (`T015`/`T016` done).
- **US4 vs US5 Pest** different files marked `[P]`.
- **US6**: RN list test (`T037`) parallel to server repo (`T038`) once response shape frozen.

---

## Quick counts

| Block | Tasks |
|-------|-------|
| Setup | 4 |
| Foundational | 8 |
| US1 Registration | 6 |
| US2 Login | 4 |
| US3 Dashboard | 5 |
| US4 BUY | 4 |
| US5 SELL | 4 |
| US6 History | 4 |
| US7 Profile | 5 |
| Polish | 4 |
| **Total** | **48** (T001–T048) |

**Minimum navigable MVP** ends after Phase 5 (`T027`); **recommended economic MVP**: include at least BUY checkpoint **T029–T031** (matches `plan.md` P4).

---

## Extension Hooks (`before_tasks`)

**Optional Pre-Hook**: git · Command `/speckit.git.commit` — Commit outstanding changes before task generation?

## Extension Hooks (`after_tasks`)

**Optional Hook**: git · Command `/speckit.git.commit` — Commit task changes?
