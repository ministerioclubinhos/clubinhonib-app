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

## Public Clubinho feed

`/feed-clubinho` composes `src/features/clubinho-feed/` as a chronological news
feed. Its compact white header and neutral surfaces use the green from the public
navbar. Publications appear in the main column; a recent-publications sidebar
appears on desktop. Mobile keeps a single column. The former hero photo deck and
stories strip are no longer part of the page.

The header, loading state and content share a mobile-first width of 98%,
switching to 95% at `md` with no fixed maximum. Browser tests cover 320, 390,
768, 1440 and 1920px without horizontal overflow. Photo comments stack below
the image on mobile and move beside it on desktop; see [Engagement](engagement.md).

The view selector offers Publicações (Feed on mobile), Álbuns and Fotos. Search
filters only the publications already loaded. Photo previews open the shared
lightbox; reactions remain local to the browser, and sharing uses a direct link
to the publication. Upload and management actions retain their existing feature
flag and role checks.

The feed still reads `GET /image-pages/:id/sections` through the shared Axios
client and TanStack Query, using `VITE_FEED_MINISTERIO_ID`, six sections per page
and the API's descending creation-date order. Pagination, refresh and the API's
visibility rules are unchanged.
