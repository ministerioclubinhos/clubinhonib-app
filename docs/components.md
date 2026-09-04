# UI Components & Design System

The application uses a component-based UI architecture built on top of **Material UI (MUI)**.

## 🎨 Design Principles

- **Responsive First**: All components are designed to work seamlessly on mobile and desktop.
- **Accessibility**: We follow WCAG guidelines where possible, leveraging MUI's built-in accessibility features.
- **Theming**: Evaluating global theme customization in `src/styles/`.

## 🧩 Shared Components

Located in `src/components/`, common components include:

- **`NavBar/`**: Responsive navigation bar with distinct views for mobile and desktop.
- **`Footer/`**: Application footer.
- **`Card/`**: Reusable card components for displaying content summaries.
- **`Modal/`**: Standardized modals for forms and confirmations.
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

The people screens (`/adm/perfis`, `/adm/usuarios`, `/adm/professores`,
`/adm/coordenadores`, `/adm/criancas`) use this shell, except `/adm/perfis`,
which is a directory rather than a CRUD listing and keeps its own photo cards and
birthday band.

## ⚠️ Key Dependencies

- **Material UI**: Core component library.
- **Framer Motion**: Used for complex animations and page transitions.
- **React Icons**: For iconography throughout the app.
