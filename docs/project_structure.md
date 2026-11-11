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

[`pendencias-tecnicas.md`](../../clubinhonib-api/docs/pendencias-tecnicas.md) (no repositório da API) lista o que a varredura de
setembro de 2026 encontrou fora do padrão descrito aqui — features sem
`types`/`utils`/`constants`, arquivos longos demais, telas ainda fora do
`ListingLayout` — em ordem de prioridade e com caixas para marcar conforme for
resolvido.

## Estúdio: estado e transporte

`src/features/ai-lessons/` concentra o domínio do Estúdio:

- `api.ts` e `hooks.ts`: cliente HTTP e hooks de consulta/mutação.
  `src/services/aiLessonsService.ts` e `src/hooks/api/useAiLessons.ts` só
  reexportam, por compatibilidade.
- `types.ts`, `queryKeys.ts`, `constants.ts`, `presentation.constants.ts` e
  `presentation.utils.ts`: DTOs/enums, chaves de cache, limites e rótulos.
- `drafts.ts`, `useLessonLocalDrafts.ts`, `draftStorage.ts` e
  `usePersistedStudioState.ts`: rascunhos por etapa e sua persistência em
  `sessionStorage`. `useReviewFeedback.ts` faz o mesmo para as observações do
  revisor.
- `workflow.ts` e `review-actions.ts`: disponibilidade das ações.
  `useAcknowledgedVersions.ts` guarda a versão que o revisor abriu.
- `stream.ts`: ciclo de vida do SSE (rotação, backoff, pausa com aba oculta).
- `pdf.ts` e `useLessonPdfPreview.ts`: prévia de PDF.
- `useStageParam.ts`, `useElapsedSeconds.ts`, `useStageAssetIssue.ts` e
  `useStudioUnsavedChanges.ts`: etapa na URL, tempo de geração, completude das
  artes e guarda de saída.
- `components/`: `LessonStageContentViewer`, `StoryVisualCarousel`,
  `StoryVisualConfiguration`, `LessonConnectionAlert`, `LessonCommentsPanel`,
  `LessonPdfPreviewDialog`, `StageImpactList` e as ferramentas do editor.
- `meditation-editor-core/`, `younger-meditation-editor/`,
  `older-meditation-editor/` e `manual-work-preview/`: editores e prévias
  próprios dos itens 6, 7 e 8.

`src/features/ai-providers/` contém a página de configuração de provedores, e
`src/components/ai-lessons/` o editor de documento (`LibreOfficeDocEditor`) e o
modal de criação. As páginas roteadas ficam em `src/pages/admin/ai-lessons/` e
são carregadas sob demanda com `React.lazy` e `Suspense` em `src/App.tsx`.
