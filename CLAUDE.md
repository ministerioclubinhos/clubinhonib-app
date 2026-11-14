# Claude Project Instructions — Clubinho NIB Frontend

Read and comply with [`AGENTS.md`](AGENTS.md), [`docs/CLUBINHO_FRONTEND_BEST_PRACTICES.md`](docs/CLUBINHO_FRONTEND_BEST_PRACTICES.md), and the applicable domain document before modifying this repository.

Mandatory summary:

- Use the shared Axios client and keep API, hooks, components, pages, and types separated.
- Choose one owner for each state value: local React, Redux, or TanStack Query.
- Use explicit input DTOs and output DTOs for all API calls and operations.
- ALWAYS create dedicated files for `types` and `constants`, ALWAYS use domain enums for finite sets (no magic strings), and ALWAYS create dedicated `utils` files for pure logic.
- Use strict TypeScript and NEVER use `any` under any circumstances.
- Reuse Material UI, shared components, guards, query-key patterns, and error utilities.
- Cover mobile, accessibility, role/club permissions, privacy, tests, and docs.

If this summary and the detailed guide differ, the detailed guide controls.
