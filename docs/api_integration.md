# API Integration & Configuration

## Shared idea submissions

`apiCreateIdeasSection` sends `multipart/form-data` to `POST /ideas-sections`.
The `sectionData` JSON includes the idea title, description and `medias`;
uploaded documents, images and videos use `fieldKey` multipart parts. The
teacher flow omits per-media title and description; the API generates those
values. Document/image links are not accepted; video links must be YouTube.
The shared Axios instance reports upload progress and uses a five-minute
timeout. HTTP 201 confirms persistence and is safe to show as success.

This document outlines how the application interfaces with the backend and external services.

## 📡 Axios Configuration

The core API client is configured in `src/config/axiosConfig.ts`.

- **Base URL**: Dynamically set via environment variables (see [Deployment](./deployment_infrastructure.md)).
- **Interceptors**:
  - **Request**: Automatically attaches the Authorization header (Bearer token) from the Redux state.
  - **Response**: Global error handling logic is triggered here, often redirecting to login on 401 Unauthorized errors.

## 🛡️ Error Handling

We leverage a centralized error handling strategy defined in `src/utils/apiError.ts`.

- **Standardized Responses**: The backend returns errors in a specific format which is parsed by `getErrorMessage`.
- **User Feedback**: Errors are often displayed via `notistack` (toast notifications) or specific form field errors using `react-hook-form`.
- **Constants**: All error messages are centralized in `src/constants/errorMessages.ts` to prevent hardcoding.

## 🧱 Feature contracts

Each feature keeps its API surface in four files, and nothing outside them talks
to the network:

| File | Responsibility |
| --- | --- |
| `types.ts` | Mirrors the NestJS DTOs field by field — request payloads, query strings and response contracts. Nothing here is inferred from usage. |
| `constants.ts` | Endpoint path, pagination defaults, page-size options, enums and labels. |
| `utils.ts` | Pure functions: the query builder, the form validator, the payload builders and the formatters. |
| `api.ts` | The HTTP calls, always through the shared Axios client, always typed on both ends. |
| `hooks.ts` | Server state, debounce, request cancellation and the mutations. |

Conventions the people features follow, which a new listing should copy:

- **The query builder lives in `utils.ts`, not in `api.ts`.** It drops empty
  filters instead of sending `q=` or `role=all`, which the API would reject or
  interpret as a filter on the empty string.
- **The search box is debounced and every request is cancellable.** A superseded
  request is aborted, and `isCancelledRequest` keeps the cancellation out of the
  error state.
- **A mutation returns whether it succeeded.** The dialog only closes on `true`,
  so a rejected payload still has somewhere to show its message.
- **Dates that are calendar days stay strings.** `YYYY-MM-DD` is formatted by
  splitting the text, never by `new Date`, which would read it as UTC and show
  the previous day west of Greenwich.

### Log records (`observability-audit`)

`GET /log-records/observability` and `GET /log-records/audit` use the same
`Paginated<T>` envelope as the other listings (`data`, `total`, `page`,
`limit`, `pageCount`). Two things are specific to this feature:

- the date range is mandatory and validated on the client before the request
  (`from < to`, at most 31 days), mirroring the API's `422 VAL_4005`;
- a `409 LOG_9101` is not a failure: it means the API stores logs as files
  and cannot list or delete them. The feature shows an informational state
  instead of the retry alert.

## 🌐 Environment Variables

The application uses different environment configurations located in `env/`:

- `.env.local`: Local development overrides.
- `.env.stg`: Staging environment settings.
- `.env.prod`: Production environment settings.

**Key Variables**:

- `VITE_API_URL`: The endpoint for the backend API.
- `VITE_GOOGLE_ADS_CLIENT_ID`: Google Client ID for authentication.

## Configurações de IA

A página /adm/config-provedores-ia usa GET/PUT
/api/v1/lessons/providers/settings para ler e salvar provedor ativo, modelos,
chaves e parâmetros em uma única operação. O servidor é a fonte de verdade: a
seleção não fica em localStorage e erros de salvamento são exibidos na tela.
A geração usa somente os parâmetros salvos, sem fallback para env.

## Estúdio Clubinho

O cliente HTTP e os hooks do Estúdio ficam em `src/features/ai-lessons/api.ts` e
`src/features/ai-lessons/hooks.ts`; `src/services/aiLessonsService.ts` e
`src/hooks/api/useAiLessons.ts` apenas reexportam, por compatibilidade. O
contrato completo está em `clubinhonib-api/docs/api-ai-lessons.md`. Todas as
rotas têm o prefixo `/api/v1/lessons`.

| Chamada | Uso no app |
| --- | --- |
| `POST /api/v1/lessons` | Criar pacote (semanal ou especial) |
| `GET /api/v1/lessons`, `GET /api/v1/lessons/dashboard` | Listas e painel; `statuses` separado por vírgula na fila de revisão |
| `GET /api/v1/lessons/:id?view=compact` | Detalhe com apenas a versão atual de cada etapa |
| `GET /api/v1/lessons/:id/events?view=compact` | Stream SSE de snapshots e `heartbeat` |
| `DELETE /api/v1/lessons/:id` | Excluir (oculto para publicada, em publicação ou arquivada) |
| `POST /api/v1/lessons/:id/archive`, `/unarchive` | Arquivar e restaurar lição publicada |
| `POST /api/v1/lessons/:id/comments/:commentId/resolve` | Marcar observação como resolvida |
| `POST /api/v1/lessons/:id/stages/generate` | Gerar ou regerar etapa (com confirmação); item `APPROVED` ou `IN_REVIEW` responde 409 e o botão fica bloqueado com o motivo |
| `PATCH /api/v1/lessons/:id/stages/content` | Salvar edição com o `lockVersion` do rascunho |
| `POST /api/v1/lessons/:id/stages/complete-production` | Concluir; envia `lockVersion` e, após confirmação, `acknowledgeStale` |
| `POST /api/v1/lessons/:id/package/submit-review` | Iniciar revisão |
| `POST /api/v1/lessons/:id/stages/approve`, `/request-changes`, `/reopen` | Revisão; sempre com o `lockVersion` reconhecido pelo revisor. A aprovação gera o PDF do item antes de aprovar: pode levar segundos e responder 422/503 (`LESSON_9314`), exibidos ao lado dos botões |
| `GET /api/v1/lessons/:id/stages/:stage/preview.pdf` | Prévia vinculada a `lockVersion` e `versionId` |
| `POST /api/v1/lessons/:id/export/pdf` | PDF consolidado |
| `GET /api/v1/lessons/:id/publication-preview` | Título final, tipo, número de PDFs, página vinculada (`exists`, `routePath`, `currentWeek`) e duplicatas; carregado ao abrir o diálogo de publicação e enquanto a lição está publicada |
| `POST /api/v1/lessons/:id/publish-week-material` | Publicar (com confirmação); também republica uma lição `PUBLISHED` cuja página foi removida |
| `POST /api/v1/week-material-pages/current-week/:id` | "Definir como semana atual" a partir da lição publicada (com confirmação) |
| `GET/PATCH /api/v1/lessons/prompt-preferences/me`, `POST …/reset` | Orientações por etapa; a prévia usa o `effectivePrompt` da API |

`PATCH /api/v1/lessons/:id/stages/content` salva o documento Tiptap completo,
incluindo marcas de fonte/tamanho/cor/link, espaçamento do parágrafo e células
mescladas. É necessário salvar a edição antes da prévia ou exportação. O backend
reconcilia o documento sobre o dado estruturado do servidor e usa essa versão
para montar o DOCX e converter em PDF, também nas meditações editadas.

Erros tratados pela interface: `LESSON_9303` (conflito de versão: preserva o
texto digitado e oferece reaplicar sobre a versão atual), `LESSON_9308` (item
desatualizado: pede confirmação e reenvia com `acknowledgeStale`), 404 no stream
(lição excluída em outra sessão) e 422 da prévia (conteúdo não cabe na folha).
`failureCode` e `failureMessage` da etapa são exibidos no diálogo de falha.

### Shared idea AI contracts

The ideas feature exposes `apiRequestIdeaAiEnhancement(id)` (`POST /ideas-sections/:id/ai-enhancement`, `202`) and typed detail fields for snapshot, active/current attempts, history and publication choices. API URLs remain in `api.ts`; components do not call HTTP directly. `useIdeasSectionById` owns active-job polling and `useIdeaAiReprocess` prevents duplicate requests.

`aiDecisions` carries the `enhancementId`, title/description choice and selected source-media IDs. `409` indicates active work, attempt limit or stale choices. Attach with `ignoreAiEnhancement: true` explicitly requests the complete original and cancels active work. Validation and transport errors use the existing global error extraction pipeline. See backend `docs/api-ideas-enhancement.md` for the complete contract and rollout prerequisites.
