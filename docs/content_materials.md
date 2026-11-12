# Content & Materials Module

This module manages the educational and spiritual resources distributed to clubs and teachers.

## Estúdio Clubinho

As rotas `/adm/estudio` permitem ao administrador criar, gerar, editar, revisar e publicar pacotes de lições. A listagem envia busca, status, paginação e ordenação ao backend. O detalhe é carregado sem efeitos colaterais no servidor.

A criação exige tema e todas as referências bíblicas. O número da semana é obrigatório no Material Semanal (oito produtos separados) e opcional no Material Especial (três produtos: lição, visuais da história e visuais do versículo). Orientações personalizadas complementam o padrão do Estúdio e não podem substituir os contratos editoriais ou de segurança.

A publicação pede confirmação (é irreversível e dispara o aviso por e-mail) e usa uma mutation única: enquanto a requisição está ativa o botão fica bloqueado, e o aviso de sucesso ou falha é derivado do status da lição. O backend persiste `weekMaterialId`; repetir a publicação de uma lição já publicada devolve o mesmo material em vez de criar outro. Uma lição publicada pode ser arquivada e restaurada, mas não excluída; antes de publicar, um item aprovado pode ser reaberto com uma observação.

As telas de produção e de revisão mantêm um stream SSE autenticado com a API (`view=compact`). O stream atualiza o cache da tela e reconecta automaticamente quando o frontend ou a API reinicia. A solicitação de geração é persistida no MySQL antes da resposta HTTP; a API retoma gerações interrompidas, com no máximo três tentativas por pedido.

Os visuais da história dependem da categoria. No Material Semanal, o administrador informa de 4 a 10 pranchas e a IA gera um kit de recortes (personagens, animais, construções, cenário, céu e natureza, objetos) em fundo branco, com legendas aplicadas no PDF. No Material Especial, a IA divide a narrativa completa do tópico `LIÇÃO BÍBLICA` em 4 a 10 trechos literais e gera um cartaz por trecho. A revisão usa um carrossel responsivo, com navegação anterior/próxima, indicadores e identificação de cada peça. A tela ocupa 98% da largura no mobile e 95% a partir do desktop.

A primeira arte gerada (a prancha de personagens, no kit de recortes) funciona como referência de identidade visual. As seguintes recebem a mesma referência para preservar personagens, roupas, estilo, paleta e ambientes; o carrossel identifica qual imagem ancora a sequência.

Na etapa `3. Brincadeira`, cada passo da atividade (no máximo oito) gera exatamente um visual instrucional correspondente. A imagem deve demonstrar como executar aquele passo, usando o contexto completo da brincadeira, e a instrução literal aparece abaixo da arte no carrossel `Como brincar — passo a passo visual`. A primeira imagem também ancora a identidade visual das seguintes. Uma ação junto ao carrossel abre o preview responsivo do PDF em um diálogo e permite baixá-lo; cada página visual do PDF identifica o passo e imprime sua instrução acima da imagem.

Enquanto qualquer etapa estiver com geração de IA em andamento, as ações que alteram a lição (gerar, salvar, concluir, aprovar, devolver, excluir) ficam desabilitadas; navegação entre etapas, leitura e prévias continuam disponíveis, e a tela mostra o tempo decorrido. O backend aplica o mesmo bloqueio. Os controles são liberados assim que a geração termina ou falha.

Na etapa `4. Visuais do versículo`, cada imagem já é gerada pronta seguindo a referência visual de `lições/Semana 7/versciculo`: o trecho aparece dentro da própria arte em tipografia infantil extragrande, arredondada, multicolorida, com contorno branco e sombra, ocupando aproximadamente 95% da composição. Não existe texto HTML nem composição posterior sobre a imagem. Não entram personagens, animais, cenas ou objetos reconhecíveis; os detalhes ficam pequenos e restritos às extremidades. A revisão usa um carrossel responsivo com contador, setas, indicadores e a imagem final da referência como último slide.

## 📁 Key Files

- **Features**:
  - `src/features/week-materials/`: Weekly lesson plans and activities.
  - `src/features/ideas-pages/`: Activity idea pages, organized in sections.
  - `src/features/meditations/`: Devotional content.
  - `src/features/informatives/`: Announcements and newsletters.
  - `src/features/documents/`: General repository for PDF guides and manuals.

## 🗂️ Week Materials Feature

`src/features/week-materials/` owns every week material screen and contract:

```text
src/features/week-materials/
├── api.ts                      # /week-material-pages calls
├── types.ts                    # request and response contracts
├── constants.ts                # endpoint, debounce, media tabs, editor config
├── utils.ts                    # pure helpers, including the multipart payload
├── hooks.ts                    # useWeekMaterials, useWeekMaterialPage, useWeekMaterialForm
├── WeekMaterialManager.tsx     # admin list (route /adm/paginas-materiais-semanais)
├── WeekMaterialPageForm.tsx    # admin create/edit form
├── components/
│   ├── WeekMaterialCard.tsx
│   ├── WeekMaterialDetailsModal.tsx
│   └── SetCurrentWeekConfirmDialog.tsx
└── index.ts                    # public API of the feature
```

Consumers outside the feature import from `@/features/week-materials`:
`WeekMaterialsPageView` (public page), `SpecialFamilyDayPage`, and the teacher
area list.

### Contracts and state ownership

- `WeekMaterialResponse` mirrors the API response and is the only page type used
  across the app; `store/slices/week-material` stores the page selected for
  editing and nothing else.
- Create and update send `multipart/form-data`: a `weekMaterialsPageData` JSON
  field plus one part per uploaded file, named `<mediaType>_<index>.<ext>` and
  referenced by the item's `fieldKey`.
- An existing uploaded item keeps its stored file whenever the admin does not
  choose a new one — no `fieldKey` is sent and the API preserves the S3 object.
- Publishing the week material is exclusive to
  `POST /week-material-pages/current-week/:id`; creating a page never publishes it.

See the API contract in `clubinhonib-api/docs/api-week-materials.md`.

## 💡 Ideas Pages Feature

Teacher shared ideas use a separate `features/ideas-sections` form. It accepts
documents and images as uploads only, videos as MP4/WEBM uploads or validated
YouTube links, and creates media titles on the API. The generic `MediaEditor`
continues serving admin idea pages and weekly materials.

`src/features/ideas-pages/` owns every ideas page screen and contract:

```text
src/features/ideas-pages/
├── api.ts                      # /ideas-pages calls
├── types.ts                    # request and response contracts
├── constants.ts                # endpoint, payload field, media tabs, routes
├── utils.ts                    # pure helpers, including the multipart payload
├── hooks.ts                    # useIdeasPages, useIdeasPageForm
├── IdeasManager.tsx            # admin list (route /adm/paginas-ideias)
├── IdeasPageForm.tsx           # admin create/edit form
├── components/
│   ├── IdeasSectionFields.tsx  # title, description and the media tabs
│   ├── IdeasSectionEditor.tsx  # a section of the page, with visibility
│   ├── IdeasPageCard.tsx
│   ├── IdeasPageDetailsModal.tsx
│   └── IdeasToolbar.tsx
└── index.ts                    # public API of the feature
```

`IdeasSectionFields` is also used by the shared-idea screens in
`components/Adm/PageCreator/Templates/IdeasSectionEditor/`.

### Contracts and state ownership

- `IdeasPageResponse` mirrors the API response; `store/slices/ideas` keeps the
  page selected for editing (`ideasData`) and the draft of a shared idea
  (`ideasSectionData`), which is a different shape.
- Create and update send `multipart/form-data`: an `ideasMaterialsPageData` JSON
  field plus one part per uploaded file, named
  `<mediaType>_<sectionIndex>_<mediaIndex>.<ext>` and referenced by the item's
  `fieldKey`. Both indexes are needed: two sections can have a file in the same
  position.
- An existing uploaded item keeps its stored file whenever the admin does not
  choose a new one — no `fieldKey` is sent and the API preserves the S3 object.
- Media belongs to the section (`IdeasSection`), never to the page.
- The section's `public` flag is preserved when the payload omits it: publishing
  a section is a decision of the shared-ideas screens, not a side effect of
  saving the page.

### Public ideas page

`src/pages/PageView/IdeasMaterialViewpage/` renders the page a teacher opens
from a shared link (`/galeria_ideias_...`), mounted by `PageRenderer`:

```text
IdeasMaterialViewpage/
├── IdeasPageView.tsx        # header, sections and the state of the open gallery
├── MediaSection.tsx         # one section: title, description, one row per media type
├── IdeasGalleryDialog.tsx   # the gallery of a media type, mounted once by the page
├── IdeasVideoPlayerView.tsx # players and previews of a single item
├── IdeasImageGalleryView.tsx
├── IdeasDocumentViewer.tsx
├── DownloadButton.tsx
├── constants.tsx            # label, icon and colour of each media type
└── utils.ts                 # grouping by type and the "N seções · N materiais" summary
```

- Mobile first: the header states what the page holds, sections are a single
  column up to `md`, and the gallery is full screen on the phone.
- The media type is the `MediaType` enum, never the strings `'videos'`,
  `'documents'` or `'images'` compared by hand.
- One gallery dialog for the whole page. It used to be one dialog per media type
  per section, all `keepMounted` — nine live dialogs on a three-section page.
- Admin actions (edit, delete) live in the header, not in floating buttons over
  the content, and editing carries the page id in the route.

## 📚 Features

- **Weekly Material Distribution**:
  - Automated release of curriculum materials based on the current week.
  - Support for multiple formats: Text, PDF, Video links.
- **Devotionals**: Daily or weekly meditation content for spiritual growth.
- **Document Repository**: Centralized access to administrative forms, rulebooks, and training guides.
- **Announcements**: System-wide informatives to keep all volunteers aligned.

## Estúdio: editor da meditação dos menores

The isolated core `src/features/ai-lessons/younger-meditation-editor/` owns
its component, props, layout constants and AST adapters. It has no dependency
on `LibreOfficeDocEditor` or its extensions/styles. Only `MEDITATION_YOUNGER`
uses `YoungerMeditationEditor`: one A4 sheet with
two synchronized copies, the meditation logo on the left, two activity columns
and a prayer footer. Title, verse, reference, instructions and prayer are edited
in place. Both copies share one canonical Tiptap AST for the existing save and
PDF endpoint; saved image URLs and the internal answers remain in structured data.
Legacy ASTs missing instructions recover them from that structured data.
The review screen uses the same sheet in read-only mode. On narrow screens,
the paper scrolls inside its container. `MEDITATION_OLDER` uses its isolated `older-meditation-editor/` core with one
full A4 page and three challenges. Both cores share only meditation AST helpers,
and both omit the separate activity illustrations gallery. Other stages continue
using `LibreOfficeDocEditor`.

O PDF reserva meia página por cópia e ajusta texto e desenhos a esse espaço.
Quando o conteúdo não cabe, a exportação responde 422 em vez de cortar o texto;
o editor avisa do excesso e bloqueia a conclusão do item.

Meditation prompts target ages 4–7 and 8–11. Activities follow the approved
lesson theme and form a narrative, comprehension and application sequence.
Younger worksheets combine visual recognition, counting, sequencing, tracing
and simple puzzles; older worksheets use crossword clues, codes, word searches,
choices and brief writing. Free coloring is exceptional; selecting a correct
answer by painting remains a recognition task. Images contain complete puzzles
and may include necessary labels, without revealing internal teacher answers.

The two meditation cores expose a shared, meditation-only formatting toolbar
above the paper. Selecting a field activates its rich text editor: undo/redo,
the same controls and appearance as stages 1–5, including font and size,
bold/italic/underline/strike, subscript/superscript, color/highlight, headings,
alignment, lists, quotes, separators, tables, links, spacing, find/replace and
fullscreen. Mobile screens expose the complete toolbar through “Mais ferramentas”.
Inline marks, tables and paragraph attributes are saved in the canonical AST
and mirrored between the younger copies. Reviewing hides the toolbar and
disables editing. The native meditation export preserves these saved styles.

Older activity panels place substantial instructions beside functional artwork
when present. Images can reach 230px high; row proportions follow instruction
length and visual requirements rather than reserving three equal empty bands.

Both meditation sheets are centered horizontally inside their paper container
when space is available. Narrow viewports retain horizontal scrolling with the
left edge reachable; toolbar positioning and printed page geometry are unchanged.

## Meditação dos maiores: edição e PDF

A etapa 7 mantém três desafios com mecânicas variadas e progressão de narrativa,
compreensão e aplicação. Novas gerações têm elementos estruturados e revisão de
conteúdo e das imagens reais. Não há mínimo de palavras para preencher espaço.

O editor e o PDF usam os campos salvos, incluindo formatação manual. O editor
mantém fonte legível, blocos com altura natural e grades textuais editáveis com
fonte monoespaçada. Um aviso aparece quando o conteúdo ultrapassa a folha. A
exportação rejeita conteúdo que não caiba legivelmente em vez de cortá-lo.
Revisão humana permanece necessária; documentos antigos continuam disponíveis
sem alteração automática de seus textos ou imagens.

A Meditação dos maiores gera sempre três imagens, uma por questão, como anexo ou apoio visual. O editor mantém o vínculo por ID 1/2/3 durante alterações textuais; a exportação imprime a imagem correspondente ao lado de cada bloco. Questões textuais também recebem apoio visual.

Na revisão final, pacotes PACKAGE_READY exibem “Iniciar revisão”. A ação chama o endpoint existente de submissão, que valida o pacote e muda os itens para IN_REVIEW; a atualização dos dados habilita aprovação e solicitação de ajustes. A tela apresenta erros dessas ações junto aos controles. Abrir a página não aprova nem altera a lição automaticamente.

The manual-work producer and reviewer use the same `ManualWorkPreview`, sourced from the current version's `printableAssets`, verse text and verse reference. Both display two vertically stacked copies, each with a black outer frame, matching the PDF composition; missing artwork produces an explicit empty state. Previewing never regenerates or recolors the approved artwork.

## Estúdio: revisão, aprovação e publicação

**Marcas técnicas.** A descrição salva de um material pode conter
`[tipo:especial]` (o Material Especial é um material semanal com título e
descrição próprios; a marca alimenta o selo) e, em páginas antigas,
`[origem:licao:<uuid>]`. `cleanMaterialDescription`
(`features/week-materials/utils.ts`) remove as duas e é usada em toda exibição:
página pública, modal de detalhes, card da listagem, lista da Área do Professor
(texto e busca) e valor inicial do formulário. Ao salvar, o formulário regrava
apenas `[tipo:especial]`, conforme o tipo escolhido.

**Regra de invalidação.** Itens `APPROVED`, `IN_REVIEW` ou `CHANGES_REQUESTED`
nunca ficam desatualizados. Com o pacote em ciclo de revisão (qualquer item
nesses status), salvar ou regerar um item não altera os demais; os diálogos
dizem isso. Na produção inicial a regra antiga continua. Item aprovado ou com o
revisor não pode ser regerado: o botão fica desabilitado com o motivo (reabrir
ou devolver primeiro). A lógica espelhada fica em
`features/ai-lessons/workflow.ts` (`isReviewCycleActive`, `stagesInvalidatedBy`,
`regenerationLockReason`).

**Tela de revisão.** Após aprovar, a tela seleciona o próximo item `IN_REVIEW`
(`nextPendingReviewStage`) e anuncia; sem pendentes, destaca a chamada para
publicar. Durante a aprovação o botão mostra "Gerando o PDF e aprovando…"; a
falha de PDF aparece junto aos botões com atalho para a prévia. Quando um item
anterior tem versão mais nova que o item em revisão, um aviso informativo nomeia
esse item. Com todos os itens aprovados há "Baixar pacote completo (PDF)".

**Publicação.** O diálogo de confirmação (`LessonPublishConfirmDialog`) mostra o
título final, o número de PDFs, o tipo (Material Especial ou material semanal) e
um aviso não bloqueante com os materiais já existentes para a mesma semana ou
título. Se a prévia falhar, publicar continua possível. Depois de publicada,
`LessonPublishedPanel` oferece "Ver material" (rota real da página), "Definir
como semana atual" (com confirmação; oculto quando já é a atual) e "Abrir
Materiais Semanais". Se a página foi removida, o painel avisa e oferece
"Publicar novamente". As regras ficam em `features/ai-lessons/publication.ts`;
testes em `e2e/unit/lesson-publication.spec.ts`.

## Estúdio: integridade de edição, revisão e transporte

**Rascunhos.** A produção mantém um rascunho por lição e etapa. Trocar de etapa
preserva todos. O rascunho captura o `lockVersion` original na primeira edição;
SSE e refetch só atualizam a versão remota, e o salvamento usa o lock capturado.
Os rascunhos do editor, as observações do revisor e os rascunhos de orientações
são gravados em `sessionStorage`, com chave por usuário e lição, e recuperados
após recarregar a página ou refazer o login (a tela mostra o aviso "Rascunho
recuperado"). Logout explícito apaga os rascunhos; o login de outro usuário
apaga os alheios. Edições pendentes são protegidas nos botões da página, na
navegação administrativa, no voltar/avançar do navegador e ao recarregar.

**Conflito de edição.** Quando a versão remota muda sob um rascunho, um aviso
aparece de imediato com "Ver versão remota" e "Reaplicar minha edição sobre a
versão atual". Um 409 no salvamento preserva o rascunho. Não há nova tentativa
automática. Digitar durante um salvamento continua possível: só o rascunho
enviado é limpo.

**Confirmações.** Salvar lista os itens que ficarão desatualizados e pede
confirmação. Regerar com IA pede confirmação, com aviso reforçado quando o item
já foi concluído ou aprovado. Concluir um item desatualizado pede confirmação
explícita. Publicar e excluir também pedem confirmação; erros aparecem dentro do
próprio diálogo. A etapa selecionada fica na URL (`?stage=`).

**Revisão.** A tela guarda, por etapa, a versão que o revisor abriu. Se ela
mudar durante a leitura, aparece um aviso e Aprovar, Devolver e Reabrir ficam
bloqueados até o revisor confirmar que revisou a versão atual. As ações enviam
o `lockVersion` reconhecido. Um 409 preserva a observação digitada. A aprovação
é bloqueada quando falta arte obrigatória ou alguma imagem não carrega, e o
motivo aparece junto aos botões. Produção e revisão compartilham
`LessonStageContentViewer` para todas as etapas, e a revisão oferece a prévia de
PDF de cada item. A publicação invalida `['week-material-pages']` e
`['week-materials']`.

**Listas e cache.** A fila de revisão envia `statuses` separados por vírgula;
busca, contagem e paginação são do servidor. Listas, detalhe, painel e
orientações têm chaves de cache separadas. Troca de sessão e logout cancelam e
removem os caches `['ai-lessons']` e `['ai-providers']`; as orientações são
chaveadas pelo usuário autenticado.

**Orientações (prompts).** A edição parte somente de `customPrompt`; o
prompt-base é somente leitura. A prévia usa o `effectivePrompt` devolvido pela
API e, para texto ainda não salvo, compõe com o mesmo cabeçalho do backend.
Salvar e restaurar enviam `lockVersion`. Após um conflito, a tela oferece
aplicar o texto sobre a versão atual ou descartar.

**Provedores.** As respostas expõem `hasApiKey`, nunca a chave. Os controles de
credencial oferecem preservar (omitir `apiKey`), substituir e remover (`apiKey`
vazio, por controle próprio). As opções de qualidade, esforço e tamanho são
exatamente as aceitas pela API, e retries vão de 0 a 5. Um selo permanente
indica a origem do catálogo de modelos (`LIVE` ou `FALLBACK`, para OpenAI e
Gemini), e o modelo "em uso" vem das configurações salvas. O catálogo ao vivo
usa a chave salva e, quando falha, o aviso diz o motivo (chave recusada, sem
permissão, ilegível ou provedor indisponível). Salvar é bloqueado quando o
provedor ativo não tem chave utilizável. "Alterações pendentes" compara o
formulário com o que está salvo e "Descartar" volta ao salvo. Os perfis de
custo ("Testes (econômico)" e "Produção (qualidade)", em
`AI_PROVIDER_PROFILES`) preenchem modelos e parâmetros da OpenAI e do Gemini de
uma vez, sem trocar o provedor ativo nem as chaves; qualquer ajuste manual
depois disso vira "Personalizado". O perfil só vale após salvar. Um aviso lista
os modelos selecionados que o catálogo ao vivo não devolveu para a chave salva.
O nível de raciocínio fica desabilitado, com explicação, quando o modelo de
texto escolhido não o usa.

**Stream.** O SSE usa o cliente Axios autenticado. O fechamento planejado do
servidor (após ao menos um evento) é tratado como rotação, sem aviso. O aviso
"Conexão interrompida" só aparece após três falhas seguidas; a reconexão usa
backoff exponencial com jitter, limitado a 30 s. A conexão pausa com a aba
oculta e a tela refaz a consulta ao voltar. Lição excluída em outra sessão tem
estado próprio, com mensagem e botão de voltar. O limite de bytes por conexão
só corta em fronteira de mensagem e depois de um snapshot. Snapshots idênticos
são deduplicados e regressões de `lockVersion` são ignoradas.

**Prévia de PDF.** Cada pedido é vinculado a lição, etapa, `lockVersion` e
`versionId`. Fechar o diálogo, trocar de etapa, receber versão mais nova ou
desmontar a tela invalida respostas tardias; as object URLs são revogadas. A
prévia é reaproveitada enquanto a versão não muda.

**Testes.** A cobertura de regressão está em `e2e/unit/studio-*.spec.ts`
(incluindo `studio-recovery.spec.ts`), `e2e/flows/studio-integrity.spec.ts`,
`e2e/flows/studio-resilience.spec.ts` e nos testes de provedores e editores. Os
fluxos de integração criam fixtures pela API local;
`e2e/support/studioFixture.mjs` apenas prepara os status dessas fixtures no
MySQL local, recusando bancos remotos e lições que não sejam suas.

### Administrative review of shared ideas

`/adm/editar-ideias-compartilhadas/:id` now compares the immutable original with the current AI result. The 95% desktop / 98% mobile layout places comparison and the publication panel alongside one another on desktop. Text has word differences; documents have PDF previews and editable DOCX downloads; images have a keyboard-accessible before/after slider. Skipped and rejected materials explain why the original is retained.

The admin can choose each version, apply all approved improvements, keep all originals, or request another attempt. Attempts always start from the snapshot, are limited to three, and retain history. New results reset the confirmation required before publication. Removing a material from the publication does not restore it through an AI choice or delete its source. An already published idea exposes its current publication and historical choices.

Polling runs every five seconds while an attempt is active, stops on terminal states/unmount, and retains the previous comparison during retry/failure. An active attempt triggers explicit confirmation before publishing the complete original; that action invalidates late results. The existing moderation flag protects the routes. The automatic-AI flag controls teacher auto-enqueue only: admin comparison and manual retry remain available when it is off.

## Painel do Estúdio (`/adm/estudio`) — revisão de 2026-11-11

O painel deixou de ser uma vitrine e virou uma **fila de trabalho**.

- **Cabeçalho enxuto**: título, "N lições no estúdio · M em andamento" e os três
  atalhos (Produzir lição, Revisão, Orientações).
- **Números clicáveis**: Ajustes solicitados, Em produção, Aguardando revisão,
  Prontas para publicar e Publicadas. Cada um abre a lista que conta; quando o
  número é de um status só, a lista abre já filtrada (`?status=PUBLISHED`, lido
  por `parseListStatus` em `AiLessonsListPage` e `AiLessonsReviewListPage`).
  "Ajustes solicitados" só se destaca quando é maior que zero.
- **Fila de trabalho**: as lições em andamento (`dashboard.active`), ordenadas
  por urgência — ajuste pedido pelo revisor, geração que falhou, pronta para
  publicar, aguardando revisão, em produção, não iniciada. Cada linha mostra o
  motivo, a semana, há quanto tempo foi mexida, as etapas como uma barra de
  segmentos (aprovada, concluída, em produção, com problema, desatualizada, não
  iniciada) e um botão com o próximo passo, que abre a lição direto na etapa
  certa (`?stage=`): "Continuar: 3. Brincadeira", "Tentar de novo: 2. Visuais
  da história", "Revisar: …", "Publicar".
- **Publicadas recentemente** na lateral, e o **fluxo editorial** (os 8 itens +
  material semanal e o padrão do estúdio) recolhido em uma seção que abre sob
  demanda — é referência, não trabalho pendente.
- Carregamento com esqueleto no lugar do círculo girando.

Arquivos: `pages/admin/ai-lessons/AiLessonsHubPage.tsx`,
`features/ai-lessons/hub.utils.ts` (regras puras), `hub.constants.ts`,
`components/hub/*`. Testes: `e2e/unit/ai-lessons.hub.spec.ts` (regras) e
`e2e/flows/ai-lessons-hub-mobile.spec.ts` (tela contra a API real, de 320 a
1440 px; não cria lições, porque criar dispara geração por IA).

## Orientações de criação (`/adm/estudio/orientacoes`) — revisão de 2026-11-11

As orientações são **pessoais**: a API as guarda por administrador, por tipo de
material e por etapa (`admin_lesson_prompts`), e aplica as de quem dispara a
geração. A tela agora diz isso no topo, com o nome de quem está logado.

- **Aviso pessoal** (`admin-prompts-personal-notice`): "Estas orientações são
  só suas" — valem para as próximas gerações de quem está logado; outros
  administradores têm as próprias, e lições já geradas não mudam.
- **Edição primeiro**: o campo de texto vem logo abaixo do título da etapa, com
  um exemplo próprio de cada etapa no campo vazio (`PROMPT_STAGE_EXAMPLES`). As
  regras oficiais e a prévia do que a IA recebe ficam depois, recolhidas
  (`PromptReference`).
- **Linguagem simples**: "Regras oficiais desta etapa (não editáveis)" e "Como
  a IA vai receber", no lugar de "prompt-base" e "prompt efetivo composto".
- **Resumo**: "N etapas personalizadas de M" sob as abas, e a quantidade de
  cada tipo de material no seletor. Cada aba tem um ponto: laranja para texto
  não salvo, azul para etapa personalizada.
- **Quando foi salva**: "salva em 11/11/2026 às 12:30" (`updatedAt`, novo no
  contrato de `GET /prompt-preferences/me`).
- **Apagar o texto = voltar ao padrão**: com o campo vazio numa etapa
  personalizada, o botão principal vira "Remover minha orientação". Antes a
  tela travava o salvar por causa do mínimo de 10 caracteres.
- **Ctrl+S** salva a etapa aberta; no celular o botão de salvar acompanha a
  rolagem enquanto há texto não salvo.
- A página foi dividida: `components/prompts/PromptStageTabs`,
  `PromptReference`, `PromptResetDialog`, e as regras puras em
  `prompt.utils.ts`.

Testes: `e2e/unit/ai-lessons.prompts.spec.ts` (regras) e
`e2e/flows/studio-guidelines.spec.ts` (tela contra a API real, incluindo que a
orientação de um administrador não aparece para outro usuário). Salvar uma
orientação não dispara geração por IA.

## Revisão e aprovação (`/adm/estudio/revisao`) — revisão de 2026-11-11

### Fila (`AiLessonsReviewListPage`)

- **Recortes com contagem** no lugar do filtro de status: Para revisar,
  Prontas para publicar, Devolvidas à produção, Publicadas e Todas
  (`REVIEW_QUEUE_VIEWS`). Os dois primeiros ficam em destaque quando têm
  lição. As contagens vêm do painel (`byStatus`). O `?status=` do painel abre o
  recorte correspondente (`reviewViewFromStatus`).
- **Cartão sem repetição**: o título é o tema, a semana virou um selo, e uma
  linha só diz o que falta — "5 de 8 itens aprovados · 2 aguardam sua decisão ·
  1 devolvido" (`reviewProgressText`). Antes a mesma fração aparecia três vezes.
- **Botão que diz o que fazer**: Iniciar revisão, Continuar revisão, Acompanhar
  ajustes, Publicar ou Ver lição publicada (`reviewCardAction`).
- Cada recorte tem o próprio texto de lista vazia.

### Detalhe (`LessonReviewDetailPage`)

- **Cabeçalho em duas colunas**: título à esquerda, ações em uma coluna de
  largura fixa. Antes as ações esticavam e espremiam o título em poucas
  palavras por linha.
- **Sem ação duplicada**: com a lição publicada e o material no ar, "Abrir
  Materiais Semanais" fica só no painel verde; o cabeçalho mantém baixar o
  pacote e arquivar.
- **Abas mais leves**: item aprovado mostra um ícone; os demais estados seguem
  com o selo, e por isso se destacam.
- **Decisão só quando há decisão**: o formulário (ajuste, aprovar, devolver,
  reabrir) aparece enquanto o pacote está no ciclo de revisão
  (`isReviewDecisionOpen`). Publicada, arquivada ou ainda em produção, o cartão
  mostra só o motivo e o histórico de observações.
- **Decisão sempre à mão**: no desktop o cartão acompanha a rolagem; no celular
  há uma barra fixa com "Pedir ajuste" (leva ao campo) e "Aprovar item".
- **Próximo item pendente**: botão com a quantidade de itens que ainda esperam
  decisão (`pendingReviewStages`).
- "Devolver com ajustes" explica que precisa do texto para ser liberado.

Regras puras em `review.utils.ts` e `review.constants.ts`; testes em
`e2e/unit/ai-lessons.review.spec.ts`. Não há fluxo de navegador novo para esta
tela: o banco local não tem lição em revisão, e criar uma dispara geração por
IA.
