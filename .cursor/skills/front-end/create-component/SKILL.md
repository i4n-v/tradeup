---
name: create-component
description: Guides React Native UI aligned with MVVM, Specify composition and import/body ordering, NativeWind styling via class-variance-authority variants plus cn(), and mobile accessibility. Use when creating or refactoring RN components, compound UI, design-system primitives, or NativeWind className styling (not web DOM).
---

# Create component (React Native + NativeWind)

Use this skill when adding or changing **React Native** UI: shared primitives, compound components, or View-layer pieces. **Do not** apply web-only guidance (`div`, semantic HTML, SEO, `react-dom`, shadcn DOM assumptions).

Full references (when those repos are available):

- `business_manager/.specify/memory/patterns/component-standardization.md` — import groups and declaration order inside components/hooks.
- `business_manager/.specify/memory/patterns/composition.md` — compound components, `components/` subfolder, dot notation exports.
- `business_manager/.specify/memory/patterns/good-practics.md` — subset below (skip HTML/SEO/web a11y lists).

---

## MVVM boundary

- **Views / presentational components:** Props in, JSX out. No `Registry.inject`, no React Query, no navigation side-effects hidden inside reusable UI (unless the component is explicitly a smart container documented as such).
- **ViewModels / hooks:** Data fetching, mutations, navigation orchestration — keep out of leaf UI.
- **Binder (`*.component.tsx`):** Assign the view-model hook return value to **`logic`** (e.g. `const logic = useFooViewModel(props)`; `<FooView {...logic} />`). Destructure from `logic` when the view only needs a subset.

---

## Composition (from Specify)

- Prefer **compound components** over giant prop APIs (`hasX`, `renderY`). Root wraps `children`; subparts handle one concern each.
- Put subparts under **`components/` inside the feature/component folder**; export a single object from the binder file, e.g. `export const Card = { Root, Header, Body }`.
- **Named exports**; props/interfaces prefixed with **`I`** where the project already does so (`ICardRootProps`).
- Replace web examples mentally: **`View` / `Pressable` / `Text` / `ScrollView`** instead of `div` / `button`; strings belong in **`Text`**, not raw children of pressables (see project compound-component rules if present).

---

## Imports and body order (from component-standardization)

**Imports** — blank line between groups:

1. `react`, `react-native` (and RN-first libs).
2. External packages (alphabetical): e.g. `@tanstack/react-query`, `class-variance-authority`.
3. Internal aliases (`@/…`) — alphabetical by path.
4. Relative `./`, `../`.
5. Prefer `import type` alongside or after values per project convention.

**Inside function components / hooks:**

1. Hooks first (state → refs → context → custom hooks → `useMemo` / `useCallback` → effects).
2. Constants / simple variables.
3. Derived values (non-hook).
4. Handlers.
5. Early returns.
6. Return JSX / object.

**Never** call hooks after conditionals, loops, or early returns.

---

## Good practices subset (from good-practics.md)

**Ignore here:** HTML semantics, SEO, `<main>` / headings hierarchy, link-vs-button HTML rules, shadcn DOM accessibility bullets.

**Keep:**

- **Rules of React:** pure render, no prop/state mutation, stable `key` in lists, hooks only at top level.
- **State:** colocate; lift only when needed; avoid global state for purely local UI.
- **Effects:** sync with external systems — not for trivial derived state.
- **Performance:** no premature `memo` / `useCallback`; use when measured.
- **Typing:** explicit props; avoid `any`; `React.ReactNode` for `children` where appropriate.
- **Clean code:** clear names, small functions, DRY, avoid narrating comments — prefer structure.

**React Native accessibility (replace web checklist):**

- Set **`accessibilityRole`** (`button`, `header`, `image`, etc.) when it clarifies behavior.
- **`accessibilityLabel`** (and **`accessibilityHint`** when the action is non-obvious); icon-only controls **must** expose a label.
- **`accessibilityState`** for disabled, selected, expanded, busy.
- Use **`hitSlop`** on small touch targets when needed.
- Preserve focus behavior in modals/sheets per platform patterns; don’t strip accessibility props when wrapping primitives.

---

## NativeWind: `cva` variants + `cn`

Adopt **variants in a dedicated file** next to the component, using **`cva`** from `class-variance-authority`, same shape as rollcake_ui primitives (e.g. `single-avatar.variants.ts`):

```typescript
import { cva } from 'class-variance-authority';

const avatarVariants = cva('', {
  variants: {
    size: {
      xs: 'size-6 text-xs',
      sm: 'size-8 text-sm',
      md: 'size-10 text-base',
      lg: 'size-12 text-lg',
      xl: 'size-16 text-xl',
    },
  },
  defaultVariants: {
    size: 'sm',
  },
});

export { avatarVariants };
```

**Compose classes on the element** with the project **`cn`** helper (`clsx` + `tailwind-merge`) — same implementation pattern as `rollcake_ui/src/lib/utils/cn/cn.util.ts`; adjust import path to the consuming app (e.g. `@/lib/utils/cn/cn.util`):

```tsx
import { cn } from '@/lib/utils/cn/cn.util';
import { avatarVariants } from './avatar.variants';

function AvatarRoot({ className, size, ...props }: IAvatarRootProps) {
  return (
    <View className={cn(avatarVariants({ size }), className)} {...props} />
  );
}
```

**Rules:**

- **`defaultVariants`** in `cva` for the usual size/variant; caller **`className` merged last** via `cn` so consumers can override.
- Prefer **one `*.variants.ts` per compound root or primitive family**; avoid inline giant template strings in TSX when variants grow.
- Optional: export **`VariantProps<typeof avatarVariants>`** for prop typing shared with the component API.

---

## Checklist

- [ ] View vs ViewModel responsibility respected for the file being edited.
- [ ] Compound layout matches Specify (`components/` subfolder + dot export) when using composition.
- [ ] Import groups and hook-first body order respected.
- [ ] No web-only semantics or SEO guidance applied to RN.
- [ ] Touch targets and `accessibilityLabel` / `accessibilityRole` considered for interactive UI.
- [ ] NativeWind: variants in `*.variants.ts` with `cva`; `className={cn(variants(...), className)}` on primitives that support `className`.
