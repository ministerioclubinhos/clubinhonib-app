# Repository Instructions — Clubinho NIB Frontend

## Scope

These instructions apply to the entire `clubinhonib-app` repository.

## Mandatory Source of Truth

Before modifying any source, test, configuration, or documentation file, read and comply with:

- [`docs/CLUBINHO_FRONTEND_BEST_PRACTICES.md`](docs/CLUBINHO_FRONTEND_BEST_PRACTICES.md)
- the applicable domain document under `docs/`.

The frontend best-practices document is the canonical detailed guide. This file is the always-loaded entrypoint and does not replace it.

## Repository Context

- Application: Clubinho NIB frontend.
- Stack: React 19, strict TypeScript, Vite, React Router, Material UI/Emotion, Redux Toolkit, Axios, TanStack Query in selected features, React Hook Form/Yup, Vitest, and Testing Library.
- Backend contract: sibling repository `../clubinhonib-api`.
- User-facing language: Portuguese. Engineering documentation and code identifiers: English.

## Non-Negotiable Rules

1. Use `src/config/axiosConfig.ts` for every HTTP operation. Do not duplicate Axios instances, authentication headers, token refresh, or global error handling.
2. Keep domain code under `src/features/<feature>/`; shared UI under `src/components/common/`; routed composition under `src/pages/`.
3. Choose one owner per state value: local React state, Redux, or TanStack Query. Do not mirror the same server response across them.
4. TanStack Query keys must include every result-changing filter; mutations must invalidate or update only related queries; `QueryClient` instances must be stable.
5. Components must not call Axios directly or own backend business rules.
6. NEVER use `any` under any circumstances. Always define explicit input DTOs (request payloads/params) and output DTOs (response contracts) for every API integration and operation. ALWAYS use enums for roles, statuses, weekdays, domain options, and finite sets (never magic strings).
7. ALWAYS create dedicated files for `types` (`types.ts` or `types/` files) and `constants` (`constants.ts`) — never declare types, interfaces, magic numbers, or hardcoded config constants inline inside components, hooks, or pages.
8. ALWAYS create dedicated `utils` / helper files (e.g., `src/features/<feature>/utils.ts` or `src/utils/`) for reusable pure functions, formatters, and data transformations instead of duplicating logic inline inside components, hooks, or pages.
9. Reuse Material UI, shared components, route guards, and the global error pipeline before creating alternatives.
10. Every screen and interaction must be mobile-first, keyboard-accessible, and usable with 44 × 44 px touch targets.
11. The API is the authorization authority. UI guards do not replace backend checks for admin, coordinator, teacher, club, or child access.
12. Never log or persist tokens or unnecessary personal data about children, guardians, teachers, coordinators, or families.
13. Every behavior change requires tests. Bug fixes require a regression test.
14. Update the applicable domain documentation when a flow or contract changes.
15. Do not modify environment, Amplify, CloudFormation, or deployment files unless explicitly requested.
16. Preserve unrelated user changes and keep the final diff limited to the requested outcome.

## Required Implementation Workflow

1. Inspect the current code, the relevant domain documentation, and the complete affected flow.
2. Verify the endpoint and DTO contract in the NestJS API.
3. Search for reusable components, hooks, types, query keys, and utilities.
4. Implement the smallest cohesive change with loading, empty, success, error, and permission states.
5. Add or update tests and documentation.
6. Run checks proportional to the change and inspect the final diff.

When existing code conflicts with the canonical guide, do not spread the inconsistency and do not perform an unrelated mass refactor. Apply the standard within scope and report remaining debt.

## Verification

```bash
NODE_OPTIONS='--max-old-space-size=2048' npm run type-check
NODE_OPTIONS='--max-old-space-size=2048' npm run lint
NODE_OPTIONS='--max-old-space-size=2048' npm test -- --run
NODE_OPTIONS='--max-old-space-size=2048' npm run build
```

A change is incomplete if its relevant tests, type-check, lint, or build fail.
