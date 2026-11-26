# GitHub Copilot Instructions — Clubinho NIB Frontend

These instructions apply to all suggestions and edits in this repository.

Read and follow [`AGENTS.md`](../AGENTS.md), [`docs/CLUBINHO_FRONTEND_BEST_PRACTICES.md`](../docs/CLUBINHO_FRONTEND_BEST_PRACTICES.md), and the applicable domain documentation.

- Follow the React 19, Vite, strict TypeScript, Material UI, Redux Toolkit, Axios, and TanStack Query architecture.
- Keep HTTP calls in feature API modules and use `src/config/axiosConfig.ts`.
- Assign each state value to one owner and use stable, complete query keys.
- Always define explicit input DTOs and output DTOs for all API calls and operations.
- ALWAYS create dedicated files for `types` and `constants`, ALWAYS use domain enums for finite sets (no magic strings), and ALWAYS create dedicated `utils` files for pure functions/logic.
- NEVER introduce `any` under any circumstances; use strict explicit typing and narrow `unknown` at boundaries. Do not duplicate session logic, inaccessible UI, or sensitive logging.
- Include loading, empty, success, error, mobile, role/club permission, and test coverage.
- Keep changes focused and preserve unrelated work.
