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

## 🛠️ Features

- **Dynamic Form Building**: create complex pages without writing code.
- **Media Integration**:
  - Upload images, documents (PDFs), and audios.
  - Embed YouTube or Vimeo videos.
  - Link to cloud storage (Google Drive, OneDrive).
- **Template System**: Pre-defined structures for common page types to ensure consistency.
- **Preview & Publish**: Review content before making it live to users.
