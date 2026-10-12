# Project Structure & Architecture

A high-level overview of the codebase organization to help new developers navigate the system.

## 📂 Root Directory

- `src/`: Application source code.
- `cloudformation/`: Infrastructure as Code (IaC) templates (see [Deployment](./deployment_infrastructure.md)).
- `docs/`: Project documentation.
- `env/`: Environment-specific configuration files.
- `public/`: Static assets served directly (favicon, manifest).

## 🧩 Source Directory (`src/`)

The source code follows a feature-based modular architecture:

- **`components/`**: Shared UI components used across multiple features (Buttons, Modals, Layouts).
- **`config/`**: App-wide configuration (Axios, Theme).
- **`constants/`**: App-wide constants (Error messages, Success messages, Enums).
- **`features/`**: Domain-specific logic. Each folder represents a business domain (e.g., `auth`, `clubs`, `documents`) and contains its own components, hooks, and services.
- **`hooks/`**: Global custom hooks (e.g., `useAuth`, `useDebounce`).
- **`pages/`**: Top-level route components. These orchestrate features and layout.
- **`store/`**: Redux Toolkit setup, including the root reducer and global slices.
- **`styles/`**: Global styles and theme definitions.
- **`types/`**: Shared TypeScript interfaces and type definitions (`shared.ts`).
- **`utils/`**: Helper functions and generic logic (Date formatting, Validation).

## 🏗️ Architectural Patterns

- **Feature Slices**: We prefer co-locating logic within `features/` rather than separating by type (e.g., all actions in one folder).
- **Container/Presenter**: Complex pages often separate the data fetching (Container/Hook) from the rendering (Component).
- **Atomic Design (Loose)**: `components/` generally contains Atoms and Molecules, while `features/` contains Organisms and Templates.

## 🧾 Dívida conhecida

[`pendencias-tecnicas.md`](pendencias-tecnicas.md) lista o que a varredura de
setembro de 2026 encontrou fora do padrão descrito aqui — features sem
`types`/`utils`/`constants`, arquivos longos demais, telas ainda fora do
`ListingLayout` — em ordem de prioridade e com caixas para marcar conforme for
resolvido.

## Studio state and transport helpers

`src/features/ai-lessons/` owns transport DTOs/enums (`types.ts`), query key
factories (`queryKeys.ts`), immutable draft reconciliation (`drafts.ts`), workflow
availability (`workflow.ts`), the SSE lifecycle (`stream.ts`) and PDF helpers
(`pdf.ts`, `useLessonPdfPreview.ts`). `useLessonLocalDrafts` owns local document
edits; `useStudioUnsavedChanges` extends the shared dirty-form guard for studio
browser-history navigation. Existing service and hook imports remain compatible;
`src/services/aiLessonsService.ts` re-exports feature types while keeping HTTP
operations on the shared Axios instance. Routed pages remain under
`src/pages/admin/ai-lessons/`.
