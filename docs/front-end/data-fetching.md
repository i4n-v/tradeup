# Data fetching (React Query, Services, HttpClient, and repositories) — Front-End (React Native)

Definition of the mobile app data flow: **REST** via `IHttpClient` in the Service, **storage** via `I*Repository` + mapper, same caching and error pattern. The **UI** does not talk to transport; the **ViewModel** calls the **Service** (resolved through the **Registry**); the Service returns **domain** DTOs; **React Query** (`useQuery` / `useMutation`) lives in the ViewModel; `queryFn` / `mutationFn` only call Service methods. **Query keys** come from **registered** classes on the Registry; **mappers** and **DTOs** live under `resources/services/<domain>/dtos/`. `httpClient` is registered on bootstrap when the Service uses REST.

---

## Overview

### Why use it

- **Abstract HTTP:** The app depends on `IHttpClient`, not Axios or another client directly.
- **Clear layer:** Services encapsulate REST and/or repositories; mappers convert persistence ↔ domain; DTOs under `resources/services/<resource>/dtos/`.
- **Cache:** React Query owns cache, refetch, loading and error states; query-key classes enable consistent invalidation.
- **Tests:** HttpClient and services swappable via doubles registered on the Registry ([dependency-injection.md](./dependency-injection.md)).

### Concepts

- **HttpClient:** Contract `get` / `post` / … ; implementation under `lib/` and registered on bootstrap.
- **Service:** Business methods; receives `IHttpClient`, mappers and/or `I*Repository` in the **constructor**; `registry.register` on bootstrap; the ViewModel gets the service only via `inject`.
- **Query key:** Stable cache identifier; one class per resource with methods returning arrays (e.g. `['auth', 'me', ...]`).
- **Mapper:** Persistence → domain (and reverse for writes); no HttpClient.

### Benefits

- Swap HTTP adapter by changing bootstrap registration.
- Adapter errors mapped to domain errors the ViewModel or UI can handle.
- Predictable invalidation with hierarchical keys.

---

## HttpClient

Nothing calls the HTTP library directly outside the adapter. The app uses **IHttpClient**; the implementation registers on the Registry during bootstrap.

### Location

- Interface: `lib/http-client/http-client.interface.lib.ts`
- Adapter (e.g. Axios): `lib/http-client/axios-http-client.adapter.lib.ts`
- Error type: `errors/http-client.error.ts`

### IHttpClient interface

```ts
type IQueryParams = Record<string, unknown>;
type IHeaders = Record<string, string>;

interface IConfig {
  params?: IQueryParams;
  headers?: IHeaders;
}

interface IHttpClient {
  get<T>(url: string, config?: IConfig): Promise<T>;
  post<T>(url: string, body: unknown, config?: IConfig): Promise<T>;
  put<T>(url: string, body: unknown, config?: IConfig): Promise<T>;
  delete<T>(url: string, config?: IConfig): Promise<T>;
  patch<T>(url: string, body: unknown, config?: IConfig): Promise<T>;
  onRequest(
    fulfilledCallback: (config: IConfig) => Promise<IConfig>,
    rejectedCallback?: (error: unknown) => Promise<unknown>,
  ): number;
  onResponse(
    fulfilledCallback: (response: unknown) => Promise<unknown>,
    rejectedCallback?: (error: unknown) => Promise<unknown>,
  ): number;
  offRequest(interceptorId: number): void;
  offResponse(interceptorId: number): void;
}

export type { IHttpClient, IQueryParams, IConfig };
```

- Methods return `Promise<T>` with the **body** already extracted (e.g. `response.data` in the Axios adapter).
- Interceptors for auth, logging, and error normalisation.

### Adapter (e.g. Axios)

The adapter implements `IHttpClient`, wraps the Axios instance, and maps failures to **HttpClientError** (or equivalent).

**Rules**

- Always return the **data** the Service needs, not the full response object.
- Surface errors as the agreed domain type, not raw library exceptions.
- Register on bootstrap as `httpClient`.

### Domain error (example)

```ts
export class HttpClientError extends Error {
  code: number;
  response: unknown;

  constructor(message: string, code: number, response: unknown) {
    super(message);
    this.name = 'HttpClientError';
    this.code = code;
    this.response = response;
  }
}
```

---

## Services

Encapsulate data sources (API and/or repository), call HttpClient and/or `I*Repository` and mappers; expose **domain** DTOs. Instantiation **only** on bootstrap.

### Location

- Service: `resources/services/<resource>/<resource>.service.ts`
- Mapper, query keys, types, dtos: same resource folder per [architecture.md](./architecture.md).

### Example

```ts
import type { IHttpClient } from '@/lib/http-client/http-client.interface.lib';
import type { ICatalogListResponsePersistenceDTO } from './dtos/catalog-list.persistence.dto';
import type { ICatalogListResponseDomainDTO } from './dtos/catalog-list.domain.dto';
import type { IGetCatalogParameters } from './catalog.type';
import type { CatalogMapper } from './catalog.mapper';

export class CatalogService {
  constructor(
    private httpClient: IHttpClient,
    private mapper: CatalogMapper,
  ) {}

  async getCatalog(
    params: IGetCatalogParameters,
  ): Promise<ICatalogListResponseDomainDTO> {
    const response = await this.httpClient.get<ICatalogListResponsePersistenceDTO>(
      '/catalog',
      { params },
    );
    return this.mapper.listResponseToDomain(response);
  }
}
```

**Rules**

- Parameters in `<resource>.type.ts`; return types as domain DTOs.
- On bootstrap: `registry.register('catalogService', new CatalogService(httpClient, catalogMapper))` after `httpClient` and mapper are registered.

---

## Query keys

One class per resource; methods return stable arrays; parameters that change the result can compose the array (optional `QueryKey` spread).

`resources/services/catalog/catalog.query-key.ts`

```ts
import type { QueryKey } from '@tanstack/react-query';

export class CatalogQueryKeys {
  catalogList(othersQueryKey: QueryKey = []) {
    return ['catalog', 'list', ...othersQueryKey];
  }

  catalogAudit(othersQueryKey: QueryKey = []) {
    return ['catalog', 'audit', ...othersQueryKey];
  }
}
```

Register the instance on bootstrap; in the ViewModel, `registry.inject('catalogQueryKeys')`.

---

## Mappers and DTOs

- **Mapper:** Methods persistence → domain (and reverse when applicable).
- **Persistence:** API/storage contract (e.g. snake_case).
- **Domain:** UI consumption (e.g. camelCase).

The ViewModel only sees domain DTOs coming from the Service.

---

## Usage in the ViewModel

### useQuery

```tsx
import { useQuery } from '@tanstack/react-query';
import { Registry } from '@/lib/registry/registry.lib';

export function useCatalogListViewModel(selectedYears: number[]) {
  const registry = Registry.getInstance();
  const catalogQueryKeys = registry.inject('catalogQueryKeys');
  const catalogService = registry.inject('catalogService');

  const catalogQuery = useQuery({
    queryKey: catalogQueryKeys.catalogList(selectedYears),
    queryFn: () => catalogService.getCatalog({ year: selectedYears[0] }),
  });

  return {
    data: catalogQuery.data,
    isPending: catalogQuery.isPending,
    refetch: catalogQuery.refetch,
    error: catalogQuery.error,
  };
}
```

### useMutation

```tsx
import { useMutation } from '@tanstack/react-query';
import { Registry } from '@/lib/registry/registry.lib';

export function useSigninViewModel() {
  const registry = Registry.getInstance();
  const authService = registry.inject('authService');

  const signinMutation = useMutation({
    mutationFn: () => authService.signin(/* inputs */),
  });

  return {
    onSignin: () => signinMutation.mutate(),
    isSigningIn: signinMutation.isPending,
  };
}
```

**Rules**

- `queryKey` always via the injected instance, not loose literal arrays in the ViewModel.
- `queryFn` / `mutationFn` call only the Service; no `fetch` or direct HTTP client in the ViewModel.

---

## Summary

- **HttpClient:** interface under `lib/`; adapter registers as `httpClient`; return shape normalised for the Service.
- **Service:** constructor dependencies; bootstrap registration; domain DTOs at the boundary to the ViewModel.
- **Query keys:** class per resource, instance on Registry, `inject` in the ViewModel.
- **ViewModel:** `useQuery` / `useMutation` + `inject('…Service' | '…QueryKeys' | 'queryClient')`.
- **New tokens:** declare on `RegistryMap` and register in `App.tsx` (or bootstrap) in the correct order.
