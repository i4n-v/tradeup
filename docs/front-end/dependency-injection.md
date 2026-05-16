# Dependency injection (Registry) — Front-End (React Native)

Definition of the **Registry**: singleton container with `register`, `inject`, and `clear`, integrated with the MVVM model in [architecture.md](./architecture.md). **ViewModels** resolve `Service`, query keys, and `queryClient` **only** via `inject` (dependencies are not passed through the Binder). **Services** and adapters (HttpClient, repositories) receive dependencies in the **constructor**; the app bootstrap instantiates `new Service(...)` and registers the instance. Do not use `experimentalDecorators` or `@Inject` on fields — constructor injection from bootstrap only.

---

## Overview

### Why use it

- **Decoupling:** ViewModels request the **Service** by token; the **Service** depends on interfaces (`IHttpClient`, `I*Repository`); the bootstrap composes `new Service(httpAdapter, mapper, repo)`.
- **Testability:** In tests, register mocks on the Registry before running the hook or class; no need to mock modules or stack dependencies in props.
- **Inversion of control (IoC):** The app (bootstrap) creates and registers dependencies; consumers only request by token.
- **Dependency inversion (DIP):** Higher layers do not depend on concrete network or storage implementations; the Registry binds implementations at runtime.

### Concepts

- **Dependency injection (DI):** ViewModels resolve application dependencies via **Registry**; Data Layer classes receive technical dependencies in the **constructor** when the bootstrap instantiates them.
- **Inversion of control (IoC):** What gets instantiated lives in bootstrap and Registry, not inside each consumer.
- **Dependency inversion principle (DIP):** Depend on abstractions (`IHttpClient`, `IUserRepository`); Registry wires concrete implementations.

### Benefits

- **Deterministic tests:** Doubles registered on Registry; no real network or storage.
- **Swap implementations:** New HttpClient adapter or repository = change bootstrap registration.
- **Single composition root:** Dependencies registered at entry (e.g. `App.tsx` before the UI tree).

---

## Registry implementation

The Registry is a **singleton** with a token → instance map.

- `Registry.getInstance()` — single instance.
- `registry.register(name, dependency)` — register dependency.
- `registry.inject(name)` — return dependency (throws if missing).
- `registry.clear()` — empty map (used in tests).

The map is typed with `RegistryMap`: each token has an explicit return type.

### Location

- **`lib/registry/registry.lib.ts`** — `Registry` class and `RegistryMap` type (optional: Registry unit tests in `registry.test.ts`).
- Code folders: `screens/`, `components/`, `resources/`, etc., as in [architecture.md](./architecture.md#directory-structure-suggestion).

### Registry class example

`lib/registry/registry.lib.ts`

```ts
interface RegistryMap {
  queryClient: QueryClient;
  httpClient: IHttpClient;
  authMapper: AuthMapper;
  authService: AuthService;
  authQueryKeys: AuthQueryKeys;
}

class Registry {
  private dependencies: RegistryMap = {} as RegistryMap;
  static instance: Registry;

  private constructor() {}

  register<T extends keyof RegistryMap>(name: T, dependency: RegistryMap[T]) {
    this.dependencies[name] = dependency;
  }

  inject<T extends keyof RegistryMap>(name: T): RegistryMap[T] {
    const dependency = this.dependencies[name];
    if (!dependency) throw new Error(`Dependency not found: ${name}`);
    return dependency;
  }

  clear() {
    this.dependencies = {} as RegistryMap;
  }

  static getInstance() {
    if (!Registry.instance) {
      Registry.instance = new Registry();
    }
    return Registry.instance;
  }
}

export type { RegistryMap };
export { Registry };
```

**Rules**

- New services, mappers, `httpClient`, and adapters: declare token and type on `RegistryMap`.
- The **Service** is created on bootstrap with `new NameService(registry.inject('httpClient'), …)` — `inject` is **only** for composition lines on bootstrap, not inside the Service on each call.
- **ViewModel:** uses `inject` for `*Service`, `*QueryKeys`, and `queryClient`. **Do not** inject `httpClient` into the ViewModel — network and storage always go through **Service** methods.

---

## Where to register

Registration happens **once**, on **bootstrap** (e.g. `App.tsx` or a module loaded before `AppRegistry.registerApplication`), **before** the main tree.

- Order: leaf dependencies first (`httpClient`, mappers, repositories), then services that consume them in `new Service(...)`.
- Do not register inside components, hooks, or route files.

`App.tsx` (illustrative)

```tsx
import { Registry } from '@/lib/registry/registry.lib';
import { QueryClient } from '@tanstack/react-query';
import { AuthMapper } from '@/resources/services/auth/auth.mapper';
import { AuthService } from '@/resources/services/auth/auth.service';
import { AuthQueryKeys } from '@/resources/services/auth/auth.query-key';

const registry = Registry.getInstance();
registry.register('queryClient', new QueryClient(/* config */));
registry.register('httpClient', new AxiosHttpClientAdapter(apiBaseUrl));
registry.register('authMapper', new AuthMapper());
registry.register(
  'authService',
  new AuthService(registry.inject('httpClient'), registry.inject('authMapper')),
);
registry.register('authQueryKeys', new AuthQueryKeys());

// export default function App() { ... }
```

**Order:** Everything the Service constructor needs is registered before `new XService(registry.inject(...), …)` runs.

---

## Usage in React Native

### ViewModels (hooks)

```tsx
import { useMutation } from '@tanstack/react-query';
import { Registry } from '@/lib/registry/registry.lib';

export function useSigninViewModel() {
  const registry = Registry.getInstance();
  const authService = registry.inject('authService');

  const signinMutation = useMutation({
    mutationFn: () => authService.signin(/* credentials */),
  });

  return {
    onSignin: () => signinMutation.mutate(),
    isSigningIn: signinMutation.isPending,
  };
}
```

- Call `Registry.getInstance()` inside the hook and `inject` by token.
- Do not pass Registry via props; the Binder only passes UI props.

### Classes (Services)

Bootstrap instantiates with constructor dependencies; do not use `@Inject` on fields.

```ts
import type { IHttpClient } from '@/lib/http-client/http-client.interface.lib';
import type { ISigninInput } from './auth.type';
import type { ISigninResultDomainDTO } from './dtos/auth.domain.dto';
import type { AuthMapper } from './auth.mapper';

export class AuthService {
  constructor(
    private httpClient: IHttpClient,
    private authMapper: AuthMapper,
  ) {}

  async signin(input: ISigninInput): Promise<ISigninResultDomainDTO> {
    return this.httpClient.post<ISigninResultDomainDTO>('/auth/signin', input);
  }
}
```

Repositories: `new UserService(userRepository, userMapper)` with concrete `userRepository` created only on bootstrap.

---

## Tests

`beforeEach`: `Registry.getInstance()`, `clear()` if needed, then `register` tokens used by code under test. `afterEach`: `clear()`.

Do not replace `@/lib/registry/registry.lib` with `jest.mock` to simulate `inject` — register the mock **on** the Registry.

```tsx
import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Registry } from '@/lib/registry/registry.lib';
import type { AuthService } from '@/resources/services/auth/auth.service';
import { useSigninViewModel } from './signin.view-model';

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useSigninViewModel', () => {
  let queryClient: QueryClient;
  let mockAuthService: { signin: jest.Mock };

  beforeEach(() => {
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    mockAuthService = { signin: jest.fn() };
    const registry = Registry.getInstance();
    registry.clear();
    registry.register('authService', mockAuthService as unknown as AuthService);
  });

  afterEach(() => {
    Registry.getInstance().clear();
  });

  it('should call authService.signin when onSignin runs', async () => {
    mockAuthService.signin.mockResolvedValue(undefined);
    const { result } = renderHook(() => useSigninViewModel(), {
      wrapper: createWrapper(queryClient),
    });
    await act(async () => {
      result.current.onSignin();
    });
    expect(mockAuthService.signin).toHaveBeenCalledTimes(1);
  });
});
```

Further patterns: [tests.md](./tests.md).

---

## Summary

- Every new token appears on `RegistryMap` with the correct type.
- Registration only on bootstrap (`App.tsx` or equivalent), in the correct order.
- ViewModels use `Registry.getInstance().inject(token)`; the Binder does not inject services.
- Services receive dependencies in the **constructor**; bootstrap performs `new` + `register`.
- Tests: `clear` / `register` with mocks; `clear` at end. Do not export singletons from `resources/` for production consumption.
