# Plano de Implementação Frontend — Observabilidade e Auditoria

**Status:** plano de implementação; nenhuma alteração de código, API, ambiente
ou infraestrutura está autorizada por este documento.

**Última revisão:** 2026-09-05

**Escopo do repositório:** `clubinhonib-app`

**Dependência principal:**
[`clubinhonib-api/doc/implementaion-plan/observability-audit-implementation-plan.md`](../../../clubinhonib-api/doc/implementaion-plan/observability-audit-implementation-plan.md)

## 1. Objetivo

Criar uma única página administrativa, somente leitura, para consultar os dois
fluxos lógicos definidos pelo backend:

1. registros técnicos de **observabilidade**;
2. eventos de **auditoria**.

A página será exclusiva para administradores. Seu acesso seguirá o padrão já
usado por Feature Flags: a rota existe e é protegida, mas não aparece no menu
lateral nem no painel principal de administração. O único atalho visual será um
link discreto no rodapé, renderizado apenas para o papel `admin`.

Embora a interface apresente duas tabelas, o plano do backend prevê uma única
tabela física do DynamoDB, separada logicamente por `recordType`. O frontend não
conhece essa implementação: ele consulta exclusivamente endpoints HTTP
administrativos e nunca acessa DynamoDB, arquivos de log ou credenciais AWS.

## 2. Requisitos confirmados

- Uma única página deve listar duas tabelas:
  - **Observabilidade**;
  - **Auditoria**.
- A rota proposta é `/adm/observabilidade-auditoria`.
- Somente usuários com `UserRole.ADMIN` podem acessar a página.
- A página não entra:
  - no sidebar do `AdminLayout`;
  - no dashboard `AdminDashboardPage`;
  - nas rotas permitidas ao coordenador.
- O acesso visual fica no rodapé, junto do acesso de Feature Flags, com baixa
  ênfase e visível somente ao administrador autenticado.
- A página é estritamente de leitura: não edita, exclui, reprocessa, limpa nem
  altera registros.
- A API continua sendo a autoridade de autorização. Ocultar o link e proteger a
  rota no React não substituem `JwtAuthGuard` e role administrativa no NestJS.
- Nenhum registro pode ser salvo em Redux persistido, `localStorage` ou
  `sessionStorage`.
- Tokens, dados pessoais e conteúdo técnico não podem ser enviados para logs do
  navegador.

## 3. Fatos verificados no frontend atual

### 3.1 Navegação e autorização

- `src/App.tsx` protege `/adm` para `admin` e `coordinator` e já possui um
  `ProtectedRoute` interno exclusivo para `UserRole.ADMIN`.
- `/adm/feature-flags` está dentro desse guard interno de administrador.
- `src/components/Adm/AdminLayout/AdminLayout.tsx` deliberadamente não inclui
  Feature Flags no menu lateral.
- `src/components/Adm/AdminDashboardPage.tsx` deliberadamente não inclui
  Feature Flags nos cards do painel.
- `src/components/Footer/Footer.tsx` calcula `isAdmin` a partir da sessão Redux e
  mostra um link discreto para `/adm/feature-flags` somente nesse caso.
- `src/constants/adminAccess.ts` é a lista única das rotas visíveis ao
  coordenador; a nova rota não deve ser adicionada a ela.

### 3.2 Integração e estado

- Toda chamada HTTP deve usar `src/config/axiosConfig.ts`.
- O cliente compartilhado já é responsável pelo token, refresh de sessão e
  tratamento global de erros.
- As listagens administrativas comuns usam estado local em hooks, debounce,
  `AbortController` e `extractErrorMessage`/`isCancelledRequest`.
- TanStack Query existe apenas em features selecionadas. Esta página não
  precisa criar outro `QueryClientProvider`: cada tabela pode ter um hook local
  como único dono de sua resposta e de sua paginação.
- Não existe hoje feature, rota, hook ou cliente HTTP de observabilidade e
  auditoria no frontend.

### 3.3 Componentes de listagem

- `src/components/common/listing/ListingLayout.tsx` foi desenhado para grade de
  cards e paginação por página/total. Ele não atende diretamente uma listagem
  tabular paginada por cursor.
- `src/features/statistics/components/ui/DataTable.tsx` é privado da feature de
  estatísticas, inclui busca/exportação e pressupõe paginação por
  `page/limit/total`; não deve ser importado por outra feature nem copiado.
- A nova tela deve usar componentes MUI (`Table`, `TableContainer`, `TableHead`,
  `TableBody`, `TableRow`, `TableCell`, `Skeleton`, `Alert` e botões) dentro da
  própria feature.
- As duas tabelas precisam de rolagem horizontal contida no `TableContainer` em
  telas pequenas. A página inteira não pode adquirir scroll horizontal.

### 3.4 Testes e seletores

- Os testes do frontend são executados por Playwright.
- Todo componente renderizado novo ou alterado precisa de `data-testid`
  estável, descritivo e em kebab-case.
- Loading, vazio, erro, sucesso, filtros e paginação precisam de seletores
  previsíveis quando o fluxo E2E depender deles.

## 4. Dependências e decisões que o backend deve fechar

O pedido desta página resolve parcialmente a decisão D-008 do plano do backend:
haverá consulta por API administrativa e o consumidor humano será o
administrador autenticado. Ainda é necessário fechar os contratos abaixo antes
de implementar `types.ts` e `api.ts` no frontend.

| ID | Contrato necessário | Impacto no frontend |
| --- | --- | --- |
| FE-BE-001 | Caminho exato dos dois endpoints `GET`. | Define as constantes de endpoint e os testes de request. |
| FE-BE-002 | DTO completo de cada item e enums serializados. | Impede que a interface invente campos, valores ou labels. |
| FE-BE-003 | Query DTO de cada endpoint e filtros allowlisted. | Define os controles que podem aparecer na tela. |
| FE-BE-004 | Formato do cursor opaco e envelope da página. | Define avanço, retorno e reset da paginação. |
| FE-BE-005 | Intervalo máximo permitido e semântica de `from`/`to`. | Define validação, valor inicial e mensagens do filtro de período. |
| FE-BE-006 | Ordenação garantida pelo servidor. | A tela não pode prometer ordenação que a API não oferece. |
| FE-BE-007 | Se existe `total` exato, estimado ou nenhum total. | Cursor não deve ser adaptado artificialmente para `TablePagination`. |
| FE-BE-008 | Campos seguros permitidos na resposta de lista. | Evita exibir stack, metadata ou identificadores proibidos. |
| FE-BE-009 | Catálogo de erros `400/401/403/422/500`. | Define feedback local sem expor mensagem técnica bruta. |
| FE-BE-010 | Comportamento da consulta quando o storage ativo é `file`. | A mesma página deve funcionar sem conhecer o provider do backend. |

O frontend não deve começar a integração usando nomes provisórios de endpoint
ou convertendo diretamente o item físico do DynamoDB. A API precisa devolver
DTOs públicos, redigidos e independentes do storage.

### 4.1 Fora do MVP até decisão explícita

- exportação CSV/JSON;
- polling ou atualização automática;
- tela de detalhe ou download de stack completa;
- consulta sem intervalo de datas;
- busca textual livre em mensagem/metadata;
- links externos para AWS Console;
- ações de exclusão, retenção, replay ou alteração;
- acesso de coordenador, professor ou operador sem papel `admin`.

## 5. Critérios de aceite

### 5.1 Acesso e descoberta

1. Um administrador autenticado vê no rodapé o link
   “Observabilidade e auditoria”.
2. O link não aparece para usuário anônimo, professor ou coordenador.
3. A nova opção não aparece no sidebar nem nos cards de `/adm` para nenhum
   papel.
4. O administrador consegue abrir, atualizar e acessar diretamente
   `/adm/observabilidade-auditoria`.
5. Usuário anônimo é direcionado ao login pelo fluxo existente.
6. Coordenador ou professor não renderiza a página ao digitar a URL diretamente.
7. A API retorna `403` para todo papel não administrativo, independentemente da
   proteção do frontend.

### 5.2 Duas tabelas

1. A página apresenta os painéis “Observabilidade” e “Auditoria”, empilhados na
   mesma rota.
2. Cada painel tem loading, vazio, sucesso, erro, retry e paginação próprios.
3. Falha em uma consulta não apaga nem bloqueia o resultado da outra.
4. As duas consultas podem ocorrer concorrentemente.
5. Um novo filtro cancela a request anterior e impede resposta obsoleta de
   substituir a atual.
6. A paginação é executada no servidor por cursor opaco; não se baixa o conjunto
   completo para filtrar no navegador.
7. Alterar período ou filtro reinicia somente a paginação afetada.
8. Recarregar mantém as linhas atuais visíveis e esmaecidas enquanto a nova
   resposta é buscada; o primeiro carregamento usa skeleton.
9. Datas recebidas em UTC são mostradas em `pt-BR`, com data, hora e indicação
   clara do fuso utilizado.
10. Valores ausentes usam um placeholder único definido em `constants.ts`.

### 5.3 Segurança e privacidade

1. O frontend renderiza somente campos presentes nos DTOs de resposta
   allowlisted pelo backend.
2. Body, response, token, cookie, e-mail, CPF, telefone, nomes de crianças e
   metadata arbitrária não aparecem na tabela.
3. Nenhum registro consultado é persistido no navegador.
4. Nenhum `console.log`, telemetria de frontend ou mensagem de erro inclui o
   item bruto retornado pela API.
5. Mensagens de falha para o usuário passam por `extractErrorMessage` e nunca
   mostram stack ou resposta técnica bruta.
6. A interface não oferece ações de escrita sobre os registros.

### 5.4 Responsividade e acessibilidade

1. Cada tabela fica em um contêiner próprio com `overflow-x: auto` e largura
   mínima controlada.
2. A página continua utilizável em 320 px sem scroll horizontal global.
3. Filtros e botões têm nome acessível, foco visível e alvo mínimo de 44 × 44 px
   em mobile.
4. Cabeçalhos usam células semânticas e cada tabela possui nome/caption
   acessível.
5. Estados de loading, erro e vazio são anunciáveis e não dependem somente de
   cor.
6. IDs extensos são truncados visualmente sem perder o valor acessível; qualquer
   ação de copiar tem `aria-label` e feedback.

## 6. Arquitetura proposta

```text
src/features/observability-audit/
├── ObservabilityAuditPage.tsx
├── api.ts
├── constants.ts
├── hooks.ts
├── types.ts
├── utils.ts
├── index.ts
└── components/
    ├── AuditRecordsTable.tsx
    ├── ObservabilityRecordsTable.tsx
    ├── RecordFilters.tsx
    ├── RecordsTableShell.tsx
    └── CursorPagination.tsx
```

Não criar arquivos ou componentes que o contrato final não exigir. Um diálogo
de detalhes só entra nessa estrutura se FE-BE-008 aprovar um DTO seguro para
isso.

### 6.1 Responsabilidades

- `types.ts`
  - espelha, campo a campo, os DTOs de query e resposta do NestJS;
  - declara enums para níveis, origem, ator, ação e resultado;
  - reutiliza `UserRole` quando o valor é o mesmo contrato da sessão;
  - nunca usa `any`.
- `constants.ts`
  - caminhos de endpoint confirmados;
  - limite inicial e opções de limite;
  - lookback inicial confirmado;
  - placeholder, labels e opções de enums;
  - limites visuais como largura mínima da tabela.
- `utils.ts`
  - monta query allowlisted e remove filtros vazios;
  - converte o período para ISO-8601 UTC;
  - formata datas e duração;
  - traduz enums conhecidos para rótulos em português;
  - fornece fallback seguro para enum futuro desconhecido;
  - não importa React, MUI, Redux ou Axios.
- `api.ts`
  - usa exclusivamente `src/config/axiosConfig.ts`;
  - expõe uma função tipada para cada endpoint `GET`;
  - recebe `AbortSignal`;
  - não transforma cursor nem objeto de erro em estado de UI.
- `hooks.ts`
  - mantém separadamente filtros, itens, cursor atual, histórico de cursores,
    próximo cursor, loading, erro e refresh de cada tabela;
  - aborta requests substituídas e ignora cancelamentos;
  - não copia respostas para Redux;
  - oferece API pequena para os componentes.
- `ObservabilityAuditPage.tsx`
  - compõe cabeçalho, período compartilhado, refresh e as duas tabelas;
  - não chama Axios diretamente;
  - não contém DTOs, enums, constantes ou formatadores inline.
- `ObservabilityRecordsTable.tsx` e `AuditRecordsTable.tsx`
  - conhecem apenas o seu próprio DTO;
  - definem a apresentação de suas colunas;
  - não constroem URL ou regra de autorização.
- `RecordsTableShell.tsx`
  - compartilha apenas a casca realmente igual: título, toolbar, loading, erro,
    vazio e slot da tabela;
  - não recebe flags para misturar os dois contratos.
- `CursorPagination.tsx`
  - oferece “Anterior” e “Próxima” com estados desabilitados corretos;
  - nunca exibe o cursor;
  - não promete total nem número de páginas quando a API não os informa.

## 7. Contrato esperado da API

Os nomes abaixo descrevem o conteúdo mínimo esperado e devem ser ajustados aos
DTOs finais do backend. Não são autorização para inventar campos no frontend.

### 7.1 Envelope por cursor

```typescript
interface CursorPageResponse<T> {
  data: T[];
  nextCursor: string | null;
}
```

Se o backend devolver `hasNext`, `limit`, intervalo efetivo ou total, esses
campos devem ser declarados explicitamente. `LastEvaluatedKey` do DynamoDB nunca
pode sair na resposta pública.

O retorno à página anterior é controlado no frontend por uma pilha dos cursores
já utilizados. Não existe tentativa de decodificar, editar ou reconstruir o
cursor.

### 7.2 Campos comuns mínimos

```typescript
interface LogRecordCommonResponse {
  schemaVersion: string;
  eventId: string;
  recordType: RecordType;
  environment: string;
  service: string;
  occurredAt: string;
  requestId: string | null;
  sourceType: SourceType;
  actorType: ActorType;
  actorId: string | null;
  actorRole: UserRole | null;
}
```

`expiresAtEpochSeconds` pode ser necessário para investigação de retenção, mas
só deve entrar no DTO da tela se o backend decidir que administradores podem
vê-lo.

### 7.3 Tabela de observabilidade

Colunas iniciais, condicionadas ao DTO final:

| Coluna | Campo esperado | Apresentação |
| --- | --- | --- |
| Data/hora | `occurredAt` | `pt-BR`, instante completo. |
| Nível | `level` | Chip com texto e cor semântica. |
| Origem | `context`/`sourceType` | Texto curto, sem caminho local absoluto. |
| Operação | `operation` | Placeholder quando ausente. |
| Erro | `errorCode`/`errorName` | Código catalogado e classe sanitizada. |
| Mensagem | `message`/`errorMessage` | Texto limitado e sanitizado. |
| Requisição | `requestId` | ID truncado visualmente e íntegro no nome acessível. |
| HTTP | `httpMethod`/`statusCode` | Exibido somente quando aplicável. |

Stack, `metadata`, caminho/linha de origem e fingerprint não entram como colunas
do MVP. Se forem aprovados, devem aparecer em detalhe somente leitura, com
redação adicional no backend e apresentação limitada no frontend.

### 7.4 Tabela de auditoria

Colunas iniciais, condicionadas ao DTO final:

| Coluna | Campo esperado | Apresentação |
| --- | --- | --- |
| Data/hora | `occurredAt` | `pt-BR`, instante completo. |
| Ator | `actorType`/`actorId`/`actorRole` | Tipo, UUID quando permitido e papel. |
| Ação | `actionName`/`actionType` | Identificador automático do backend. |
| Recurso | `resourceType`/`resourceId` | Somente identificador aprovado. |
| Resultado | `outcome` | Chip semântico com rótulo em português. |
| HTTP | `httpMethod`/`routeTemplate`/`statusCode` | Rota normalizada, nunca URL com query sensível. |
| Duração | `durationMs` | Unidade explícita e valor limitado. |
| Requisição | `requestId` | Permite correlação com observabilidade. |

`changedFields` só pode ser exibido se o backend retornar uma lista fechada e
sanitizada de nomes. Valores anteriores/posteriores e snapshots não fazem parte
da tela.

### 7.5 Queries mínimas

As duas consultas devem receber:

- `from` e `to`, obrigatórios conforme o limite definido pelo backend;
- `limit`;
- `cursor`, somente após a primeira página;
- `requestId`, opcional, para correlação.

Filtros específicos candidatos, somente se aceitos pelos DTOs:

- observabilidade: `level`, `errorCode`, `sourceType`;
- auditoria: `actorId`, `actorRole`, `outcome`, `actionName`, `sourceType`.

Busca textual livre não deve ser simulada no cliente sobre a página atual. Se o
backend não oferecer o filtro, o controle não aparece.

## 8. Estado, carregamento e paginação

### 8.1 Estado compartilhado da página

- período `from`/`to`;
- `requestId` opcional;
- comando de atualizar as duas consultas.

Um período compartilhado facilita correlacionar a mesma request nas duas
tabelas. O valor inicial deve vir de constante e respeitar FE-BE-005; não deve
ser hardcoded dentro do componente.

### 8.2 Estado independente por tabela

- filtros específicos;
- `items`;
- `currentCursor`;
- `cursorHistory`;
- `nextCursor`;
- `pageIndex` apenas para o texto da interface, sem enviar ao backend;
- `loading`, `error` e `reloadToken`.

### 8.3 Regras de request

1. Aplicar/debounciar apenas controles que possam gerar digitação contínua.
2. Cancelar a request anterior com `AbortController` quando a query mudar.
3. Ignorar erro de cancelamento com `isCancelledRequest`.
4. Preservar itens no refresh; limpar apenas ao trocar para um conjunto de
   filtros incompatível ou quando a nova resposta válida for vazia.
5. Não fazer retry automático infinito.
6. Usar `skipGlobalError: true` somente se o painel mostrar o erro e oferecer
   retry completo; isso evita toast global duplicado para a mesma falha.
7. Tratar `401` pelo fluxo único do interceptor compartilhado.
8. Tratar `403` sem renderizar conteúdo anterior que possa estar em memória.

## 9. Navegação e composição da rota

### 9.1 `src/App.tsx`

- importar `ObservabilityAuditPage` pelo `index.ts` da feature;
- registrar `observabilidade-auditoria` no mesmo bloco interno de
  `ProtectedRoute requiredRole={[UserRole.ADMIN]}` que hoje contém Feature
  Flags;
- não envolver a rota em `FeatureRoute` no MVP;
- manter o guard da API como autoridade final.

Estrutura esperada:

```tsx
<Route element={<ProtectedRoute requiredRole={[UserRole.ADMIN]} />}>
  <Route path="feature-flags" element={<FeatureFlagsManager />} />
  <Route
    path="observabilidade-auditoria"
    element={<ObservabilityAuditPage />}
  />
</Route>
```

### 9.2 `src/components/Footer/Footer.tsx`

- manter o mesmo `isAdmin` já calculado;
- adicionar um link discreto para `/adm/observabilidade-auditoria` próximo de
  Feature Flags;
- usar ícone MUI já instalado e rótulo “Observabilidade e auditoria”;
- adicionar `data-testid="footer-observability-audit-link"` ao link;
- garantir foco e contraste suficientes mesmo com a baixa ênfase visual.

### 9.3 Arquivos que deliberadamente não recebem o item

- `src/components/Adm/AdminLayout/AdminLayout.tsx`;
- `src/components/Adm/AdminDashboardPage.tsx`;
- `src/constants/adminAccess.ts`.

Testes devem provar a ausência, evitando que uma refatoração futura transforme o
acesso discreto em item comum do menu.

## 10. Experiência da página

### 10.1 Cabeçalho e filtros comuns

- `BackHeader` com título “Observabilidade e auditoria”;
- descrição curta de que a tela contém registros técnicos e ações auditadas;
- intervalo de data/hora obrigatório;
- filtro opcional por `requestId`;
- botão “Atualizar tudo” com progresso e bloqueio contra clique duplicado.

### 10.2 Painel de observabilidade

- título e explicação acessível;
- filtros específicos aprovados;
- tabela com cabeçalho sticky se a altura for limitada;
- erro e retry independentes;
- paginação por cursor.

### 10.3 Painel de auditoria

- título e explicação acessível;
- filtros específicos aprovados;
- tabela com cabeçalho sticky se a altura for limitada;
- erro e retry independentes;
- paginação por cursor.

### 10.4 Estados

- **primeiro loading:** skeleton dentro do painel correspondente;
- **refresh:** linhas permanecem visíveis com `aria-busy` e opacidade reduzida;
- **vazio:** “Nenhum registro encontrado no período selecionado”;
- **erro:** alerta local, mensagem segura e botão “Tentar novamente”;
- **sessão expirada:** fluxo global de refresh/login;
- **sem permissão:** nenhum dado permanece renderizado;
- **cursor encerrado:** botão “Próxima” desabilitado sem request extra.

## 11. Seletores Playwright planejados

| Elemento/estado | `data-testid` |
| --- | --- |
| Página | `observability-audit-page` |
| Filtros comuns | `observability-audit-filters` |
| Atualizar tudo | `observability-audit-refresh-all` |
| Painel técnico | `observability-records-panel` |
| Tabela técnica | `observability-records-table` |
| Loading técnico | `observability-records-loading` |
| Vazio técnico | `observability-records-empty` |
| Erro técnico | `observability-records-error` |
| Painel de auditoria | `audit-records-panel` |
| Tabela de auditoria | `audit-records-table` |
| Loading de auditoria | `audit-records-loading` |
| Vazio de auditoria | `audit-records-empty` |
| Erro de auditoria | `audit-records-error` |
| Paginação técnica | `observability-records-pagination` |
| Paginação de auditoria | `audit-records-pagination` |
| Link do rodapé | `footer-observability-audit-link` |

Linhas repetidas usam `eventId` somente quando o teste precisa endereçar uma
linha específica, por exemplo `audit-record-row-<eventId>`. Não usar índice,
timestamp ou texto traduzido como seletor.

## 12. Testes obrigatórios

### 12.1 Unitários em `e2e/unit/observability-audit.utils.spec.ts`

- query builder inclui `from`, `to`, `limit` e filtros aprovados;
- filtros vazios não são enviados;
- cursor só é enviado quando existe;
- datas são convertidas para ISO-8601 UTC sem deslocamento acidental;
- intervalo inválido ou acima do limite é rejeitado antes da request;
- duração, data/hora e placeholders são formatados corretamente;
- cada enum conhecido recebe rótulo;
- valor de enum futuro recebe fallback seguro e não quebra a tela;
- formatter não inclui objeto bruto, metadata ou campo sensível.

### 12.2 Fluxo E2E em `e2e/flows/observability-audit.spec.ts`

- administrador vê o link no rodapé;
- o link não aparece no sidebar nem no dashboard;
- o link abre a rota correta;
- as duas tabelas aparecem na mesma página;
- as duas requests usam método, endpoint, período, filtros, limit e cursor
  corretos;
- loading, vazio, sucesso e erro independente são visíveis;
- erro em observabilidade não apaga auditoria e vice-versa;
- “Tentar novamente” repete somente a consulta do painel com erro;
- troca de filtro aborta/ignora resposta antiga;
- “Próxima” envia o cursor opaco e “Anterior” usa o histórico local;
- filtro novo reinicia o cursor;
- em viewport de 390 × 844 cada tabela rola dentro do próprio contêiner e a
  página não rola horizontalmente;
- nenhum botão de editar, excluir ou limpar registros é oferecido.

Os dados de UI podem ser interceptados no navegador para cobrir de forma
determinística loading/vazio/erro sem depender de registros compartilhados. Um
smoke test separado deve usar a API local real para provar que o DTO publicado
é consumível pelo administrador.

### 12.3 Autorização

- usuário anônimo é enviado ao login;
- coordenador não vê o link e não abre a rota;
- administrador abre a rota;
- teste de integração do backend prova `401/403` e acesso administrativo nos
  dois endpoints.

Se a suíte frontend não possuir fixture de coordenador, criá-la pela API de
teste e removê-la no `finally`/`afterAll`, sem adicionar credencial fixa ao
repositório.

## 13. Documentação a atualizar durante a implementação

- criar `docs/observability-audit.md` com o fluxo final e os contratos;
- atualizar `docs/authentication.md` com a nova rota exclusiva de admin e seu
  acesso discreto pelo rodapé;
- atualizar `docs/api_integration.md` com endpoints, filtros e cursor;
- atualizar `docs/components.md` somente se surgir um componente tabular
  realmente compartilhado;
- manter o plano do backend sincronizado, registrando que D-008 escolheu API
  administrativa somente leitura para admin.

## 14. Fases de implementação

### Fase 0 — Fechar contrato com o backend

1. Resolver FE-BE-001 a FE-BE-010.
2. Atualizar D-008 e access patterns no plano do backend.
3. Publicar DTOs de query/resposta e exemplos reais.
4. Confirmar `401/403`, limites de data, cursor e ordenação.

**Saída:** contrato HTTP estável e testado; nenhum tipo inferido pela UI.

### Fase 1 — Contratos e regras puras

1. Criar `types.ts`, `constants.ts` e `utils.ts`.
2. Espelhar DTOs e enums do backend.
3. Implementar query builders e formatadores.
4. Adicionar testes unitários.

**Saída:** contratos compilando e regras puras cobertas.

### Fase 2 — API e hooks

1. Criar as duas funções `GET` no `api.ts` usando Axios compartilhado.
2. Implementar os dois hooks independentes.
3. Implementar cancelamento, erro, refresh e histórico de cursor.
4. Garantir que nenhum dado vá para Redux/persistência.

**Saída:** consultas independentes, tipadas e sem resposta obsoleta.

### Fase 3 — Interface

1. Criar casca, filtros, paginação e tabelas.
2. Compor a página única com os dois painéis empilhados.
3. Cobrir loading, vazio, sucesso, erro e refresh.
4. Verificar mobile, teclado, leitores de tela e test IDs.

**Saída:** página funcional e responsiva, ainda não descoberta pela navegação.

### Fase 4 — Rota e acesso discreto

1. Registrar a rota dentro do guard exclusivo de admin.
2. Adicionar o link no rodapé somente para `isAdmin`.
3. Não alterar sidebar, dashboard nem `adminAccess.ts`.
4. Adicionar testes de descoberta e acesso por papel.

**Saída:** administrador acessa pelo rodapé; demais papéis não descobrem nem
abrem a tela.

### Fase 5 — Integração e documentação

1. Executar smoke test com API local real.
2. Validar correlação por `requestId` entre as duas tabelas.
3. Atualizar a documentação de domínio.
4. Revisar o diff contra vazamento de dados e alterações não relacionadas.

**Saída:** entrega integrada e documentada.

## 15. Verificação

Executar em `clubinhonib-app`:

```bash
NODE_OPTIONS='--max-old-space-size=2048' npm run type-check
NODE_OPTIONS='--max-old-space-size=2048' npm run lint
NODE_OPTIONS='--max-old-space-size=2048' npm run check:test-ids
NODE_OPTIONS='--max-old-space-size=2048' npm run test:unit
NODE_OPTIONS='--max-old-space-size=2048' npm run build
npx playwright test e2e/flows/observability-audit.spec.ts --project=chromium
```

Para o último comando, aplicação e API locais precisam estar ativas. Nenhum
teste deve apontar para produção, DynamoDB real não isolado ou arquivo de log de
outro ambiente.

## 16. Definition of Done

A entrega só está concluída quando:

1. existe uma única rota com as duas tabelas lógicas;
2. a rota e os dois endpoints são exclusivos para admin;
3. o link aparece somente no rodapé e somente para admin;
4. sidebar, dashboard e acesso de coordenador continuam sem o item;
5. contratos espelham DTOs reais, sem `any` ou magic strings;
6. consultas usam Axios compartilhado, cancelamento e cursor opaco;
7. cada tabela trata independentemente loading, vazio, sucesso, erro e retry;
8. nenhuma informação consultada é persistida ou enviada ao console;
9. a tela funciona em mobile e por teclado sem scroll horizontal global;
10. todos os componentes e estados possuem test IDs estáveis;
11. testes unitários, E2E, type-check, lint e build relevantes passam;
12. documentação final e plano do backend estão sincronizados;
13. o diff final contém somente mudanças necessárias para esta feature.

