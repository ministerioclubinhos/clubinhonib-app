# Clubinho NIB Frontend Best Practices & Engineering Guidelines

## 1. Purpose and Scope

This document defines the mandatory engineering standards for `clubinhonib-app`. AI coding assistants and human developers MUST read it before creating, fixing, or refactoring frontend code.

Current stack: React 19, strict TypeScript, Vite, React Router, Material UI/Emotion, Redux Toolkit with persistence, Axios, TanStack Query in selected features, React Hook Form/Yup, and Playwright.

Core principles:

- Inspect the current implementation and preserve existing contracts before changing behavior.
- Prefer small, cohesive changes that follow the repository's current architecture.
- Do not copy patterns that are specific to Next.js, Tailwind, a backend service, or another product.
- Do not turn a local fix into an unrelated repository-wide refactor.
- Do not modify environment, CloudFormation, Amplify, or deployment files unless explicitly requested.

## 2. Mandatory Pre-Change Workflow

Before implementing a change:

1. Read `package.json`, `tsconfig.json`, `vite.config.ts`, and every directly affected file.
2. Read `docs/project_structure.md` and the relevant domain document under `docs/`.
3. Search for equivalent components, hooks, types, utilities, and API operations already in the repository.
4. Verify the contract in `clubinhonib-api`; never infer a payload from the UI alone.
5. Identify affected routes, roles, authentication rules, feature flags, cache entries, and persisted state.
6. Locate the tests and documentation that must change with the behavior.
7. Preserve unrelated local changes and avoid formatting files outside the task scope.

### 2.1 AI Instruction Discovery and Execution Protocol

The canonical entrypoint is the repository-root `AGENTS.md`. Tool-specific files (`CLAUDE.md`, `GEMINI.md`, `.github/copilot-instructions.md`, and `.cursor/rules/`) redirect assistants to this guide. They MUST remain short adapters; detailed rules belong here so the tools cannot drift apart.

For every implementation task, the assistant MUST:

1. Translate the request into observable acceptance criteria.
2. Inspect the complete path, including route, guard, page, hook/query, API client, DTO, NestJS endpoint, and tests.
3. Separate verified facts from assumptions and resolve assumptions from repository evidence whenever possible.
4. Identify failure modes before coding: slow request, empty response, stale cache, expired session, forbidden role/club, duplicate mutation, and mobile overflow.
5. Implement only the requested behavior and necessary supporting changes.
6. Verify the narrowest relevant scope first, followed by broader checks proportional to risk.
7. Review the final diff for accidental formatting, dead code, secrets, generated artifacts, and unrelated changes.
8. Report what changed, what was verified, and any remaining risk or pre-existing failure.

Existing code is evidence of current behavior, not automatic permission to reproduce technical debt. Follow this guide for new code while avoiding unrelated mass refactors.

## 3. Feature-Driven Architecture and Layer Separation

Domain code belongs in `src/features/<feature>/`. Truly reusable UI belongs in `src/components/common/`; routed screens and layout composition belong in `src/pages/`.

Recommended structure for new or substantially expanded features:

```text
src/features/<feature>/
├── api.ts                 # HTTP calls and contract mapping
├── types.ts               # DTOs, domain models, enums, and props
├── hooks.ts               # Queries, mutations, state, and orchestration
├── components/            # Feature-specific UI
├── pages/                 # Routed screens, when applicable
├── schemas.ts             # Form validation, when applicable
├── utils.ts               # Pure domain helpers
└── index.ts               # Optional public feature API
```

Do not create empty directories. A small feature may use single files; split files only when responsibilities genuinely grow and preserve stable imports where practical.

Mandatory responsibilities:

- `api`: owns URLs, HTTP methods, query parameters, request payloads, and response mapping; it MUST use `src/config/axiosConfig.ts`.
- `hooks`: orchestrates server state, local state, loading, errors, cache invalidation, and UI events.
- `components`: renders typed data and emits events; it MUST NOT build endpoints or access Axios directly.
- `pages`: composes features, layout, route parameters, and guards; it MUST NOT accumulate business rules.
- `types`: fully models incoming and outgoing contracts.
- `utils`: contains deterministic functions without React, store access, network calls, or argument mutation.

Do not create hybrid components driven by many flags for unrelated workflows. When business rules, permissions, or state machines diverge, create dedicated components and hooks.

## 4. State, Cache, and API

### 4.1 Choose One State Owner

- Keep ephemeral UI state in `useState` or a feature hook.
- Keep session and genuinely shared application state in Redux Toolkit.
- Keep remote data that needs refetching and invalidation in TanStack Query where that feature already follows this pattern.
- Never store the same server response simultaneously in component state, Redux, and TanStack Query.
- Do not introduce an isolated TanStack Query provider without considering the lifetime of the cache.
- A `QueryClient` MUST be stable and MUST NOT be created on every render. Prefer a shared provider when multiple routes consume the same cache.
- Query keys MUST be stable, domain-specific, and include every filter that changes the result.
- Mutations MUST invalidate or update only the related queries.
- Persist only the minimum session data. Do not persist children's or families' records.

### 4.2 API Access

- Every HTTP call MUST use `src/config/axiosConfig.ts`.
- Do not create feature-level Axios instances or duplicate authorization and refresh logic.
- The shared interceptor owns authentication and global error handling.
- Use `skipGlobalError` only when the calling flow provides complete local feedback; document why it is required.
- For `FormData`, do not set the multipart boundary manually.
- Never retry a non-idempotent mutation without an idempotency guarantee.
- Avoid request waterfalls when independent calls can run concurrently or existing data can be reused.

### 4.3 Contract Typing

```ts
export interface CreateClubRequest {
  number: number;
  weekday: Weekday;
  teacherProfileIds?: string[];
}

export interface ClubResponse {
  id: string;
  number: number;
  isActive: boolean;
}
```

- Every API interaction and operation MUST define explicit input DTOs (request payloads, query parameters) and explicit output DTOs (response types/contracts) for everything.
- NEVER use `any` under any circumstances. Use explicit types; use `unknown` only at untrusted boundaries and narrow it immediately.
- ALWAYS create dedicated files for `types` (`types.ts` or `types/` files) and `constants` (`constants.ts`) — inline declaration of types, interfaces, magic numbers, or hardcoded config constants inside components, hooks, or pages is strictly prohibited.
- ALWAYS use domain enums for roles, statuses, weekdays, domain options, and finite sets — magic strings are strictly prohibited in components, forms, hooks, and API integrations.
- ALWAYS create dedicated `utils` / helper files (e.g., `src/features/<feature>/utils.ts` or `src/utils/`) for pure functions, formatters, and data transformations instead of duplicating logic inline inside components, hooks, or pages.
- Use `interface` for object shapes and props; use `type` for unions and utility types.
- Keep API dates as ISO strings in transport DTOs and format them for `pt-BR` in the presentation layer.
- Use an explicit view model only when the screen intentionally transforms the transport/domain model.

## 5. Components, Material UI, and Visual Consistency

Material UI and existing shared components are the visual foundation. Before adding custom CSS or `sx`, inspect `src/components/`, global styles, and equivalent feature components.

- Prefer MUI primitives such as `Button`, `TextField`, `Select`, `Dialog`, `Card`, `Alert`, and `Snackbar`.
- Use theme values and semantic colors. Do not spread arbitrary hex colors, shadows, spacing values, or z-index values through components.
- Centralize recurring colors and tokens before using them across multiple screens.
- Async actions MUST disable their trigger and expose a visible progress state.
- Native buttons MUST explicitly use `type="button"` or `type="submit"`.
- Controls require an accessible name, visible focus, and keyboard operation.
- Meaningful images require useful `alt` text; decorative images use `alt=""`.
- Icon-only actions require an `aria-label` and a tooltip when their purpose is not obvious.
- Important Recharts visualizations and data tables need accessible context or a textual summary.

### 5.1 Stable Playwright Selectors

Every rendered component created or modified MUST expose a stable, descriptive
`data-testid` on its rendered root. A component with distinct render branches
(loading, empty, error, success, or permission denied) MUST keep a predictable
selector in each rendered branch and SHOULD identify the state as a separate
element when the E2E flow waits for it.

Also add `data-testid` to critical or otherwise ambiguous interactions such as
icon-only actions, repeated card actions, dialogs, menus, uploads, and controls
whose accessible role and name do not identify one unique target. Names MUST be
kebab-case and describe the domain, component, and element, for example
`children-manager`, `children-manager-loading`, and
`child-card-edit-action`. Repeated entities SHOULD include the stable API entity
ID when a test must address one instance.

- Prefer Playwright's user-facing locators (`getByRole`, `getByLabel`, and
  `getByText`) when they uniquely describe the interaction. Use `getByTestId`
  as the explicit contract for component roots, asynchronous states, and
  ambiguous/repeated targets.
- Never derive a selector from translated visible copy, a CSS or MUI class,
  DOM position, array index, random value, timestamp, or React-generated ID.
- A reusable component MAY accept a `data-testid` prop when the caller owns the
  domain meaning. It MUST provide a stable component-level default when it
  renders its own DOM root.
- `data-testid` values may repeat for repeated instances; scope or filter the
  locator, or pass an entity-specific `data-testid`. The HTML `id` attribute MUST be
  unique in the document and is reserved for actual document identity, form
  labels, and accessibility relationships such as `aria-labelledby` and
  `aria-describedby`.
- Component tests MUST verify new or changed selector contracts that E2E tests
  depend on. Do not replace observable-behavior assertions with test-ID-only
  assertions.

Recommended component file order:

1. React and third-party imports;
2. shared UI imports;
3. feature imports;
4. types and props;
5. exported component;
6. hooks and local state;
7. derived values;
8. event handlers;
9. render guards;
10. JSX.

## 6. Mobile-First and Accessibility Standards

Every screen MUST work on mobile first and progressively enhance through MUI breakpoints (`xs`, `sm`, `md`, `lg`, `xl`).

- Use responsive properties such as `sx={{ gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}`.
- Interactive touch targets MUST be at least 44 × 44 px.
- Tables need a contained scroll region, responsive columns, or a card alternative; they MUST NOT make the entire page scroll horizontally.
- Dialogs must fit mobile width, respect available height, and scroll internally.
- Fixed controls must account for `env(safe-area-inset-bottom)` where relevant.
- Essential actions cannot be available only on hover.
- Preserve sufficient contrast, logical focus order, field labels, and semantic heading order.
- Loading and empty states must not cause major layout shifts.

## 7. Forms and Modals

- Use React Hook Form with Yup and `@hookform/resolvers` for non-trivial forms.
- Frontend validation improves the experience but never replaces API validation.
- Show field errors beside their controls and non-field failures in a clear alert or notification.
- Input masks are presentation only; normalize values before submission.
- Prevent duplicate submissions and preserve entered data when a request fails.
- Reuse shared modals before creating another modal system.
- A modal requires an accessible title, managed focus, keyboard close behavior, a cancel action, and a loading state.
- Do not close a modal during a mutation unless the operation is cancelled or late results are safely ignored.

## 8. Authentication, Authorization, and Feature Flags

- The authentication slice and shared Axios interceptor are the session source of truth.
- A 401 outside an authentication endpoint MUST use the single refresh flow; components MUST NOT implement parallel refresh logic.
- A failed refresh MUST clear the session and redirect predictably to `/login`.
- Reuse existing protected-route components and existing role contracts such as `admin`, `coordinator`, and `teacher`.
- Hiding a button is not authorization. The NestJS API remains responsible for enforcing every protected operation.
- A feature flag must consistently protect its route, navigation entry, and related actions.
- Never log tokens, passwords, or personal data about children, guardians, teachers, coordinators, or ministry participants.

## 9. Errors, Observability, and Security

- Respect the standardized API error envelope and reuse `analyzeError`, `eventBus`, and the shared Axios interceptor.
- Do not emit a duplicate toast when the interceptor already handled the error.
- Do not expose stack traces, raw server responses, or technical exception messages to end users.
- Unexpected failures need observable reporting without personal data or credentials.
- Never render untrusted content through `dangerouslySetInnerHTML` without an established sanitizer.
- `VITE_*` variables are embedded in the public bundle and MUST NOT contain secrets.
- Validate uploads and external URLs according to the backend contract.
- Clean up timers, event listeners, subscriptions, and cancellable operations in `useEffect`.
- Do not silently swallow exceptions. Handle them locally or deliberately delegate them to the global handler.

## 10. Tests and Quality Gates

Every behavior change MUST add or update tests in the same delivery.

All frontend tests run on Playwright (`playwright.config.ts`, sources in `e2e/`). There are three projects:

- `unit` (`e2e/unit/*.spec.ts`): pure rules — utils, query and payload builders, validators. They run in Node, without browser or API, and import `src/` through the `@/` alias. A module tested here MUST NOT pull React or Material UI at runtime (import shared constants from their pure module, not from a UI barrel).
- `setup` (`e2e/support/auth.setup.ts`): logs in as the administrator through the UI once and stores the session in `e2e/.auth/admin.json`.
- `chromium` (`e2e/edit/**` and `e2e/flows/**`): real screens against the running app (`http://localhost:5173`) and API (`http://localhost:3000`). `edit/` covers every persisted edit flow; `flows/` covers screen behavior that used to be component tests (listings, dialogs, editors, sidebar, feature flags).

What each kind of change needs:

- Components and screens: a `flows` or `edit` test that creates its data through the API (`e2e/support/api.ts`), drives the real UI, and reads the API back to prove persistence. Cover rendering, interaction, loading, empty, success, and error states as the screen exposes them.
- Hooks, API modules, and TanStack Query: assert through the network (`page.on('request')`, `page.waitForRequest`) — method, endpoint, filters, payload, and that a screen does not refetch in a loop.
- Protected routes and feature flags: anonymous user, allowed role, denied role, flag on and off (restore the flag in `finally`).
- Forms: valid payload, validation messages, and API failures shown on screen.
- Pure rules: a `unit` test.
- Bug fixes: add a regression test that fails before the fix.

Test data MUST be created and removed by the test itself, with a unique suffix (`uniqueSuffix()`), and MUST never point at production. Prefer role-based locators and the `data-testid` convention from section 5.1; avoid broad screenshots.

### 10.1 Naming, Imports, and Public Feature APIs

- Feature directories use `kebab-case`.
- React component files use `PascalCase.tsx` and match the exported component name.
- Hooks use `use<Name>.ts`; helpers and type files use descriptive `camelCase.ts` names.
- Prefer named exports for feature code. Keep a default export only where an established page/route convention relies on it.
- Use the configured `@/` alias for cross-feature/shared imports and relative imports inside a small feature boundary.
- Do not deep-import another feature's private files. Expose an intentional surface through `index.ts` when cross-feature use is valid.
- Avoid circular barrel exports and overly broad re-export files.
- Constants must communicate meaning and units, such as `STATISTICS_STALE_TIME_MS`.

### 10.2 TanStack Query and Cache Correctness

- Query keys must be factories or stable arrays containing every identifier, filter, page, and sort option that affects the response.
- Never reuse one key for differently shaped results.
- Set `staleTime`, retry, and refetch policies deliberately according to how quickly the domain can change.
- Mutation success must invalidate the smallest relevant key prefix or update cached data with a fully typed value.
- Optimistic updates require `onMutate`, rollback context, error restoration, and final invalidation. Do not use optimism for operations whose server-side rules cannot be predicted safely.
- A component unmount or filter change must not allow an obsolete response to replace current data.
- Do not create a new `QueryClient` during render or one isolated client per child component.
- Server data errors remain in the query state; do not copy them to Redux merely to display a notification.

### 10.3 Routing, Performance, and Visualization Safety

- Apply route guards at the boundary and preserve deep-link, refresh, and browser back/forward behavior.
- Treat route parameters and query strings as untrusted input.
- Lazy-load genuinely heavy route-level features and dashboards where it reduces initial cost.
- Use memoization only for measured or structurally clear costs.
- Debounce search and filter input; cancel or ignore stale requests.
- Large tables and lists need server pagination, virtualization, or a documented upper bound.
- Recharts datasets must be bounded, consistently ordered, and derived from authorized API aggregates.
- Never infer missing statistics as zero unless the contract explicitly defines that semantic.
- Avoid adding large dependencies for behavior already supported by the current stack; check bundle impact when a dependency is necessary.

### 10.4 Frontend Test Blueprint

```ts
import { expect, test } from '@playwright/test';

import { ApiClient, uniqueSuffix } from '../support/api';
import { cardOf, searchListing } from '../support/ui';

test.describe('Clubinhos: edição', () => {
  let api: ApiClient;
  let club: { id: string; number: number };
  const suffix = uniqueSuffix();

  test.beforeAll(async () => {
    api = await ApiClient.login();
    club = await api.post('/clubs', { number: 7000 + Math.floor(Math.random() * 999), weekday: 'monday', address: { district: suffix, city: 'Campinas', state: 'SP' } });
  });

  test.afterAll(async () => {
    await api.delete(`/clubs/${club.id}`);
    await api.dispose();
  });

  test('edita o horário pela tela e a API reflete', async ({ page }) => {
    await page.goto('/adm/clubinhos');
    await searchListing(page, String(club.number));
    await cardOf(page, 'clubs', 'club-card', club.id).getByRole('button', { name: 'Editar' }).click();

    const dialog = page.getByTestId('clubs-club-form-dialog');
    await dialog.getByLabel('Horário').fill('09:30');
    await dialog.getByRole('button', { name: 'Salvar' }).click();

    await expect.poll(async () => (await api.get<{ time: string }>(`/clubs/${club.id}`)).time).toBe('09:30');
  });
});
```

Pure rules stay small and browser-free:

```ts
import { expect, test } from '@playwright/test';

import { buildClubQuery } from '@/features/clubs/utils';

test('a busca vira searchString e a paginação começa em 1', () => {
  expect(buildClubQuery({ search: ' 12 ' })).toEqual({ page: 1, limit: 12, searchString: '12' });
});
```

## 11. Domain Documentation

Update the relevant document when a contract or user flow changes:

- `docs/authentication.md` for authentication and authorization;
- `docs/club_management.md` and `docs/children_ministry.md` for clubs and children;
- `docs/teacher_area.md` for teacher workflows;
- `docs/statistics.md` for dashboards and metrics;
- `docs/api_integration.md` for API contracts and integration behavior;
- `docs/components.md` and `docs/project_structure.md` for shared architectural conventions.

Do not reuse old examples without validating current payloads, roles, and endpoint names.

## 12. Verification Commands

Run from `clubinhonib-app`:

```bash
NODE_OPTIONS='--max-old-space-size=2048' npm run type-check
NODE_OPTIONS='--max-old-space-size=2048' npm run lint
NODE_OPTIONS='--max-old-space-size=2048' npm run check:test-ids
NODE_OPTIONS='--max-old-space-size=2048' npm run test:unit
NODE_OPTIONS='--max-old-space-size=2048' npm run build
```

With the app (`npm run start:local`) and the API (`npm run start:local` in `clubinhonib-api`) running locally, also run the browser projects:

```bash
npm run test:e2e              # setup + edit + flows
npx playwright test e2e/edit  # only the persisted edit flows
npm run test:report           # opens the HTML report in e2e/report
```

Focused checks are acceptable during implementation. Before delivery, run checks proportional to the change scope. Do not run `lint:fix` indiscriminately in a worktree containing unrelated changes.

## 13. Definition of Done

A frontend change is complete only when:

- architecture, cache ownership, and API contracts are respected;
- loading, empty, error, success, and permission states are handled;
- mobile behavior and accessibility have been verified;
- no new `any`, secret, sensitive log, or avoidable magic value was introduced;
- every created or edited rendered component and critical ambiguous interaction
  exposes a stable Playwright selector;
- applicable tests and documentation were updated;
- relevant type-check, lint, test, and build commands pass;
- the final diff contains only task-related changes.
