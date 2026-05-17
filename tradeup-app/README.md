# Trade Up App (`tradeup-app`)

React Native client for Trade Up (Mini Binance flows: auth, dashboard, trade, history, profile).

## Requirements

- **Node.js** and a package manager (e.g. npm)
- **Mobile build tooling** for the platforms you target — see the official [React Native environment guide](https://reactnative.dev/docs/set-up-your-environment)
- **Running API** when exercising real requests — configure the base URL via env (below)

### Stack

- React Native
- React
- TypeScript
- NativeWind
- TanStack Query
- react-hook-form
- zod
- `@hookform/resolvers`
- zustand
- Async Storage
- Axios
- Reanimated

## Getting started

From this directory:

```bash
cp .env.example .env
npm install
npm start
```

Adjust values in `.env` using `.env.example` as reference (e.g. `API_BASE_URL` for the API host).

In another terminal:

```bash
npm run ios
# or
npm run android
```

For the API and local backing services, see **[`../tradeup-api/README.md`](../tradeup-api/README.md)** — Postgres and Redis are defined in [`../tradeup-api/docker-compose.yml`](../tradeup-api/docker-compose.yml).

## Documentation references

| Topic | Location |
|--------|-----------|
| React Native (official) | [Environment setup](https://reactnative.dev/docs/set-up-your-environment), [Troubleshooting](https://reactnative.dev/docs/troubleshooting) |
| Architecture (MVVM, Registry, layout) | [`../docs/front-end/architecture.md`](../docs/front-end/architecture.md) |
| Dependency injection / Registry | [`../docs/front-end/dependency-injection.md`](../docs/front-end/dependency-injection.md) |
| Data fetching | [`../docs/front-end/data-fetching.md`](../docs/front-end/data-fetching.md) |
| Tests | [`../docs/front-end/tests.md`](../docs/front-end/tests.md) |
| Visual mood board only (not feature spec) | [`../docs/front-end/visual-reference/`](../docs/front-end/visual-reference/) |
| Shared testing notes | [`../docs/shared/testing-anti-patterns.md`](../docs/shared/testing-anti-patterns.md) |

## Related in this repo

| Resource | Location |
|----------|----------|
| Monorepo overview | [`../README.md`](../README.md) |
| API package (run & docs) | [`../tradeup-api/README.md`](../tradeup-api/README.md) |
