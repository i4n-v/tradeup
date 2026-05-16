# Implementation Plan: Mini Binance Platform

**Branch**: `001-mini-binance-platform` | **Date**: 2026-05-16 | **Spec**: [`spec.md`](./spec.md)  
**Input**: Feature specification from `/specs/001-mini-binance-platform/spec.md` plus stack and UX direction (Laravel API + React Native, WeCopyTrade-inspired visual language).

**Note**: This file is the `/speckit.plan` output. Tasks live in `tasks.md` (from `/speckit.tasks`).

## Summary

Deliver a **Mini Binance**–style trading experience: **registration, login, dashboard** (BRL/BTC balances + BTC quote), **buy/sell** with domain rules and **history** (newest first), **profile** (name + avatar; email immutable in v1). Back end **`tradeup-api`**: Laravel **API-only**, **Sanctum** (token), **PostgreSQL**, **Redis** + **Horizon** for queues, **Docker Compose** for local infra. App **`tradeup-app`**: React Native, **NativeWind** (avoid `StyleSheet` except where necessary), **react-hook-form** + **zod**, **zustand**, **@tanstack/react-query**, **AsyncStorage** with a central keys module. UI follows the **visual language** in `docs/front-end/visual-reference/` (vibrant yellow, heavily rounded cards, high contrast) — **does not** copy “copy trade” features from the reference images.

## Technical Context

**Language/Version**: PHP ^8.3, Laravel ^13 (**tradeup-api**); TypeScript / React Native (**tradeup-app**).  
**Primary Dependencies (API)**: Laravel Sanctum, Horizon, Redis client, Pest; queue workers via Horizon.  
**Primary Dependencies (App)**: react-hook-form, zod, @hookform/resolvers, zustand, @tanstack/react-query, @react-native-async-storage/async-storage, nativewind, project Tailwind preset.  
**Storage**: PostgreSQL (wallet, users, transactions, avatar files); Redis (cache, queues, Horizon).  
**Testing**: Pest + Laravel (**tradeup-api**); Jest + React Native Testing Library per `docs/front-end/tests.md` (**tradeup-app**).  
**Target Platform**: HTTP(S) API consumed by the app; iOS + Android (RN).  
**Project Type**: Mobile client + JSON API (no Blade/server UI beyond framework needs).  
**Performance Goals**: Trades feel < 2s on local dev network; queues not on the synchronous hot path (validation + atomic persist in the request).  
**Constraints**: Monetary rules from spec (BRL scale-2, BTC scale-8 half-up, BRL/BTC price scale-2 in band); per-wallet concurrency via DB transactions / appropriate locking.  
**Scale/Scope**: Educational MVP; hundreds/low thousands of users — no exotic optimisation in v1.

## Constitution Check

*GATE: Passed for planning. Re-check after implementation of each phase.*

| Principle | How this plan satisfies it |
|-----------|----------------------------|
| **Code quality** | DDD/Clean Architecture in `tradeup-api` (`docs/back-end`); MVVM + Registry in `tradeup-app` (`docs/front-end`). Explicit contracts in `contracts/openapi.yaml`. |
| **Testing** | Pest: domain use cases + HTTP features + repository tests where applicable; RN: ViewModels + query integration with mocks. Trades and auth = critical paths. |
| **Performance** | React Query stale time for quotes; avoid list re-renders; API indexes (`user_id`, `created_at`). |
| **Security & privacy** | Sanctum, HTTPS in prod, hashed passwords, per-user authorisation in each use case, server-side validation, avatar size/type limits (define when implementing). |
| **Mobile UI/UX** | Loading/empty/error per screen; confirmation for destructive trade actions; NativeWind theme aligned to mood board. |
| **Maintainability** | Suggested bounded context `Trading` (or User/Trading split); RN modules per feature. |
| **Accessibility** | `accessibilityLabel`, validate yellow/black/white contrast, minimum touch targets (`min-h` / `p`). |
| **Decoupling** | Client depends on OpenAPI contract; domain use cases do not know Eloquent; HTTP client injected via Registry in the app. |

## Project Structure

### Documentation (this feature)

```text
specs/001-mini-binance-platform/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── README.md
│   └── openapi.yaml
└── tasks.md              # /speckit.tasks
```

### Source Code (repository root)

```text
tradeup-api/
├── app/
│   ├── Domain/Trading/ ...          # entities, ports, invariants
│   ├── Application/Trading/UseCases/...
│   ├── Infrastructure/Trading/...   # Eloquent, repositories, avatar storage
│   └── Http/Controllers/Api/V1/...  # thin → DTO → use case
├── database/migrations/
├── routes/api.php
├── docker-compose services consumed from repo root (see ../docker-compose.yml)
└── tests/ (Pest)

tradeup-app/
├── src/
│   ├── features/                    # register, login, dashboard, trade, history, profile
│   ├── components/                # design system + form field wrappers (hook-form)
│   ├── lib/registry/
│   ├── lib/storage/keys.ts        # centralised AsyncStorage keys
│   └── ...
├── docs: ../docs/front-end
└── __tests__ or *.test.tsx

docs/
├── back-end/
├── front-end/
│   ├── visual-reference/         # mood board (visual reference only)
│   └── ...
├── shared/
docker-compose.yml                 # PostgreSQL + Redis (+ volumes)

README.md                          # monorepo overview + links
```

**Structure Decision**: Monorepo with **`tradeup-api`** (Laravel API) and **`tradeup-app`** (React Native). Shared local infra in **root `docker-compose.yml`**; PHP runs on the host (or a future container) — MVP documented in `quickstart.md` with Postgres/Redis in Docker.

## Incremental delivery phases (thin slices)

Each phase should be **integrable and testable** end-to-end (or API + contract where the app is not ready yet).

| Phase | Minimum scope | Done criteria |
|-------|---------------|---------------|
| **P0** | Docker Compose (Postgres + Redis), API `.env`, Sanctum + health routes, Registry + NativeWind theme + AsyncStorage keys | `docker compose up` healthy; API answers ping; app opens navigable shell |
| **P1** | **Registration** (+ initial wallet 10,000.00 BRL) | User + wallet in DB; Pest tests; registration screen with componentised form |
| **P2** | **Login** + token persistence (AsyncStorage) + React Query session | Sanctum token; auth interceptor; login tests |
| **P3** | **Dashboard** balances + quote (aggregated endpoint or two calls) | Values match spec scales; card UI in mood-board style |
| **P4** | **Buy** BTC (atomic use case + DB transaction) | Safe concurrency; balance errors; rounding per spec |
| **P5** | **Sell** BTC | Same as P4 |
| **P6** | **History** (desc by time) | RN list + simple pagination if needed |
| **P7** | **Profile** name + avatar (disk storage + public URL via API) | Email immutable; MIME/size validation |

## Mobile visual direction (not copy-trade features)

Reference: `docs/front-end/visual-reference/mood-board-1.png`, `mood-board-2.png`.

- **Primary**: saturated yellow (buttons, highlights); **background**: white; **text**: dark grey/black; **positive/negative**: green/red for amounts where relevant.  
- **Shape**: `rounded-2xl` / `rounded-3xl`, soft shadows, pill buttons.  
- **Componentisation**: `Button` (variants), `Card`, `TextField` / `FormField` with **react-hook-form `Controller`**, `Screen`, `ListRow` for history.  
- **Navigation**: auth stack + main tabs (Home/Dashboard, Trade or modals, History, Profile) — detail in `tasks.md`.

## Complexity Tracking

> No constitution violation requiring formal exception; DDD + MVVM complexity is **repo-standard** per `docs/`.

## Post–Phase 1 design gate

- `data-model.md` and `contracts/openapi.yaml` aligned with clarifications (scales, immutable email, history sort).  
- **Constitution Check**: remains **pass**; suggested next step: `/speckit.tasks` to break work into phases above.
