# Content & Materials Module

This module manages the educational and spiritual resources distributed to clubs and teachers.

## Estúdio Clubinho

As rotas `/adm/estudio` permitem ao administrador criar, gerar, editar, revisar e publicar pacotes de lições. A listagem envia busca, status, paginação e ordenação ao backend. O detalhe é carregado sem efeitos colaterais no servidor.

A criação exige número da semana, tema e todas as referências bíblicas. O pacote mantém oito produtos separados; orientações personalizadas complementam o padrão do Estúdio e não podem substituir os contratos editoriais ou de segurança.

A publicação usa uma mutation única: enquanto a requisição está ativa o botão fica bloqueado, sucesso e falha aparecem na própria tela e o cache do detalhe/listagem é atualizado. O backend persiste `weekMaterialId`; repetir a publicação de uma lição já publicada devolve o mesmo material em vez de criar outro.

Durante uma geração, o detalhe mantém um stream SSE autenticado com a API. O stream atualiza o cache da tela e reconecta automaticamente quando o frontend ou a API reinicia. A solicitação de geração é persistida no MySQL antes da resposta HTTP; ao iniciar, a API retoma jobs que ainda estejam em `GENERATING`, evitando etapas órfãs.

Os visuais da história são gerados exclusivamente a partir do texto completo do tópico `LIÇÃO BÍBLICA` da versão atual. O administrador informa em um campo numérico uma quantidade inteira de 4 a 10 imagens, e a LLM decide a quebra integral da narrativa nessa quantidade, sem omitir, repetir ou reescrever trechos. A revisão usa um carrossel responsivo, com navegação anterior/próxima, indicadores, identificação da cena e o trecho de origem. A tela ocupa 98% da largura no mobile e 95% a partir do desktop.

A primeira cena funciona como referência-mãe de identidade visual. Todas as cenas posteriores recebem a mesma referência para preservar personagens, roupas, estilo, paleta, iluminação e ambientes; o carrossel identifica qual imagem ancora a sequência.

Na etapa `3. Brincadeira`, cada passo da atividade gera exatamente um visual instrucional correspondente. A imagem deve demonstrar como executar aquele passo, usando o contexto completo da brincadeira, e a instrução literal aparece abaixo da arte no carrossel `Como brincar — passo a passo visual`. A primeira imagem também ancora a identidade visual das seguintes. Uma ação junto ao carrossel abre o preview responsivo do PDF em um diálogo e permite baixá-lo; cada página visual do PDF identifica o passo e imprime sua instrução acima da imagem.

Enquanto qualquer etapa estiver com geração de IA em andamento, a tela de detalhes entra em estado ocupado e todos os botões e controles de formulário ficam temporariamente desabilitados. A consulta automática continua ativa e libera os controles assim que a geração termina ou falha, evitando gerações, salvamentos, aprovações ou exclusões concorrentes.

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

The PDF reserves a fixed half-page height per copy and fits text and drawings
to that space, preventing the second copy from moving to a second page.

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
