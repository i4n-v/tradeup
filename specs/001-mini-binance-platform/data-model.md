# Data Model: Mini Binance Platform

**Spec**: [`spec.md`](./spec.md)  
**Plan**: [`plan.md`](./plan.md)

## Entities

### `users`

| Column | Type | Rules |
|--------|------|--------|
| `id` | bigserial PK | |
| `name` | varchar | required, updatable in profile |
| `email` | varchar unique | immutable after registration (v1) |
| `password` | varchar | hash (bcrypt/argon per Laravel) |
| `avatar_path` | varchar nullable | relative path under public storage |
| `created_at`, `updated_at` | timestamp | |

**Relationships**: `hasOne` **wallet**.

---

### `wallets`

| Column | Type | Rules |
|--------|------|--------|
| `id` | bigserial PK | |
| `user_id` | bigint FK unique | 1:1 user |
| `brl_balance` | numeric(18,2) | ≥ 0, initial **10000.00** |
| `btc_balance` | numeric(18,8) | ≥ 0, initial **0** |
| `updated_at` | timestamp | touched on each **`COMPLETED`** trade |

**Invariants**: never negative; **`COMPLETED`** balance updates occur only inside the same DB transaction **as marking the sibling `transactions` row `COMPLETED`** ( **`BuyBtc` / `SellBtc`** in the queue worker **`TransactionManager`** + **`WalletRepository::lockForUpdate`** ).

---

### `transactions`

| Column | Type | Rules |
|--------|------|--------|
| `id` | bigserial PK | |
| `user_id` | bigint FK | |
| `type` | enum `BUY` / `SELL` | |
| `btc_amount` | numeric(18,8) | scale **8**; placeholder until **`COMPLETED`** |
| `brl_amount` | numeric(18,2) | scale **2**; spend/sell sizing per type |
| `btc_price_brl` | numeric(12,2) | execution snapshot when **`COMPLETED`**; **`0`** while **`PENDING`** |
| `status` | enum `PENDING` / `COMPLETED` / `FAILED` | **`PENDING`:** accepted, job queued **`COMPLETED`:** ledger applied **`FAILED`:** coded reason, no **`COMPLETED`** wallet movement |
| `failure_reason` | varchar nullable | stable enum string when **`FAILED`** (e.g. `QUOTE_UNAVAILABLE`, `INSUFFICIENT_BRL_FUNDS`, `INSUFFICIENT_BTC_FUNDS`, `ZERO_RESULT`, `UNKNOWN`) |
| `created_at` | timestamp | initiation instant (**UTC**); history ordered **DESC** |

**Invariants**:

- Rows move **`PENDING`** → (**`COMPLETED`** | **`FAILED`**); wallet mutates **only on `COMPLETED`**.
- **`COMPLETED`** rows are immutable (**amounts** + **`btc_price_brl`**).
- **`FAILED`** ⇒ **`failure_reason`** set for API/UX (**`failureReason`** camelCase JSON).

---

### Quote (runtime)

Not a mandatory table in v1; optional `market_quotes` for audit. MVP: service obtains quote inside **`BuyBtc` / `SellBtc`**; only persisted execution price **`btc_price_brl`** on **`COMPLETED`** rows.

---

## State transitions (wallet + transaction)

See `spec.md` *State Transitions (Trading)*. **Settlement** executes in **`ProcessBuyTradeJob` / `ProcessSellTradeJob`**:

1. **HTTP 202**: insert **`transactions`** (**`PENDING`**), enqueue job (**no wallet change**).
2. **Job**: **`BuyBtc` / `SellBtc`** in one DB txn + wallet row lock ⇒ debit/credit ⇒ **`COMPLETED`** **or** mark **`FAILED`** (**no ledger** on **`FAILED`** after failure persistence).

Insufficient balance synchronous check (**422**): **no** `transactions` row.

---

## Validation highlights (API)

- BRL input: at most **2** decimal places.
- BTC SELL input: at most **8** decimal places.
- `btc_price_brl` at execution: between **200000.00** and **300000.00** (when authoritative quote applies).

---

## Indexes

- `wallets(user_id)` unique  
- `transactions(user_id, created_at DESC)`  
- `users(email)` unique  
