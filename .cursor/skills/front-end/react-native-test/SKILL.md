---
name: react-native-test
description: >-
  Writes Jest + React Native Testing Library tests aligned with trade-up MVVM
  (Model, View, ViewModel, Binder), Registry injection (clear/register mocks,
  never jest.mock the Registry module), and QueryClient test wrappers. Use when
  adding or fixing *.test.ts(x), ViewModel hooks, binder components, or test
  setup; not for E2E until documented in docs/front-end/tests.md.
---

# React Native testing (trade-up)

Authoritative doc: **[docs/front-end/tests.md](../../../../docs/front-end/tests.md)** (pyramid, Registry, providers). Architecture context: **[docs/front-end/architecture.md](../../../../docs/front-end/architecture.md)** (MVVM, Binder).

---

## What to test by layer

| Layer | Target | How |
| ----- | ------ | --- |
| **Unit** | `*.util.ts`, mappers, Zod schemas, pure helpers | Jest only — no RTL unless rendering |
| **ViewModel** | `*.view-model.ts` hooks (`useQuery` / `useMutation`, Registry) | `renderHook` + `QueryClientProvider` + Registry filled with `jest.fn()` doubles |
| **Integration** | Binder `*.component.tsx` (wires ViewModel → View) | `render(<Binder />)` + user-centric queries |

Prefer **many fast unit tests** and **targeted integration tests**; avoid importing production bootstrap or hitting real APIs ([tests.md](../../../../docs/front-end/tests.md)).

---

## Registry (mandatory pattern)

- **`Registry.getInstance().clear()`** in `beforeEach` / **`afterEach`** so tests stay isolated.
- **`registry.register('token', mock)`** with mocks — same mechanism as production ([dependency-injection.md](../../../../docs/front-end/dependency-injection.md)).
- **Do not** `jest.mock('@/lib/registry/...')` to fake `inject`; doubles enter via `register`.

Tokens often mirror bootstrap: `*Service`, `*QueryKeys`, and optionally `queryClient` vs an isolated `QueryClient` in the test wrapper — pick one approach per test file and stay consistent.

---

## ViewModel example (`renderHook`)

```tsx
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Registry } from '@/lib/registry/registry.lib';
import { useCatalogListViewModel } from './catalog-list.view-model';

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
}

function wrapper({ children }: { children: React.ReactNode }) {
  const client = createTestQueryClient();
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('useCatalogListViewModel', () => {
  beforeEach(() => {
    const registry = Registry.getInstance();
    registry.clear();
    registry.register('catalogService', {
      getCatalog: jest.fn().mockResolvedValue({ items: [] }),
    });
    registry.register('catalogQueryKeys', {
      catalogList: (years: number[]) => ['catalog', 'list', years],
    });
  });

  afterEach(() => {
    Registry.getInstance().clear();
  });

  it('should expose loaded data when the query resolves', async () => {
    const { result } = renderHook(() => useCatalogListViewModel([2024]), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.isPending).toBe(false);
    });
    expect(result.current.data).toEqual({ items: [] });
  });
});
```

Adjust tokens and hook signature to the feature under test.

---

## Binder / screen (`render`)

Test **observable behavior** (labels, roles, text, presses), not implementation details:

```tsx
import { render, screen } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Registry } from '@/lib/registry/registry.lib';
import { CatalogScreen } from './catalog-screen.component';

function ui(children: React.ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

beforeEach(() => {
  Registry.getInstance().clear();
  // register mocks needed by the ViewModel behind CatalogScreen
});

afterEach(() => {
  Registry.getInstance().clear();
});

it('should show the empty state when the list has no items', async () => {
  render(ui(<CatalogScreen />));

  expect(await screen.findByText(/no items/i)).toBeTruthy();
});
```

Prefer **`getByRole`**, **`getByLabelText`**, **`getByText`**; use `testID` only when accessible queries are impractical.

---

## Practices

- **No real backend URLs** in ViewModel tests — mocked Services only.
- **Hooks**: always top-level in components under test; keep wrappers minimal (`QueryClientProvider`, navigation stub if required — see reference).
- **Snapshots**: sparingly; prefer assertions on behavior.
- **E2E**: out of scope until documented in `tests.md`.

---

## More setup & mocks

See **[references/testing-library.md](references/testing-library.md)** (Jest preset alignment, optional Reanimated/Gesture Handler mocks, navigation shim).
