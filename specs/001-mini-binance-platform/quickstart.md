# Quickstart: Mini Binance (local dev)

**Spec directory**: `specs/001-mini-binance-platform/`  
**Monorepo root**: `trade-up/`

## 1. Infrastructure (Docker)

From the repository root:

```bash
docker compose up -d
```

Default services:

| Service | Host port | Usage |
|---------|-----------|--------|
| PostgreSQL | 5432 | `DB_HOST=127.0.0.1` |
| Redis | 6379 | `REDIS_HOST=127.0.0.1` |

Development credentials are in `docker-compose.yml` (change before any shared environment).

## 2. Back end (`tradeup-api`)

```bash
cd tradeup-api
cp .env.example .env   # if not already present
php artisan key:generate
```

Configure `.env` (example aligned with this repo’s Compose):

```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=tradeup
DB_USERNAME=tradeup
DB_PASSWORD=tradeup

QUEUE_CONNECTION=redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

SANCTUM_STATEFUL_DOMAINS=localhost,127.0.0.1
SESSION_DOMAIN=localhost
```

Install dependencies (once Sanctum/Horizon are added to `composer.json`):

```bash
composer install
php artisan migrate
php artisan storage:link
php artisan serve
```

Horizon (after installation):

```bash
php artisan horizon
```

## 3. App (`tradeup-app`)

```bash
cd tradeup-app
npm install
```

Set API URL (e.g. `.env` with `react-native-config` or a dev constant — follow project convention):

```env
API_URL=http://127.0.0.1:8000/api/v1
```

```bash
npm start
npm run ios   # or android
```

**iOS simulator**: `127.0.0.1` reaches the Mac host. **Android emulator**: use `10.0.2.2` instead of `127.0.0.1`.

## 4. Documentation

- Back-end architecture: `docs/back-end/architecture.md`  
- Front-end architecture: `docs/front-end/architecture.md`  
- API contract: `specs/001-mini-binance-platform/contracts/openapi.yaml`  
- Mood board (aesthetic only): `docs/front-end/visual-reference/`

## 5. Suggested implementation order

Follow phases in [`plan.md`](./plan.md) (P0 → P7).
