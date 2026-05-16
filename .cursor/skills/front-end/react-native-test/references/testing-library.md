# Testing Library & Jest — trade-up reference

Supplements **[docs/front-end/tests.md](../../../../../docs/front-end/tests.md)** with snippets for React Native + MVVM.

---

## Jest preset

Use **`preset: '@react-native/jest-preset'`** in `jest.config.js` (see repo root). Align **`moduleNameMapper`** with Metro/Babel **`@/`** aliases.

Typical dev deps: `@testing-library/react-native`, `@tanstack/react-query`, `@types/jest` when applicable.

---

## Common native mocks (optional)

Only include mocks that your app imports — trim unused blocks.

```javascript
// jest-setup.js (example fragments)
import 'react-native-gesture-handler/jestSetup';

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});
```

---

## Test `QueryClient`

Always disable retries in tests to avoid flakes:

```ts
import { QueryClient } from '@tanstack/react-query';

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}
```

---

## Wrapper with QueryClient only

```tsx
import { QueryClientProvider } from '@tanstack/react-query';
import { createTestQueryClient } from './create-test-query-client';

export function withQueryClient(ui: React.ReactElement) {
  const client = createTestQueryClient();
  return <QueryClientProvider client={client}>{ui}</QueryClientProvider>;
}
```

If the tree needs navigation, add the **minimal** navigator/container required by `@react-navigation/native` for your screen — avoid mounting full `App`.

---

## Navigation stub

When asserting `navigate` calls without full stacks:

```tsx
const mockNavigate = jest.fn();

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({
      navigate: mockNavigate,
      goBack: jest.fn(),
    }),
  };
});
```

Reset `mockNavigate` in `beforeEach`.

---

## Registry checklist

1. `Registry.getInstance().clear()` before registering test doubles.
2. Register every token the ViewModel under test will `inject`.
3. `clear()` again in `afterEach`.
4. Never replace the Registry module with `jest.mock` solely to bypass `inject`.

---

## File naming

Prefer **`*.test.ts`** / **`*.test.tsx`** co-located with source or under `__tests__/`, per **[tests.md](../../../../../docs/front-end/tests.md)**.
