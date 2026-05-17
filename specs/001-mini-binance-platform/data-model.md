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
| `updated_at` | timestamp | touched on each trade |

**Invariants**: never negative; updates only inside the same DB transaction that inserts `transactions`.

---

### `transactions`

| Column | Type | Rules |
|--------|------|--------|
| `id` | bigserial PK | |
| `user_id` | bigint FK | |
| `type` | enum `BUY` / `SELL` | |
| `btc_amount` | numeric(18,8) | scale 8 |
| `brl_amount` | numeric(18,2) | scale 2 (BRL debited/credited per type) |
| `btc_price_brl` | numeric(12,2) | execution price BRL per 1 BTC, spec band |
| `created_at` | timestamp | history ordered **DESC** |

**Invariants**: immutable after insert; always tied to a successful trade.

---

### Quote (runtime)

Not a mandatory table in v1; optional `market_quotes` for audit. MVP: service computes quote at execution time; only `transactions.btc_price_brl` is persisted.

---

## State transitions (wallet + transaction)

See `spec.md` *State Transitions (Trading)*. Summary:

1. **BUY**: debit requested `brl_amount`; credit `btc_amount` = `RND8(amountBRL / price)`; insert `transactions` (BUY).
2. **SELL**: debit requested `btc_amount`; credit `brl_amount` = `RND2(amountBTC * price)`; insert `transactions` (SELL).

All in a single **database** transaction; failure → full rollback.

---

## Validation highlights (API)

- BRL input: at most **2** decimal places.
- BTC SELL input: at most **8** decimal places.
- `btc_price_brl` at execution: between **200000.00** and **300000.00**.

---

## Indexes

- `wallets(user_id)` unique  
- `transactions(user_id, created_at DESC)`  
- `users(email)` unique  
