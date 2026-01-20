# Page Creator (Admin) Module

The Page Creator module allows administrators to dynamically create and manage content pages for the application, such as weekly materials, event pages, and special announcements.

## 📁 Key Files

- **Components**:
  - `src/components/Adm/PageCreator/`: Core logic for the page builder.
  - `src/components/Adm/PageCreator/Templates/`: Specific templates for different content types.
    - `WeekMaterialPageCreator`: For weekly lessons.
    - `EventPageCreator`: For events and calendars.
    - `IdeasMaterialPageCreator`: For sharing activity ideas.
    - `VideoPageCreator` & `ImagePageCreator`: For media galleries.

## 🛠️ Features

- **Dynamic Form Building**: create complex pages without writing code.
- **Media Integration**:
  - Upload images, documents (PDFs), and audios.
  - Embed YouTube or Vimeo videos.
  - Link to cloud storage (Google Drive, OneDrive).
- **Template System**: Pre-defined structures for common page types to ensure consistency.
- **Preview & Publish**: Review content before making it live to users.
