# API Integration & Configuration

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

## Edição e exportação do Estúdio

`PATCH /lessons/:id/stages/content` salva o documento Tiptap completo, incluindo
marcas de fonte/tamanho/cor/link, espaçamento do parágrafo e células mescladas.
É necessário salvar a edição antes da prévia ou exportação. O backend usa essa
versão para montar o DOCX e converter em PDF, também nas meditações editadas.
Localizar/substituir altera o mesmo documento; contadores e tela cheia são
apenas controles do editor.
