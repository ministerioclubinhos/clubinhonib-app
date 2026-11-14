# UI Components & Design System

`features/ideas-sections/components/share/IdeaShareForm.tsx` is the dedicated
teacher submission flow. It owns the three guided sections, media selection,
YouTube links, removal, upload progress and persisted-success state; it does
not reuse the admin `MediaEditor`.

The application uses a component-based UI architecture built on top of **Material UI (MUI)**.

## 🎨 Design Principles

- **Responsive First**: All components are designed to work seamlessly on mobile and desktop.
- **Accessibility**: We follow WCAG guidelines where possible, leveraging MUI's built-in accessibility features.
- **Theming**: Evaluating global theme customization in `src/styles/`.

## 🧪 Playwright selector contract

Every rendered component exposes a stable, kebab-case `data-testid` on its DOM
root. Loading, empty, error and permission states, dialogs, menus, uploads and
ambiguous or repeated actions receive their own descriptive selectors. A
reusable component can receive a caller-owned `data-testid` when the domain context
or stable API entity ID is required.

Playwright should still prefer accessible locators such as role and label when
they are unique. Test IDs are the stable fallback and the component-boundary
contract. They must never depend on Portuguese display text, MUI/CSS classes,
DOM order, array indexes, random values, timestamps or React-generated IDs.
HTML `id` remains reserved for a unique document identity or accessibility
relationships, because repeated components cannot legally share it.

`npm run check:test-ids` scans every production TSX render root and fails when
a component is created or changed without the selector contract. The command is
also part of `npm run lint`.

## 🧩 Shared Components

Located in `src/components/`, common components include:

- **`NavBar/`**: Responsive navigation bar with distinct views for mobile and desktop.
- **`Footer/`**: Application footer.
- **`Card/`**: Reusable card components for displaying content summaries.
- **`Modal/`**: Standardized modals for forms and confirmations.
  `ToggleActiveConfirmDialog` requires a `subject` (`ToggleActiveSubject`) and
  reads its wording from `TOGGLE_ACTIVE_COPY`. The wording used to be hardcoded
  for a child, so deactivating a **club** asked "Criança não frequenta mais o
  clubinho?" — with the subject declared, the compiler makes any new caller say
  which one it is, and a new subject is a row in that table rather than another
  branch inside the component.
- **`common/`**: primitive UI elements like custom buttons, inputs, or loading spinners.

## 📋 Admin listings

Every `/adm` listing shares one shell, in `src/components/common/listing/`. A new
management screen composes these instead of building its own table, toolbar and
pagination:

| Component | Responsibility |
| --- | --- |
| `ListingLayout` | Header, summary line, toolbar slot, skeletons, empty state, error alert, card grid and pagination. |
| `ListingToolbar` | Debounced search, select filters, refresh and the screen's primary action. On mobile the filters collapse behind a badge; `extraFilters` holds anything that does not fit a select (date ranges, numeric fields). |
| `ListingCard` | One row of the grid: accent stripe, avatar, title, badges, metadata line, footer and actions. |
| `CardActionButton` | An icon action inside a card. It stops the click from reaching the card and always carries an accessible name. |

Rules the shell already enforces, so a screen does not restate them:

- Empty, loading and error are three different states and never overlap — an
  error replaces the empty state instead of appearing beside it.
- Reloading dims the grid rather than clearing it.
- Touch targets in card actions are at least 44 × 44 px on mobile.
- Pagination is server-side; the screen never filters a full list in the browser.

### Form dialogs: never reset while someone is typing

A management screen's form dialog fills its fields from the record in an effect
that runs when the dialog opens. That effect MUST NOT depend on the identity of
a callback the manager recreates on every render.

`InformativeFormDialog`, `DocumentFormDialog` and `FeatureFlagFormDialog` all had
`onDismissError` in the dependency list, and their managers passed an inline
arrow. Any re-render of the manager with the dialog open — the debounced search
settling, the listing reloading — re-ran the effect and wrote the server's values
back over what had already been typed. The person then saved without the field
they had just written, and nothing on screen said so. The e2e specs for
informatives and documents caught it: description and visibility were saved, the
title reverted.

The fix is to keep the callback in a ref, so the effect depends only on the
dialog opening and on the record being edited. A new form dialog MUST follow the
same shape.

The people screens (`/adm/perfis`, `/adm/usuarios`, `/adm/professores`,
`/adm/coordenadores`, `/adm/criancas`) use this shell, except `/adm/perfis`,
which is a directory rather than a CRUD listing and keeps its own photo cards and
birthday band.

## 📅 Agenda pública em cards

O modo de cards de `/eventos` pertence à feature `src/features/events/` e segue
uma hierarquia temporal única:

- eventos de hoje e futuros ficam visíveis em ordem cronológica;
- a grade abre em `Esta semana` e pode ser ampliada para `Este mês` ou `Todos`,
  fazendo uma nova consulta à API a cada troca; semana e mês enviam `from/to`,
  enquanto `Todos` pede a agenda completa;
- o calendário consulta somente o mês visível e pede outro recorte ao servidor
  sempre que a pessoa avança ou volta um mês;
- eventos realizados ficam em uma seção secundária, recolhida inicialmente;
- os selos `Hoje`, `Amanhã`, `Em breve`, `Programado` e `Realizado` usam cores
  semânticas da paleta Material UI;
- mídia ausente ou inválida recebe um placeholder estável, sem quebrar o card;
- detalhes, edição, exclusão e inclusão mantêm nome acessível, `data-testid`
  estável e alvo de toque de pelo menos 44 × 44 px.

## ⚠️ Key Dependencies

- **Material UI**: Core component library.
- **Framer Motion**: Used for complex animations and page transitions.
- **React Icons**: For iconography throughout the app.

## Estúdio de lições

O `LibreOfficeDocEditor` limita a caixa a 65% da altura da tela no celular
e 70% no desktop,
com rolagem interna. A barra de ferramentas permanece no topo da caixa
enquanto o texto rola. O comportamento é compartilhado por todas as etapas
textuais editáveis e pela revisão, no desktop e no celular.
A barra do celular exibe desfazer, negrito, itálico e uma seta para abrir
`Mais ferramentas` (apontando para cima enquanto o menu está aberto),
sem rolagem horizontal. As ferramentas completas ficam em uma grade no
menu, com botões de toque de pelo menos 44 × 44 px. No desktop os controles
continuam visíveis na barra, que ocupa 95% da largura disponível.
A folha mantém a proporção A4 e respeita a largura da caixa.

O painel `/adm/estudio` usa métricas compactas em duas colunas no celular e
quatro no desktop. Produções recentes apresenta até três lições, com título
limitado a duas linhas e referência resumida; `Ver todas` abre a listagem
completa. As caixas de produções, fluxo editorial e padrão do estúdio respeitam
a largura da tela; descrições do fluxo quebram linha para permanecer legíveis.

O editor oferece fonte, tamanho em pontos, espaçamento entre linhas, links,
localizar/substituir, mesclar/dividir células e tela cheia. A contagem de palavras
e caracteres acompanha as alterações. `LessonEditorAdvancedTools` concentra
os diálogos; regras de busca e links ficam em `features/ai-lessons/editor.utils.ts`.
A tela cheia mantém o mesmo documento e histórico de edição.

Fonte/tamanho e espaçamento entre linhas possuem ícones separados, sem texto
visível na barra do desktop e no menu do celular. Tooltips e nomes acessíveis
identificam as opções.

Cor da fonte e destaque oferecem 25 cores prontas, seletor de cor personalizada
e código hexadecimal. A cor é salva no documento e preservada na exportação PDF.

Componentes compartilhados entre produção e revisão, em
`features/ai-lessons/components`: `LessonStageContentViewer` (renderiza qualquer
etapa, com as artes dos itens 2 a 5), `StoryVisualCarousel` (carrossel que
pré-carrega todas as imagens e sinaliza as quebradas), `StoryVisualConfiguration`
(quantidade e confirmação de regeneração dos visuais), `LessonConnectionAlert`
(aviso de conexão, exibido só após falhas seguidas), `LessonCommentsPanel`
(observações, com ação de resolver na produção), `LessonPdfPreviewDialog`
(prévia de PDF) e `StageImpactList` (itens que serão invalidados por uma ação).
Na revisão, `LessonPublishConfirmDialog` confirma a publicação com título final,
tipo e aviso de duplicatas, e `LessonPublishedPanel` mostra o estado da lição
publicada (ver material, definir como semana atual, publicar novamente quando a
página foi removida).
`LessonDraftDialogs` reúne as confirmações de salvar, regerar, descartar e
excluir. Os diálogos têm título associado (`aria-labelledby`), a navegação de
etapas marca a atual (`aria-current`) e a tela cheia das meditações prende o
foco.

Shared-idea presentation components live under `features/ideas-sections/components/share`, `review` and `ai`. `useIdeaShareForm` owns the form state and media lifecycle. Comparison uses dedicated text/document/image components with stable test IDs and accessible version controls; the feature does not add conditional behavior to shared material editors.
