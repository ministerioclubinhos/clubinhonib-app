# Observabilidade e auditoria — `/adm/observabilidade-auditoria`

Uma única página administrativa, mobile first, com duas abas: **registros
técnicos** (erros capturados pela API) e **eventos de auditoria** (cada
mutação executada, por quem e com que resultado; leituras não entram).
Exclusiva do papel `admin`. Cada aba tem a própria toolbar de filtros,
paginação numerada com total e páginas, e exclusão de um item (pelo modal de
detalhes) ou do período filtrado, sempre com confirmação. Clicar numa linha,
ou num card no celular, abre o modal de detalhes.

Com a API em storage `file` (`OBS_STORAGE`/`AUDIT_STORAGE=file`), a rota
responde `409 LOG_9101` e a aba mostra um aviso: os JSONL são só para análise
fora da aplicação. No desenvolvimento, `./run.sh local` sobe um DynamoDB
Local no Docker e a tela funciona por completo.

Backend: [`../../clubinhonib-api/docs/observability-audit.md`](../../clubinhonib-api/docs/observability-audit.md).

## Acesso

- Rota `observabilidade-auditoria` dentro do `ProtectedRoute` de `admin` em
  `src/App.tsx`, no mesmo bloco de `feature-flags`. Não passa por
  `FeatureRoute`.
- **Não** está no sidebar (`AdminLayout`), nos cards do painel
  (`AdminDashboardPage`) nem em `src/constants/adminAccess.ts`. O único atalho é
  o link discreto do rodapé (`Footer`), renderizado apenas para `isAdmin`, com
  `data-testid="footer-observability-audit-link"`.
- A API é a autoridade: `GET /log-records/*` responde `401` sem token e `403`
  para qualquer papel que não seja `admin`, independentemente da tela.

## Feature (`src/features/observability-audit`)

| Arquivo | Papel |
| --- | --- |
| `types.ts` | espelha os DTOs da API: `ObservabilityRecordResponse`, `AuditRecordResponse`, `CursorPageResponse`, queries; enums `RecordType`, `SourceType`, `ActorType`, `ObservabilityLevel`, `AuditOutcome`, `AuditActionType` |
| `constants.ts` | endpoints, rota, limite (25; 10/25/50/100), intervalo máximo (31 dias), lookback inicial (24 h), placeholder `—`, rótulos/cores dos enums, mensagens e `data-testid` |
| `utils.ts` | período (`datetime-local` local → ISO UTC), validação antes da request, query builders allowlisted, formatadores (`pt-BR`, duração, ids truncados) e rótulos com fallback para valor futuro. Sem React, MUI, Redux ou Axios |
| `api.ts` | `apiList*Records`, `apiDelete*Record(eventId, occurredAt)` e `apiDelete*Range(from, to)` via `src/config/axiosConfig.ts`, com `AbortSignal` e `skipGlobalError` (o painel mostra o erro e oferece retry) |
| `hooks.ts` | `usePagedRecords` (genérico: itens, `total`, `pageCount`, página, loading, erro, `unavailable`, retry), `useRecordsDeletion` (item/intervalo com retorno de contagem) e `useObservabilityPanel`/`useAuditPanel`, cada um dono dos próprios filtros base e específicos |
| `components/` | `RecordsToolbar` (período, `requestId`, filtros recolhíveis no celular, limpar, atualizar, excluir período), `RecordFilters` (específicos), `RecordsTableShell`, `RecordsPagination`, `RecordCard`, `TruncatedId`, `ObservabilityRecordsTable`, `AuditRecordsTable`, `RecordDetailsDialog` |

### Contrato consumido

```ts
GET    /log-records/observability?from&to&page&limit&requestId?&level?&errorCode?&sourceType?
GET    /log-records/audit?from&to&page&limit&requestId?&actorId?&actorRole?&outcome?&actionName?&sourceType?
-> { data: T[], total, page, limit, pageCount }
DELETE /log-records/{observability|audit}/:eventId?occurredAt   -> { deleted: 1 }   (404 se não existir)
DELETE /log-records/{observability|audit}?from&to               -> { deleted: n }
409 LOG_9101 em todas quando o storage é `file`.
```

`from`/`to` são obrigatórios, no máximo 31 dias (`422 VAL_4005`). Mudar
qualquer filtro volta para a página 1.

### Abas e modal

- As duas consultas ficam montadas o tempo todo (hooks no nível da página):
  trocar de aba não dispara request nem perde página/filtros, e as duas
  requests seguem saindo em paralelo ao abrir a tela. O painel escondido usa
  `hidden` com `role="tabpanel"`/`aria-controls`.
- O modal (`RecordDetailsDialog`) mostra somente os campos do DTO público,
  montados por `observabilityDetailFields`/`auditDetailFields` em `utils.ts`
  (rótulo, valor formatado, monoespaçado, copiável). Não busca nada a mais:
  stack, metadata e corpo não existem no contrato. Em telas `xs` ocupa a tela
  inteira; fecha por botão, Esc ou clique fora.
- O botão de copiar dentro da linha interrompe a propagação do clique para não
  abrir o modal.

### Estado

- **Por aba, tudo:** período, `requestId` (com debounce), itens por página,
  filtros específicos (texto com debounce), `items`, `total`, `pageCount`,
  `page`, `loading`, `error`, `unavailable`, `deleting`, `actionError`.
  Nada é compartilhado entre as abas.
- Uma request nova aborta a anterior (`useAbortController`) e o cancelamento
  não vira erro (`isCancelledRequest`). Recarregar mantém as linhas visíveis
  esmaecidas com `aria-busy`; o primeiro carregamento usa skeleton; `403`
  limpa o que estava em memória. Nada vai para Redux, `localStorage` ou
  `sessionStorage`, e nenhum item chega ao `console`.

### Estados e seletores

| Estado | Observabilidade | Auditoria |
| --- | --- | --- |
| painel | `observability-records-panel` | `audit-records-panel` |
| tabela | `observability-records-table` | `audit-records-table` |
| loading inicial | `observability-records-loading` | `audit-records-loading` |
| vazio | `observability-records-empty` | `audit-records-empty` |
| erro | `observability-records-error` | `audit-records-error` |
| paginação | `observability-records-pagination` | `audit-records-pagination` |
| toolbar | `observability-records-toolbar` | `audit-records-toolbar` |
| atualizar | `observability-records-refresh` | `audit-records-refresh` |
| erro de período | `observability-records-period-error` | `audit-records-period-error` |
| excluir período | `observability-records-delete-range` | `audit-records-delete-range` |
| storage `file` | `observability-records-unavailable` | `audit-records-unavailable` |
| linha | `observability-record-row-<eventId>` | `audit-record-row-<eventId>` |

Página `observability-audit-page`, abas `observability-audit-tabs` /
`observability-audit-tab-observability` / `observability-audit-tab-audit`,
modal `record-details-dialog`, botões `record-details-close` e
`record-details-delete`, e cada campo `record-details-field-<chave>` (ex.:
`record-details-field-request-id`). Linhas e cards compartilham o mesmo
`*-record-row-<eventId>`.

### Privacidade e responsividade

Só campos do DTO são renderizados; stack, metadata, body, tokens e dados
pessoais não existem no contrato e não aparecem. Mensagens de erro passam por
`extractErrorMessage`. Mobile first: abaixo de `sm` cada lista vira cards
(`RecordCard`), a toolbar mostra só período e "Atualizar" com o resto atrás de
"Mais filtros" (badge com a contagem de filtros ativos), a paginação empilha
resumo, páginas compactas e itens por página, e o modal ocupa a tela. De `sm`
para cima a tabela tem `overflow-x: auto` no próprio `TableContainer`; a
página nunca ganha scroll horizontal. Controles têm nome acessível e alvo de
44 px; ids longos ficam truncados com o valor inteiro no `aria-label` e um
botão "Copiar" com feedback.

## Testes

- `e2e/unit/observability-audit.utils.spec.ts`: período, query builders,
  formatadores e rótulos.
- `e2e/flows/observability-audit.spec.ts`: descoberta pelo rodapé, ausência no
  menu/dashboard, requests, estados independentes, retry por painel,
  cancelamento, paginação numerada (total, páginas, itens por página,
  reinício ao filtrar), período inválido por aba, celular (cards, toolbar
  recolhida), abas, modal de detalhes (clique, teclado, copiar sem abrir, Esc),
  exclusão de item e de período com confirmação, aviso de storage `file`,
  smoke com a API real (`401`/`403`/`200`) e papéis (coordenador e anônimo).
