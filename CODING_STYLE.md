# CODING_STYLE.md

> Personal coding style guide for frontend/fullstack TypeScript.
> Use this at the start of AI coding sessions.

---

## Rule Interpretation & Precedence

### Requirement levels

- **MUST**: mandatory default behavior
- **SHOULD**: preferred default; deviate only with clear project reason
- **MAY**: optional preference

### Conflict resolution order

1. Existing repository conventions and architecture
2. Enforced formatter/linter/tooling configuration
3. This document
4. Examples in this document

### AI execution guardrails

- AI agents **MUST NOT** perform broad refactors unless explicitly requested.
- AI agents **MUST NOT** rename files, change export patterns, reorganize folders,
  or alter alias strategy unless explicitly requested.
- AI agents **SHOULD** implement the smallest change that satisfies the task.

---

## Agent Quick Rules (Default Behavior)

Use this section as the first-pass checklist.

1. All functions **MUST** have explicit parameter and return types.
2. Components **MUST** use `export default function` (except `forwardRef` form).
3. Utilities/hooks/data functions **MUST** use function declarations.
4. Event handlers and inline sub-components **MUST** use arrow functions.
5. Type-only imports **MUST** use `import type`.
6. Cross-directory imports **MUST** use `~/` when available in project config.
7. Same-folder or one-level-up imports **MUST** use relative paths.
8. Async code **MUST** use `async/await`, not `.then()` chains.
9. Props **MUST** be destructured in function signatures.
10. Boolean coercion **MUST** use `Boolean()`, not `!!`.
11. Semantic HTML and required accessibility attributes **MUST** be used.
12. Design tokens **MUST** be CSS variables; colors **MUST** use `hsl()`/`hsla()`.

---

## Formatting

| Setting | Value |
| --- | --- |
| Semicolons | Always |
| Quotes | Single quotes |
| Tab width | 2 spaces |
| Trailing commas | All |
| Print width | 80 |
| Arrow parens | Omit for single arg (`x => x`) |

---

## TypeScript & JavaScript

### Typing rules

- All functions **MUST** have explicit parameter and return types.
- `interface` **MUST** be used for object shapes.
- `type` **MUST** be used for unions, primitives, and utility-derived types.
- Interfaces **MUST NOT** use an `I` prefix.
- Closed sets **SHOULD** use string enums.
- Generics **MUST** be used only when a real cross-call-site type relationship
  exists and cannot be expressed clearly with concrete types/unions/overloads.
- `Pick` and `Partial` **SHOULD** be used for narrowing and optional object
  modeling where appropriate.

```ts
interface CharacterDetailPageProps {
  character: Character;
  previous: number | null;
  next: number | null;
}

type Gender = 'male' | 'female';
```

### Function style

- Components **MUST** use `export default function`.
- Utilities/hooks/data functions **MUST** use function declarations.
- Event handlers and inline sub-components **MUST** use arrow functions.
- `forwardRef` is the explicit exception and **MUST** set `.displayName`.

```ts
export default function Header(): JSX.Element {
  return <header />;
}
```

### Runtime/code patterns

- Async logic **MUST** use `async/await`.
- Type-only imports **MUST** use `import type`.
- `??` **SHOULD** be used for fallbacks.
- `?.` **MUST** be used only where presence is not guaranteed by types.
- Props **MUST** be destructured in signature, with inline defaults.
- Prop forwarding **SHOULD** use `...props` where appropriate.
- Rename destructured fields **SHOULD** be used when it improves clarity.
- Boolean coercion **MUST** use `Boolean()`.

```ts
import type { Character } from './types';

const hasPreviousLink = Boolean(previous);
```

### Import and alias rules

- Import ordering **MUST** follow repo tooling when configured.
- Cross-directory imports **MUST** use `~/` when available.
- If `~/` is not configured, imports **MUST** follow existing project alias
  strategy.
- Relative imports **MUST** be used for same-folder and one-level-up paths.

```ts
import Image from '~/app/components/Image/Image';
import styles from './Footer.module.css';
import { useTheme } from '../hooks/useTheme';
```

### Naming conventions

| Category | Convention | Example |
| --- | --- | --- |
| Components | PascalCase | `Header` |
| Component files | PascalCase `.tsx` | `Header.tsx` |
| Page/layout files | Framework convention | `page.tsx`, `layout.tsx` |
| Utility/lib files | camelCase `.ts` | `ensureArray.ts` |
| Variables/functions | camelCase | `openDialog` |
| Event handlers | `handle` + verb (+ noun) | `handleToggle` |
| Module constants | SCREAMING_SNAKE_CASE | `ICON_SIZE` |
| Types/interfaces | PascalCase | `Character` |
| Enum members | PascalCase key, lowercase string value | `Street = 'street'` |
| Props interfaces | Descriptive PascalCase | `ModalProps` |
| CSS custom properties | `--color-{role}` / `--spacing-{size}` | `--spacing-L` |
| Test factory functions | `_create` + noun | `_createCharacter()` |

---

## Component & UI Structure

- Components **MUST** be one-per-file and file name **MUST** match component
  name.
- Component default export style **MUST** be `export default function`
  (except APIs like `forwardRef`).
- Reusable-within-file sub-components **SHOULD** remain in the same file as
  `const` arrow functions.
- Shared UI primitives **SHOULD** live under `components/Common/`.
- Props **MUST** be destructured in signatures; `PropsWithChildren` **SHOULD**
  be used when children are required.
- Conditional rendering: `&&` **SHOULD** be used for optional single elements;
  ternary **SHOULD** be used for mutually exclusive branches.
- Derived booleans **SHOULD** be computed before JSX return.
- DOM-driven behavior **SHOULD** use `useRef`; `useState` **MUST** be used only
  for values that drive re-renders.
- `useEffect` **MUST** have explicit dependency arrays and inline cleanup when
  needed.
- `useCallback` / `useMemo` **MUST** be used only for measured or contract-driven
  reasons.
- Wrapped library primitives **SHOULD** forward original props and alias imports.
- Data-fetching functions **SHOULD** return named objects for clear destructuring.
- Semantic HTML **MUST** be used correctly.
- Accessibility rules:
  - `<a>` uses `aria-disabled`, not `disabled`
  - images **MUST** have `alt`

---

## CSS & Styling

### Stack policy

- Styling approach **MUST** follow the existing project stack.
- Tailwind, CSS Modules, or CSS-in-JS are all valid when aligned with project
  conventions.

### CSS conventions

- CSS Module imports **MUST** be named `styles`.
- CSS Module class names **MUST** use kebab-case.
- Conditional class merging **SHOULD** use `clsx`.
- Design tokens (color, spacing, font size, transition) **MUST** be CSS variables
  on `:root`.
- Raw design-token values in component styles **SHOULD NOT** be used.
- Token scale **MUST** use T-shirt suffixes (`-S`, `-M`, `-L`, `-XL`).
- Colors **MUST** use `hsl()` / `hsla()` (not hex or `rgb()`).
- Responsive rules **MUST** be mobile-first with `min-width` breakpoints.
- Flexbox **SHOULD** be primary layout primitive; Grid **SHOULD** be used for
  galleries/multi-area layouts.
- Transitions **MUST** target specific properties, never `transition: all`.
- Adjacent sibling selectors **SHOULD** be used for repeated-item spacing.
- Descendant selectors under a module root **SHOULD** be preferred over excessive
  class proliferation.

---

## File & Project Structure

### Baseline layout

```txt
app/ (or src/)
  assets/images/
  components/Common/
  hooks/
  lib/
  styles/
  util/
  types.ts
  config.ts
```

### Rules

- Component-specific styles/hooks/sub-components **MUST** be co-located in the
  component folder.
- Route-specific non-reusable components **SHOULD** live next to route files.
- Global styles **MUST** live in `styles/`.
- Tests **MUST** be co-located with source (`.test.ts` suffix).
- Barrel re-exports (`index.ts` as aggregators) are not used; imports **MUST**
  target concrete files.
- Global asset declarations **SHOULD** be centralized in one `index.d.ts`.
- App-level constants and magic numbers **MUST** live in `config.ts`.
- Module constants **MUST** use SCREAMING_SNAKE_CASE.

---

## Testing

- Test files **MUST** be co-located with source files.
- `describe` **SHOULD** reference function symbols directly.
- `it` descriptions **SHOULD** use "should" phrasing.
- Test factory helpers **SHOULD** use `_createX` naming and accept `Partial<T>`
  overrides.
- Assertions **SHOULD** use `toEqual` for objects/arrays and `toBe` for
  primitives.
- Test scope **SHOULD** prioritize pure functions/reducers.
- Component rendering tests **MAY** be added for non-trivial or failure-prone
  behavior.

---

## Optional Personal Conventions

These are style preferences, not hard constraints.

- Comments **SHOULD** explain why, not what.
- Vendored CSS **SHOULD** include source attribution comments.
- Temporary code **MAY** use emoji bookend markers.
- Feature flags **MAY** be module-level booleans.
- Placeholder arrays **SHOULD** use `Array.from({ length: n })`.
- API URLs **SHOULD** be built with `new URL()`.
- TypeScript `strict` mode **MUST** be enabled.
- `any` **SHOULD** be avoided except pragmatic test escape hatches.

---

## Tooling Enforcement Map

| Area | Enforcement |
| --- | --- |
| Semicolons, quotes, trailing commas, print width | Tooling-enforced when formatter exists; otherwise manual MUST |
| Import ordering/grouping | Tooling-enforced when configured; otherwise manual SHOULD |
| Type-only imports (`import type`) | Manual MUST (plus lint rule where available) |
| Alias strategy (`~/` when available) | Manual MUST based on project config |
| Function typing, naming, exports, structure | Manual MUST/SHOULD |
| CSS token usage and color format | Manual MUST/SHOULD (lintable per project) |

