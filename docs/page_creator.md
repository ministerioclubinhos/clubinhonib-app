# Page Creator (Admin) Module

The Page Creator module allows administrators to dynamically create and manage content pages for the application, such as weekly materials, event pages, and special announcements.

## 📁 Key Files

- **Components**:
  - `src/components/Adm/PageCreator/`: Core logic for the page builder.
  - `src/components/Adm/PageCreator/SelectPageTemplate/`: template gallery; each
    entry in `constants.tsx` renders the form of its feature.
  - `src/components/Adm/PageCreator/Templates/`: templates that still live
    outside a feature.
    - `EventPageCreator`: For events and calendars.
    - `IdeasSectionEditor`: For a teacher sharing a single idea.
  - Forms that live in their own feature, because they share its API, types and
    media editor:
    - `src/features/week-materials/WeekMaterialPageForm.tsx` — see
      [`content_materials.md`](content_materials.md).
    - `src/features/meditations/MeditationPageForm.tsx`.
    - `src/features/image-pages/ImagePageForm.tsx` and
      `src/features/video-pages/VideoPageForm.tsx`.
    - `src/features/ideas-pages/IdeasPageForm.tsx` — see
      [`content_materials.md`](content_materials.md).
  - `src/components/common/media/MediaEditor.tsx`: single media editor shared by
    the week material and ideas forms (videos, documents, images and audios).

## 🚪 Leaving an edit form

Every page form (week materials, meditations, image, video and ideas) shares
the same exit contract, because losing a draft in one of them is the same loss
in all five:

- `useUnsavedChangesGuard(isDirty)` announces the pending draft in
  `src/utils/unsavedChanges.ts` and keeps the browser `beforeunload` warning.
- `AdminLayout` reads that registry before every sidebar navigation and asks
  through `UnsavedChangesDialog`. React Router's `useBlocker` is not an option
  here: it only exists in a data router, and the app mounts its routes with
  `BrowserRouter`.
- Each form renders a `Voltar para a lista` button wired to `useGuardedExit`,
  which reuses the same dialog. The button is hidden while the form is being
  used to *create* a page from the template gallery, where the way back is the
  template picker itself.
- Browser Back and links outside the admin sidebar are still not intercepted —
  that needs the data-router migration.

Save failures show what the API refused: the form feedback goes through
`extractErrorMessage`, the same helper the listings use, so a missing file, an
expired session or a payload over the limit reach the administrator instead of
a fixed "erro ao salvar".

## 🛠️ Features

- **Dynamic Form Building**: create complex pages without writing code.
- **Media Integration**:
  - Upload images, documents (PDFs), and audios.
  - Embed YouTube or Vimeo videos.
  - Link to cloud storage (Google Drive, OneDrive).
- **Template System**: Pre-defined structures for common page types to ensure consistency.
- **Preview & Publish**: Review content before making it live to users.
