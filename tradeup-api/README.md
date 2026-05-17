# Trade Up API (`tradeup-api`)

Laravel **JSON API** for Trade Up (Mini Binance): users, BRL/BTC wallet, quote, atomic trades, transaction history, profile / avatar.

## Requirements

- **PHP** and **Composer**
- **PostgreSQL** and **Redis** for local development (e.g. `docker compose up -d` from the repo root — see [`../docker-compose.yml`](../docker-compose.yml))
- **Node + npm** if you run the default frontend asset tooling

### Stack

- Laravel
- PostgreSQL
- Redis
- Laravel Sanctum
- Laravel Horizon

## Getting started

1. **Start infra** (from monorepo root):

   ```bash
   cd ..
   docker compose up -d
   ```

2. **Configure env** inside `tradeup-api`:

   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

   Set variables in `.env` using `.env.example` as reference.

3.  **Install & migrate**

   ```bash
   composer install
   php artisan migrate
   ```

4. **Public disk for avatars** (when uploads are implemented):

   ```bash
   php artisan storage:link
   ```

5. **Run the API**

   ```bash
   php artisan serve
   ```

6. **Horizon** (after package install): `php artisan horizon` in a separate terminal.

## Documentation references

| Topic | Location |
|--------|-----------|
| Laravel (official) | [Documentation](https://laravel.com/docs) |
| Architecture (Clean + DDD, layers) | [`../docs/back-end/architecture.md`](../docs/back-end/architecture.md) |
| Tests (Pest, layers) | [`../docs/back-end/tests.md`](../docs/back-end/tests.md) |
| Code quality | [`../docs/back-end/code-quality.md`](../docs/back-end/code-quality.md) |
| Shared testing notes | [`../docs/shared/testing-anti-patterns.md`](../docs/shared/testing-anti-patterns.md) |

## Related in this repo

| Resource | Location |
|----------|----------|
| Monorepo overview | [`../README.md`](../README.md) |
| Mobile app package | [`../tradeup-app/README.md`](../tradeup-app/README.md) |
| Local Postgres / Redis | [`../docker-compose.yml`](../docker-compose.yml) |
