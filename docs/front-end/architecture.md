# Front-End Architecture (React Native)

Definition of the mobile **front-end** (React Native) architecture. Establishes MVVM (Model, View, ViewModel, Binder), the data layer in `resources`, and the **Registry** for registering and resolving dependencies on bootstrap and in ViewModels.

## Overview

- **Separation of concerns:** UI (screens/components with **React Native** primitives and patterns — `View`, `Text`, `TextInput`, `Pressable`, etc.) and data (APIs, persistence) in distinct layers — UI Layer and Data Layer (`resources`).
- **High cohesion:** Each unit (Model, View, ViewModel, Binder, Service, Repository when present) has a clear, self-contained purpose; changes stay local and unrelated parts break less often.
- **Low coupling:** The View does not know where data comes from; the ViewModel obtains **only** the **Service** (and query keys / `queryClient` when needed) via **Registry**; it does not import repositories or HTTP clients. The **Service** calls **Repository** (storage) and/or **IHttpClient** (REST), depending on the resource. The Binder only connects ViewModel to View.
- **Testability:** ViewModel and View can be tested in isolation; in tests, **register** fake implementations or mocks **on** the Registry instead of hitting real network/storage ([tests.md](./tests.md)). You do not need to mock the Registry module — use `clear()` and `register()` to inject test dependencies.
- **Maintainability:** More readable, reusable, and easier to evolve code; new features follow the same pattern.

---

## Model-View-ViewModel (MVVM) and Binder

MVVM separates data from presentation. The pieces are:

- **Model:** Data representation via interfaces, types, and validation rules (e.g. schemas). No UI or network logic.
- **View:** Rendering only — receives props and callbacks; does not decide data origin or persistence. Uses **React Native** components (and RN UI libraries when applicable).
- **ViewModel:** Orchestrates business rules and screen state; exposes data and actions to the View. In React Native this is usually a custom hook (e.g. `useSigninFormViewModel`).
- **Binder (Component):** UI flow entry point. Connects ViewModel to View: calls the ViewModel hook and passes the result to the View. Dependencies (services, storage, etc.) are consumed by the **ViewModel directly via Registry**, not passed through the Binder.

Do not export service or mapper instances from `resources` modules; consumption happens only through the Registry after registration on bootstrap.

---

## UI Layer

Responsible for interface and user input/output.

### Model: interfaces, types, and validation

`signin-form.model.ts`

```tsx
import * as z from 'zod';
import { useSigninFormViewModel } from './signin-form.view-model';

const validationSchema = z.object({
  email: z.string(),
  password: z.string(),
});

type ISigninFormValues = z.infer<typeof validationSchema>;

interface ISigninFormProps {
  onSubmit(values: ISigninFormValues): Promise<void>;
}

type ISigninFormViewProps = ReturnType<typeof useSigninFormViewModel>;

export { validationSchema, ISigninFormValues, ISigninFormProps, ISigninFormViewProps };
```

### ViewModel: business rules and screen logic

`signin-form.view-model.ts`

```tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ISigninFormProps, ISigninFormValues, validationSchema } from './signin-form.model';

export function useSigninFormViewModel({ onSubmit }: ISigninFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ISigninFormValues>({
    defaultValues: { email: '', password: '' },
    resolver: zodResolver(validationSchema),
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    setIsSubmitting(true);
    await onSubmit(values);
    setIsSubmitting(false);
  });

  return {
    form,
    isSubmitting,
    onSubmit: handleSubmit,
  };
}
```

### View: rendering only

`signin-form.view.tsx`

```tsx
import { View } from 'react-native';
import { ISigninFormViewProps } from './signin-form.model';
import { TextField } from '@/components/fields/text-field';
import { Button } from '@/components/button';

export function SigninFormView({ form, onSubmit, isSubmitting }: ISigninFormViewProps) {
  return (
    <View className="gap-3 p-4">
      <TextField name="email" control={form.control} keyboardType="email-address" autoCapitalize="none" />
      <TextField name="password" control={form.control} secureTextEntry />
      <Button onPress={onSubmit} loading={isSubmitting}>
        Sign in
      </Button>
    </View>
  );
}
```

### Component (Binder): wires ViewModel and View

`signin-form.component.tsx`

```tsx
import { ISigninFormProps } from './signin-form.model';
import { useSigninFormViewModel } from './signin-form.view-model';
import { SigninFormView } from './signin-form.view';

export function SigninForm(props: ISigninFormProps) {
  const logic = useSigninFormViewModel(props);
  return <SigninFormView {...logic} />;
}
```

---

## Data Layer (Resources)

Responsible for persistence and external services. `resources/services/` and `resources/repositories/` are **siblings** (same level under `src/resources/`). Applies **dependency inversion**: the UI (via ViewModel) depends on **abstractions**; implementations (HTTP, Supabase, etc.) live in **resources** and are composed on **bootstrap** with **constructor injection**. With **React Query**, query keys come from instances registered on the **Registry** — ViewModels do not import singletons from `resources/`.

### Service (orchestration)

Orchestrates application rules: calls **IHttpClient** (REST API) and/or **repository interfaces** (storage) and **mappers**. Instances are **not** exported; the ViewModel obtains the registered instance from the **Registry**.

`auth.service.ts` (HTTP-only example; the `IHttpClient` contract returns the response shape agreed for the application layer.)

```tsx
import type { IHttpClient } from '@/lib/http-client/http-client.interface.lib';
import type { ISigninInput } from './auth.type';
import type { ISigninResultDomainDTO } from './dtos/auth.domain.dto';

export class AuthService {
  constructor(private httpClient: IHttpClient) {}

  async signin(input: ISigninInput): Promise<ISigninResultDomainDTO> {
    return this.httpClient.post<ISigninResultDomainDTO>('/auth/signin', input);
  }
}
```

### Repository (storage / data API adapter)

Interfaces and **concrete** implementations (e.g. Supabase) under `resources/repositories/<domain>/`. The **Service** depends on `I*Repository` in the **constructor**; the ViewModel **never** calls the repository directly.

`i-user.repository.ts` / `user.supabase.repository.ts` (illustrative)

```tsx
// resources/repositories/user/i-user.repository.ts
import type { IUserPersistenceDTO } from '@/resources/services/user/dtos/user.persistence.dto';

export interface IUserRepository {
  getById(id: string): Promise<IUserPersistenceDTO | null>;
}

// The Service uses repository + mapper, not the Supabase client directly.
// resources/services/user/user.service.ts
import type { IUserRepository } from '@/resources/repositories/user/i-user.repository';
import { UserMapper } from './user.mapper';
import type { IUserDomainDTO } from './dtos/user.domain.dto';

export class UserService {
  constructor(
    private userRepository: IUserRepository,
    private userMapper: UserMapper,
  ) {}

  async getById(id: string): Promise<IUserDomainDTO | null> {
    const row = await this.userRepository.getById(id);
    return row ? this.userMapper.toDomain(row) : null;
  }
}
```

### Mapper: domain ↔ persistence DTOs

**Bootstrap** instantiates `new NameMapper()` and passes it to the **Service** in the **constructor** (the ViewModel **does not** use the Mapper directly). Do not export a reusable singleton for direct consumption — only Registry registration from bootstrap.

`auth.mapper.ts`

```tsx
import { IAuthDomainDTO } from './dtos/auth.domain.dto';
import { IAuthPersistenceDTO } from './dtos/auth.persistence.dto';

export class AuthMapper {
  toDomain(persistence: IAuthPersistenceDTO): IAuthDomainDTO {
    return {
      id: persistence.id,
      email: persistence.email,
      firstName: persistence.first_name,
      lastName: persistence.last_name,
      createdAt: persistence.created_at,
    };
  }

  toPersistence(domain: IAuthDomainDTO): IAuthPersistenceDTO {
    return {
      id: domain.id,
      email: domain.email,
      first_name: domain.firstName,
      last_name: domain.lastName,
      created_at: domain.createdAt,
    };
  }
}
```

### Query key: keys for React Query

`auth.query-key.ts`

```tsx
export class AuthQueryKeys {
  all() {
    return ['auth'] as const;
  }

  detail(id: string) {
    return [...this.all(), 'detail', id] as const;
  }

  list(filters?: string) {
    return [...this.all(), 'list', filters] as const;
  }
}
```

### Type: resource typings

`auth.type.ts`

```tsx
import { IBaseRequestParams } from '@/types/http.type';

export interface IListAuthParams extends IBaseRequestParams {
  email?: string;
  status?: string;
}

export interface IGetAuthByIdParams {
  id: string;
}
```

---

## Dependency injection (overview)

The **ViewModel** obtains services and other dependencies via **Registry** (`inject`). The Registry lives under project structure (e.g. `lib/registry/`). The Binder does not pass dependencies through props — it only forwards component props to the ViewModel and connects the return value to the View.

**Tests:** Registry is the **means** of injection, not something to replace by `jest.mock` on its module. In `beforeEach` (or equivalent), call `Registry.getInstance().clear()` then `register(...)` with doubles for services, query keys, `queryClient`, etc. Code under test keeps using `getInstance().inject(...)` as in production.

### Model

`user-profile.model.ts`

```tsx
import { useUserProfileViewModel } from './user-profile.view-model';

interface IUserProfileProps {
  userId: string;
}

type IUserProfileViewProps = ReturnType<typeof useUserProfileViewModel>;

export { IUserProfileProps, IUserProfileViewProps };
```

### ViewModel: consumes Registry directly

Registry lives under `lib/registry/`. Typical API: `Registry.getInstance()` returns the container; `registry.register(name, dep)` on bootstrap or tests; `registry.inject(name)` resolves dependencies (types via `RegistryMap`).

`user-profile.view-model.ts`

```tsx
import { useQuery } from '@tanstack/react-query';
import { Registry } from '@/lib/registry/registry.lib';
import { IUserProfileProps } from './user-profile.model';

export function useUserProfileViewModel({ userId }: IUserProfileProps) {
  const registry = Registry.getInstance();
  const userService = registry.inject('userService');
  const userQueryKeys = registry.inject('userQueryKeys');

  const { data: user, isPending } = useQuery({
    queryKey: userQueryKeys.detail(userId),
    queryFn: () => userService.getById(userId),
  });

  return { user, isPending };
}
```

### Component (Binder): connects ViewModel to View

`user-profile.component.tsx`

```tsx
import { IUserProfileProps } from './user-profile.model';
import { useUserProfileViewModel } from './user-profile.view-model';
import { UserProfileView } from './user-profile.view';

export function UserProfile(props: IUserProfileProps) {
  const viewModel = useUserProfileViewModel(props);
  return <UserProfileView {...viewModel} />;
}
```

### ViewModel test (Jest + React Native Testing Library)

([tests.md](./tests.md))

Register mocks **on** the Registry; do not replace `@/lib/registry/registry.lib` with `jest.mock`.

`user-profile.view-model.test.ts`

```tsx
import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Registry } from '@/lib/registry/registry.lib';
import { useUserProfileViewModel } from './user-profile.view-model';

const mockUserService = {
  getById: jest.fn().mockResolvedValue({
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
  }),
};

const mockUserQueryKeys = {
  detail: (id: string) => ['user', 'detail', id] as const,
};

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useUserProfileViewModel', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const registry = Registry.getInstance();
    registry.clear();
    registry.register('userService', mockUserService as never);
    registry.register('userQueryKeys', mockUserQueryKeys as never);
    registry.register('queryClient', queryClient);
    mockUserService.getById.mockClear();
  });

  afterEach(() => {
    Registry.getInstance().clear();
  });

  it('should load user data', async () => {
    const { result } = renderHook(() => useUserProfileViewModel({ userId: '1' }), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.user).toEqual({
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
      });
    });
    expect(mockUserService.getById).toHaveBeenCalledWith('1');
  });
});
```

**Notes:** `as never` on `register` is only for this generic example — in a real project, `RegistryMap` types should accept the mock or a fake implementing the service interface. The hook under test uses the same resolution path as runtime.

---

## Directory structure (suggestion)

```
src/
├── routes/                          # Navigation: entry and groups by context
│   ├── router.tsx                   # Root: NavigationContainer / auth vs unauth flow (per library)
│   ├── auth/
│   │   ├── auth.route.tsx           # Authenticated stack or tabs (example)
│   │   └── ...
│   └── unauth/
│       ├── unauth.route.tsx         # Public flow (login, signup, etc.) (example)
│       └── ...
│
├── screens/                         # MVVM screens (screen-level UI)
│   └── signin/
│       ├── signin.component.tsx     # Binder
│       ├── signin.model.ts
│       ├── signin.view.tsx
│       ├── signin.view-model.ts
│       ├── components/              # Subcomponents for this screen only
│       └── contexts/                # Screen-local contexts if needed
│
├── components/                      # Reusable UI (no shared/ here)
│   ├── fields/
│   │   └── text-field/
│   │       ├── text-field.component.tsx
│   │       ├── text-field.model.ts
│   │       ├── text-field.view.tsx
│   │       └── text-field.view-model.ts
│   ├── buttons/
│   ├── layout/
│   └── dialogs/
│
├── utils/
├── constants/
├── configs/
├── lib/
│   ├── registry/
│   │   └── registry.lib.ts
│   └── http-client.ts
├── errors/
├── hooks/
├── assets/
├── contexts/
├── types/
│
└── resources/
    ├── services/
    │   └── auth/
    │       ├── auth.service.ts
    │       ├── auth.type.ts
    │       ├── auth.query-key.ts
    │       ├── auth.mapper.ts
    │       └── dtos/
    │           ├── auth.domain.dto.ts
    │           ├── auth.persistence.dto.ts
    │           ├── create-auth.domain.dto.ts
    │           └── create-auth.persistence.dto.ts
    │
    └── repositories/
```

---

## Naming conventions

### Files

- **Component (Binder):** `name.component.tsx`
- **Route / navigation group:** `name.route.tsx`; routes module root: **`router.tsx`**
- **View:** `name.view.tsx`
- **ViewModel:** `name.view-model.ts`
- **Model:** `name.model.ts`
- **Service:** `name.service.ts`
- **Mapper:** `name.mapper.ts`
- **Type:** `name.type.ts`
- **Query key:** `name.query-key.ts`
- **DTO:** `name.domain.dto.ts` or `name.persistence.dto.ts`

### Interfaces, types, and enums

- Interfaces with `I`: `ISigninFormProps`, `IAuthDomainDTO`
- Custom types with `I`: `ISigninFormValues`, `ISigninFormViewProps`
- Enums with `I`: `IAuthStatus`, `IRequestType`

### DTOs

- **Domain DTO:** `INameDomainDTO` — used in UI
- **Persistence DTO:** `INamePersistenceDTO` — API contract
- **Create/update:** `ICreateNameDomainDTO`, `IUpdateNameDomainDTO`

---

## Data flow

Fixed chain: **View** → (props) **Binder** → **ViewModel** → `Registry.inject('…Service' | '…QueryKeys' | 'queryClient')` → **Service** → **IHttpClient** and/or **I\*Repository** → raw data; **Mapper** (inside Service) → domain DTO → ViewModel → View.

**REST (HTTP) path:**

1. ViewModel calls Service (from Registry).
2. Service uses `IHttpClient` (injected in **constructor** on bootstrap).
3. Response = persistence DTO (API contract); Mapper converts to domain DTO; Service returns domain to ViewModel.

**Storage path (repository, e.g. Supabase):**

1. ViewModel calls Service (never the repository).
2. Service uses `I*Repository` (injected in **constructor**); implementation (e.g. `*.supabase.repository.ts`) isolates the storage client.
3. Mapper transforms persistence → domain; Service returns domain DTO.

In both cases: **React Query** (`useQuery` / `useMutation`) lives in the ViewModel; **query keys** come from a registered class (e.g. `userQueryKeys` via `inject`).

---

## Principles summary

- **UI:** Screens under `screens/<name>/` with Model, View, ViewModel, Binder; shared components under `components/<category>/`. Views use React Native; no `pages/` or `shared/` inside `components/`.
- **Routes:** `routes/router.tsx` as entry; group files `*.route.tsx`; subfolders `routes/auth/` and `routes/unauth/` by context (JSX with React Navigation or registration with React Native Navigation / Wix).
- **Data:** `resources/services` and `resources/repositories` at the same level; ViewModel does not import repositories; services and mappers as classes with constructor deps registered on bootstrap.
- **Registry:** `register` / `inject` / `clear`; in tests, clear and register doubles — do not mock the Registry file instead of this flow.
- **Names:** Files and `I` prefix per conventions above; domain vs persistence DTOs.
