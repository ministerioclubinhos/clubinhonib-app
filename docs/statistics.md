# Statistics & Reporting Module

The Statistics module provides data visualization and reporting tools to help leaders make informed decisions.

## 📁 Key Files

- **Features**:
  - `src/features/statistics/`: Logic for data aggregation and chart generation.

## 📊 Features

- **Attendance Charts**: Visualizing attendance trends over time / by club.
- **Growth Metrics**: Tracking new member registrations and retention rates.
- **Spiritual Impact**: Reporting on decisions for Christ and other spiritual milestones.
- **Custom Reports**: Generating downloadable reports for board meetings or reviews.

## 🔌 Um payload por endpoint

O painel guarda **um** conjunto de filtros e alimenta cinco endpoints com DTOs
diferentes; cada listagem ainda junta os filtros locais dela. Mandar esse
amontoado inteiro para todos derrubava quase todas as abas: a validação global
da API roda com `forbidNonWhitelisted`, então uma chave a mais transforma a
requisição em `400`.

| Endpoint | Recusava |
| --- | --- |
| `/statistics/children`, `/clubs`, `/teachers` | `groupBy`, `week` |
| `/statistics/clubs` | também `search`, `teacherId` |
| `/statistics/pagelas/charts`, `/insights` | `search`, `page`, `limit`, `sortBy`, `sortOrder` |
| `/statistics/accepted-christs/charts` | `week`, `teacherId`, e a paginação |

`utils/queryPayload.ts` é agora o único lugar que decide o que cada endpoint
recebe — uma lista explícita por contrato, no mesmo desenho de
`features/clubs/utils.ts`. Os hooks passam por ele **sempre**, então nenhuma
tela consegue contornar: uma chave nova no contexto ou entra numa das listas ou
não é enviada. `e2e/unit/statistics.queryPayload.spec.ts` tranca o conjunto
exato de chaves de cada um, e `e2e/flows/statistics.spec.ts` percorre as onze
abas afirmando que nenhuma resposta de `/statistics` volta com erro.

## ♻️ Cache e frescura

- As consultas usavam `staleTime: 0` com o comentário "força refetch ao trocar
  de filtro". Não é o que `staleTime` faz: o filtro já está na chave. O efeito
  real era refazer agregações caras a cada montagem — e as abas são
  `React.lazy` dentro de um `AnimatePresence`, ou seja, **remontam a cada
  troca**. Agora são `STATISTICS_STALE_TIME_MS` (5 min) para agregados e
  `STATISTICS_LIST_STALE_TIME_MS` (2 min) para listagens.
- A chave de cache carrega o payload **já filtrado**, não o amontoado da tela:
  dois recortes que produzem a mesma requisição compartilham a resposta.
- "Atualizar" invalida `[STATISTICS_QUERY_KEY]`, e não o cache inteiro. O
  `queryClient` é o compartilhado do app — sem a chave, o botão derrubava
  também o controle de clubinhos, as pagelas e o resumo semanal.
- O rodapé mostra `dataUpdatedAt` da consulta, não `dayjs()`. Antes imprimia a
  hora do render: com cache de minutos, a tela afirmava que o número era deste
  segundo.

## 🗓️ Ano letivo, não ano de calendário

O seletor de ano montava `[anoAtual, anoAtual-1, anoAtual-2]`. Todo o domínio é
indexado pelo **período letivo cadastrado**: dava para escolher um ano sem
período e receber um painel vazio sem explicação, e um período fora daquela
janela ficava inalcançável. `useAcademicYears()` lê `/club-control/periods`.

## 🔒 O que o navegador guarda

Só preferência de apresentação: os recortes de filtro salvos e o modo de
visualização. `search` fica **fora** do que é persistido — é o único campo que
pode carregar o nome de uma criança. A leitura estreita o `unknown` campo a
campo; antes era `JSON.parse` lido como `any`.

Os "Filtros Salvos" guardam os **valores**, não só um rótulo: a lista era de
`string`, então mesmo que algo a preenchesse, clicar num item não teria o que
reaplicar — e nada a preenchia, porque `ADD_FAVORITE` nunca era despachado.

## 🎛️ A barra de filtros rege a tela

O recorte vem **antes dos números**. Ele ficava abaixo dos KPIs, e a leitura de
cima para baixo fazia os números parecerem absolutos e o filtro, um detalhe de
uma seção. Primeiro se declara o período; depois se lê o que ele produziu.

Os endpoints por trás das onze abas aceitam conjuntos diferentes de filtro, e a
barra é uma só. `TAB_FILTER_FIELDS` diz o que cada aba usa, e o que ela ignora
aparece **desabilitado com o motivo escrito**. Antes disso o campo ou derrubava
a requisição (`400`) ou — depois do payload por endpoint — simplesmente não
fazia nada, que é pior: pelo menos o erro aparecia.

| Filtro | Onde funciona |
| --- | --- |
| Período (datas) | todas as abas — recorta as pagelas, não o cadastro: o total de linhas das listagens não muda, as métricas de cada linha sim |
| Buscar | Crianças, Professores |
| Gênero, Idade | Visão geral, Crianças, Demográfico, Geográfico, Decisões, Retenção, Atividades, Rankings |
| Agrupar por | só as séries temporais (Visão geral, Decisões, Atividades) |
| Cidade, Estado, Bairro | todas (Bairro não existe no contrato de Professores) |

Conferido chamada a chamada contra a API: cada filtro muda de fato o número que
promete mudar.

## ⚠️ Débito conhecido

- ~67 cores hexadecimais escritas à mão em dez arquivos. Trocar todas por
  valores do tema é um refactor visual amplo, sem cobertura que o proteja;
  fica registrado em vez de feito no meio de uma correção.
- 12 dos 25 componentes de gráfico ainda não têm `aria-label` nem resumo
  textual.
- N+1 em `getClubsWithStats` no back (ver `clubinhonib-api/docs/api-statistics-review.md` §8.2).
