# Testing — Front-End (React Native)

Definition of how to write and organise tests in the project’s **React Native** app.

The runner is **Jest** with **`@react-native/jest-preset`** (e.g. `jest.config.js` at the app package root). For screens and hooks, use **React Native Testing Library** (`@testing-library/react-native`) — `render`, `renderHook`, `act`, `waitFor`, `screen`, favouring accessibility-oriented queries (`getByRole`, `getByLabelText`, `getByText`).

**Registry:** In ViewModel or integration tests that depend on services, use `Registry.getInstance().clear()` in `beforeEach`/`afterEach` and `register` mocks (`jest.fn()`). Do not replace the Registry module with `jest.mock` to fake `inject` — test doubles use the same mechanism as production ([dependency-injection.md](./dependency-injection.md)).

**Providers:** Hooks that use React Query must run inside `QueryClientProvider` with a test `QueryClient` (`defaultOptions.queries.retry = false`). If code depends on navigation, compose the minimum required by the library (e.g. React Navigation test wrapper); avoid importing the full `App` or real bootstrap (Registry and production network).

---

## Documents in this folder

| Document                                             | Content                                   |
| ---------------------------------------------------- | ----------------------------------------- |
| [architecture.md](./architecture.md)                 | MVVM, Binder, `screens/` and `components/` |
| [dependency-injection.md](./dependency-injection.md) | Registry, `register` / `inject` / `clear` |
| [data-fetching.md](./data-fetching.md)               | Services, query keys, HttpClient          |

---

## Test pyramid

Favour **many fast tests at the base**, fewer integration tests; E2E only once the project adopts a tool and this document is updated.

```
        /\
       /  \     Integration (fewer)
      /____\
     /      \   Integration / components with deps
    /________\
   /          \  Unit (largest volume)
  /______________\
```

| Layer            | What to test                                                                                             | Tools                                   |
| ---------------- | -------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| **Unit**         | Pure functions (`*.util.ts`), mappers, Zod schemas, helpers; ViewModel logic with a populated Registry | Jest                                    |
| **Integration**  | View with binder (`*.component.tsx`); hook with `renderHook` + providers + Registry                    | Jest + `@testing-library/react-native` |

**Rules**

- ViewModels that only orchestrate React Query + Service: mocks registered on the Registry; no real API.
- Views: visible behaviour (text, roles, interactions), not unnecessary internal implementation detail.
- Do not trade utility coverage for heavy integration tests for every pure function.

---

## Registry and data (no real API)

Do not use a real backend URL in ViewModel tests. Pattern:

- `beforeEach`: `Registry.getInstance()`; `clear()` if needed; `register('token', mock)` for each dependency.
- `afterEach`: `clear()`.

Common tokens: `*Service`, `*QueryKeys`, `queryClient` (or an isolated `QueryClient` in the test wrapper).

---

## Types of tests

### Unit

- Files: `*.test.ts` / `*.test.tsx` next to source or under `__tests__/`.
- Targets: utilities, mappers, validators, pure rules.
- The React Native preset includes an environment suited to native modules mocked by Jest.

### Integration (component / hook)

- **View:** `render` the binder component with `@testing-library/react-native`; interactions with `fireEvent` / `press` (per package API).
- **ViewModel:** `renderHook` with a `wrapper` that includes `QueryClientProvider` and an already-registered Registry.

Avoid importing the production bootstrap module.

### E2E

Out of scope until an explicit decision (e.g. Maestro, Detox). When it exists, document it here.

---

## Configuration

- **`jest.config.js`**: `preset: '@react-native/jest-preset'` (extensions and base mocks).
- **`@/` aliases**: align Jest `moduleNameMapper` or `resolver` with the app’s Babel/Metro config.
- Typical test deps: `@testing-library/react-native`, `@types/jest` (if applicable).

Minimal example present in the repo: `__tests__/App.test.tsx` (smoke with `react-test-renderer` or RTL, as the project evolves).

---

## Conventions

- Commands: `npm test` / `yarn test` (Jest).
- File patterns: `*.test.ts`, `*.test.tsx`, or `*.spec.ts`.
- Test names: describe **expected behaviour**; prefer **`should …`** in `test('should …')` / `it('should …')` instead of vague names or internal method names.
- Test anti-patterns (mocks, production): [testing-anti-patterns.md](../shared/testing-anti-patterns.md).

---

## Summary

- Jest + React Native preset; RTL for UI and `renderHook`.
- Registry: `clear` + `register` with mocks — not `jest.mock` on the Registry file itself.
- Pyramid with many unit tests; integration where it adds confidence.
- E2E only after a tool exists and a section exists in this document.
- New global testing patterns: update **this** file.
