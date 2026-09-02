# Club Management Module

The Club Management module provides tools for administrators and coordinators to oversee the structure and personnel of the ministry.

## 📁 Key Files

- **Features**:
  - `src/features/clubs/`: Management of club entities (Club 1, Club 2, etc.).
  - `src/features/club-control/`: Operational control logic.
  - `src/features/coordinators/`: Management of club coordinators.
  - `src/features/teachers/`: Management of teachers and their assignments.
  - `src/features/users/`: General user administration.

## 🏢 Features

- **Entity Management**: CRUD operations for Clubs, Coordinators, and Teachers.
- **Assignment Logic**: Assigning teachers and coordinators to specific clubs.
- **User Roles**: Definition and enforcement of permissions for different user types within the club structure.
- **Operational Oversight**: "Club Control" features for monitoring overall ministry health.

## 🧱 `src/features/clubs/` layout

| File | Responsibility |
| --- | --- |
| `types.ts` | Mirrors `src/modules/clubs/dto` from the API, field by field. |
| `constants.ts` | Weekdays, sort fields, page sizes, the empty form. No magic strings. |
| `utils.ts` | Pure logic: form ⇄ request translation, validation, display formatting. |
| `api.ts` | Only `/clubs` endpoints. Coordinator and teacher options come from their own features. |
| `hooks.ts` | `useClubs`, `useClubDetails`, `useClubMutations`, `useClubFormOptions`. |
| `components/` | Presentation. No request assembly, no `any`. |
| `index.ts` | Public surface of the feature. |

## 🔒 Contract rules

- The response types are the API's contracts, not a convenient subset. Every
  address field is nullable and always present; a club may have no address,
  no coordinator, and no teachers.
- Requests never carry a field the API's DTOs do not declare: validation runs
  with `forbidNonWhitelisted`, so one extra key (the address `id`, say) turns
  the whole request into a `400`. `buildCreateClubRequest` and
  `buildUpdateClubRequest` are the only places that assemble a body, and
  `utils.spec.ts` locks the exact key set each one produces.
- On `PATCH`, `null` means "clear": it empties the time and unlinks the
  coordinator. On `POST` there is nothing to clear, so an empty field is
  omitted instead.
- `teacherProfileIds` always goes with the update — an empty list means
  "unlink every teacher", which is different from leaving the field out.
- Weekdays are the six the API accepts. There is no Sunday.

## 📱 Mobile first

The clubs screen is designed for the phone and grows into the desktop, never
the other way round.

- **Base styles are the mobile ones.** Every responsive value starts at `xs`
  and adds `sm`/`md` on top: `size={{ xs: 12, md: 4 }}`, `p: { xs: 2, md: 3 }`.
  A style declared only under `md` is a bug, not a shortcut.
- **The list changes shape, not just size.** Below `sm`, `ClubsTable` renders
  `ClubsCards` — a stacked card per club with its own sort control and
  pagination. The data table only exists where there is room for it.
- **Dialogs go full screen on `xs`.** The form has many fields and the on-screen
  keyboard eats half the viewport; a 98vw box left it unusable.
- **Touch targets are at least 44px on `xs`,** including the pagination arrows.
- **Actions sit where the thumb is.** On `xs` the toolbar buttons become
  floating action buttons at the bottom right, below the modal layer
  (`theme.zIndex.fab`) so they never cover an open dialog, and with
  `env(safe-area-inset-bottom)` respected.
- **Typing does not mean requesting.** The search box is debounced
  (`SEARCH_DEBOUNCE_MS`); status and sorting still answer immediately.
- **Nothing scrolls sideways.** Menus size with `calc(100vw - 32px)` rather
  than `vw`, long names are clipped or wrapped, and height uses `dvh` where
  supported so the browser bar does not cut the page.
