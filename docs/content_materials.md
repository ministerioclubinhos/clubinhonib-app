# Content & Materials Module

This module manages the educational and spiritual resources distributed to clubs and teachers.

## Estúdio Clubinho

As rotas `/adm/estudio` permitem ao administrador criar, gerar, editar, revisar e publicar pacotes de lições. A listagem envia busca, status, paginação e ordenação ao backend. O detalhe é carregado sem efeitos colaterais no servidor.

A publicação usa uma mutation única: enquanto a requisição está ativa o botão fica bloqueado, sucesso e falha aparecem na própria tela e o cache do detalhe/listagem é atualizado. O backend persiste `weekMaterialId`; repetir a publicação de uma lição já publicada devolve o mesmo material em vez de criar outro.

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
