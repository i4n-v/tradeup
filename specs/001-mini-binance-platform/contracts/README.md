# API Contracts — Mini Binance

| Artifact | Description |
|----------|-------------|
| [`openapi.yaml`](./openapi.yaml) | REST v1 contract (target for `tradeup-api` and `tradeup-app`). |

## Endpoints (v1)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/auth/register` | — | Create user + wallet (10 000,00 BRL seed). Returns `user` only — **no token** (FR-001a). |
| `POST` | `/auth/login` | — | Sanctum PAT (7-day TTL). Returns `token` + `user`. |
| `POST` | `/auth/logout` | Bearer | Revoke current token → 204. |
| `GET` | `/me` | Bearer | Authenticated user profile. |
| `GET` | `/dashboard` | Bearer | BRL + BTC balances and BTC quote (string or `null`). |
| `POST` | `/trades/buy` | Bearer | Buy BTC with BRL (`amountBrl` string, 2dp). BCMath rounding. |
| `POST` | `/trades/sell` | Bearer | Sell BTC for BRL (`amountBtc` string, 8dp). BCMath rounding. |
| `GET` | `/transactions` | Bearer | History newest-first. Params: `page` (default 1), `limit` (default 50, max 200). |
| `PATCH` | `/profile` | Bearer | Update name. Email immutable in v1. |
| `POST` | `/profile/avatar` | Bearer | Upload avatar (JPEG/PNG/WebP, ≤ 5 MB, ≤ 4096 px). Returns `avatarUrl`. |

## Monetary encoding

All monetary values transmitted as **decimal strings** in JSON to preserve scale:

| Field | Scale | Example |
|-------|-------|---------|
| `brlBalance`, `brlAmount` | 2dp | `"10000.00"` |
| `btcBalance`, `btcAmount` | 8dp | `"0.00100000"` |
| `btcPriceBrl`, `btc_price_brl` | 2dp | `"250000.00"` |

## Rounding rules (spec clarifications)

- **BUY** → `btcAmount = ROUND_HALF_UP(amountBrl ÷ price, 8dp)` via BCMath.
- **SELL** → `brlAmount = ROUND_HALF_UP(amountBtc × price, 2dp)` via BCMath.
- Execution price band: **200 000,00–300 000,00 BRL/BTC**.
- Zero result after rounding → rejected (422).
