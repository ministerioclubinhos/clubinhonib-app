# Engagement Module

The Engagement module facilitates interaction, communication, and feedback within the platform.

## 📁 Key Files

- **Features**:
  - `src/features/comments/`: Commenting system on posts and materials.
  - `src/features/feedback/`: System feedback submission.
  - `src/features/contacts/`: Directory or messaging features.

## 💬 Features

- **Social Interaction**:
  - Comments on shared images and materials to foster community.
  - Likes and reactions (if implemented) to encourage participation.
- **Feedback Loop**:
  - Direct channels for teachers to report issues or suggestions to admins.
  - Surveys for gathering broad input on ministry initiatives.
- **Directory**:
  - Access to contact information for coordinators and support staff.

## 🗂️ Admin listings: feedbacks, contacts and comments

`/adm/feedbacks`, `/adm/contatos` and `/adm/comentarios` are the same screen
with different content, so they share one shell:
`src/components/common/listing/`.

| Piece | Responsibility |
| --- | --- |
| `ListingLayout` | Header, toolbar slot, card grid, empty/loading states, pagination, dialog slot. |
| `ListingToolbar` | Search box, select filters, refresh. |
| `ListingCard` | The card itself: accent stripe, avatar, title, badges, excerpt, meta row, footer and actions. |

Each feature supplies only what is specific: which filters exist, what goes in
the card, and which dialogs open.

### Filtering happens on the server

The three listings used to download every row and filter in the browser. They
now send `page`, `limit`, `searchString`, the module's filters, `sort` and
`order`, and render the page the API returns. The search box is debounced
(`SEARCH_DEBOUNCE_MS`); changing a filter resets to page 1, because page 5 of
the previous result rarely exists in the new one.

### Mobile first

The shell is designed for the phone and grows into the desktop.

- Every responsive value starts at `xs`: `size={{ xs: 12, sm: 6, lg: 4 }}`,
  `p: { xs: 1.5, md: 2 }`. A style declared only under `md` is a bug.
- **Filters collapse behind a button below `md`.** Feedbacks has three selects;
  stacked, they pushed the grid off the first screen. The button carries a
  badge with how many filters are active, and opens a panel with a
  "Limpar filtros" shortcut.
- **Search and the two icon actions share one row on the phone**, so the
  toolbar costs a single line until the filters are opened.
- **Touch targets are at least 44px on `xs`**, enforced once in `ListingCard`'s
  action row — the screens pass `size="small"` buttons, which alone would be
  ~34px — and again in the pagination arrows.
- The card footer wraps to its own line on `xs`: with four 44px actions there
  is little room left on a 320px screen.
- `TablePagination` hides the "Por página:" label below `sm`; the select alone
  already says what it does.
- Dialogs go full screen on `xs`, with the actions stacked and full width.
- Height uses `dvh` where supported, so the browser bar does not cut the page.

### Contract rules

- The response types mirror the API's DTOs field by field. `contacts` in
  particular had a guessed type, because the route used to answer the raw
  entity.
- Requests carry only the fields the API's DTOs declare — validation runs with
  `forbidNonWhitelisted`, so one extra key is a `400`. `buildContactsQuery`,
  `buildCommentsQuery`, `buildFeedbacksQuery` and `buildUpdateCommentRequest`
  are the only places that assemble a query or a body, and each feature's
  `utils.spec.ts` locks the key set they produce.
- An empty search is **omitted**, never sent as `searchString=`.
- Publishing a comment is `PATCH /comments/:id/publish`, never a `PUT` carrying
  the whole comment. Editing never touches `published`.
- The admin comment listing keeps its rows in local state. It used to write
  them into the Redux slice the home page reads, so after opening the admin
  screen the home carousel showed unpublished comments.
