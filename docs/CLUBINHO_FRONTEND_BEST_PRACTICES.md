# Clubinho NIB Frontend Best Practices & Engineering Guidelines

## 1. Purpose and Scope

This document defines the mandatory engineering standards for `clubinhonib-app`. AI coding assistants and human developers MUST read it before creating, fixing, or refactoring frontend code.

Current stack: React 19, strict TypeScript, Vite, React Router, Material UI/Emotion, Redux Toolkit with persistence, Axios, TanStack Query in selected features, React Hook Form/Yup, Vitest, and Testing Library.

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

- Components: rendering, interaction, loading, empty, success, and error states.
- Hooks and TanStack Query: cache behavior, invalidation, successful mutations, and failed mutations.
- API modules: method, endpoint, filters, payload, and response mapping.
- Protected routes: anonymous user, allowed role, and denied role.
- Forms: valid payload, validation failures, and API failures.
- Bug fixes: add a regression test that fails before the fix.

Use Vitest and Testing Library. Test user-observable behavior rather than implementation details. Mock network, time, and external services; tests MUST NOT call live services. Avoid broad snapshots.

New or changed code should maintain at least 90% coverage in the affected scope, including meaningful branches.

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

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

describe('ClubList', () => {
  it('shows the API result and keeps query retries deterministic', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <ClubList />
      </QueryClientProvider>,
    );

    await userEvent.click(screen.getByRole('button', { name: /search/i }));
    await waitFor(() => expect(screen.getByText(/clubinho 12/i)).toBeVisible());
  });
});
```

Use a focused API-module mock consistently within a test suite. Introduce an HTTP-mocking dependency only as an intentional repository-wide testing decision. Clear the `QueryClient` after each test and never share cache between tests.

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
NODE_OPTIONS='--max-old-space-size=2048' npm test -- --run
NODE_OPTIONS='--max-old-space-size=2048' npm run build
```

Focused checks are acceptable during implementation. Before delivery, run checks proportional to the change scope. Do not run `lint:fix` indiscriminately in a worktree containing unrelated changes.

## 13. Definition of Done

A frontend change is complete only when:

- architecture, cache ownership, and API contracts are respected;
- loading, empty, error, success, and permission states are handled;
- mobile behavior and accessibility have been verified;
- no new `any`, secret, sensitive log, or avoidable magic value was introduced;
- applicable tests and documentation were updated;
- relevant type-check, lint, test, and build commands pass;
- the final diff contains only task-related changes.
