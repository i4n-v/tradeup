# Trade Up API (`tradeup-api`)

Laravel **JSON API** for Trade Up (Mini Binance): users, BRL/BTC wallet, quote, atomic trades, transaction history, profile / avatar.

## Requirements

- **PHP** and **Composer**
- **PostgreSQL** and **Redis** for local development — start with `docker compose up -d` from this package (see [`docker-compose.yml`](./docker-compose.yml))
- **Node + npm** if you run the default frontend asset tooling

### Stack

- Laravel
- PostgreSQL
- Redis
- Laravel Sanctum
- Laravel queue worker (included in `composer run dev`)

## Getting started

1. **Start infra** (from `tradeup-api/`):

   ```bash
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

5. **Run the API (recommended)**

   Buy/sell create a pending transaction and process in a **queue worker**. If you run only HTTP without a worker, trades stay **`PENDING`** until something consumes the queue.

   From `tradeup-api/`, prefer:

   ```bash
   composer run dev
   ```

   That starts **`php artisan serve`**, **`php artisan queue:listen`** (alongside logs and Vite) in one process.

   Minimal alternative: two terminals — `php artisan serve` **and** `php artisan queue:work` (or `queue:listen`).

   For HTTP only:

   ```bash
   php artisan serve
   ```

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
| Local Postgres / Redis | [`docker-compose.yml`](./docker-compose.yml) |
