# Club Management Module

The Club Management module provides tools for administrators and coordinators to oversee the structure and personnel of the ministry.

## 📁 Key Files

- **Features**:
  - `src/features/clubs/`: Management of club entities (Club 1, Club 2, etc.).
  - `src/features/club-control/`: Operational control logic.
  - `src/features/club-weekly-summary/`: The coordinator's period view (`/adm/resumo-semanal`).
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


## 👩‍🏫 `/adm/professores` and `/adm/coordenadores`

Both screens use the shared admin listing shell (see
[Components](./components.md)) and manage the link between a person and a club.

- The club is chosen from `GET /clubs/simple-options`, not typed as a number. A
  number typed by hand could name a club that does not exist, and the mistake
  only surfaced when the request failed. The option list also reports whether a
  club already has a coordinator.
- `TeacherClubDialog` assigns, swaps or clears a teacher's single club.
- `CoordinatorClubsDialog` shows the coordinator's current clubs with a per-row
  unlink action and an autocomplete for the next one; already linked clubs are
  removed from the options.
- Every unlink goes through a confirmation — from the card and from inside the
  dialog alike. The same gesture used to ask in one place and not in the other,
  and the person lost access to the club's children with no warning.
- After a write, the coordinator being edited is re-read from the API instead of
  patched locally: a freshly linked club used to show zero teachers even when it
  had a class.

### One dialog, three screens

`LinkManagerDialog` (`src/components/common/linking/`) is the single component
behind every link/unlink dialog: current links with a per-row unlink, an
autocomplete that shows disabled options *with the reason*, one place for the
loading and error states, and a read-only mode for profiles that may look but
not change. Teacher ↔ club and coordinator ↔ clubs are the same operation seen
from different sides, so they are one component with different labels.

The club create/edit form is the third door onto the same links, through
`coordinatorProfileId` and `teacherProfileIds`.

### Moving

The two sides differ on purpose, because a club is an attribute of a teacher but
a scarce resource for a coordinator:

- **Teacher**: picking another club moves them, in one request — from the
  teacher screen and from the club form alike. The club form's teacher selector
  now lists everyone and says where each one would come from (`No Clubinho 13 —
  será movido`); it used to hide anyone who already had a class, with no way to
  tell why they were missing.
- **Coordinator**: from the coordinator screen a club that already has one is
  shown disabled with the reason, because its current owner is not on screen and
  the API answers `409`. From the **club form** the current coordinator is the
  field's value, so replacing it is allowed — and the form says who loses the
  club.

### What a coordinator may do

`src/utils/clubLinkPermissions.ts` mirrors the API's policy, and every screen
reads it from there instead of deciding on its own:

| | Admin | Coordinator |
| --- | --- | --- |
| Link/unlink a teacher's club | ✅ | ✅, only between clubs they coordinate |
| Link/unlink/transfer a coordinator's clubs | ✅ | ❌ — the dialog opens read-only |
| Set a club's coordinator in the club form | ✅ | ❌ — the field is hidden |

Hiding a control is not authorization: the API enforces all of it again. But
offering an action that always answers `403` is an invitation to error, so the
dialogs open read-only with the reason instead of failing on submit. Options a
coordinator cannot take — a teacher currently in another coordination — are
listed and disabled, again with the reason.

### Access

`GET /teacher-profiles` and `GET /coordinator-profiles` are open to admins and
coordinators only — the listings carry the e-mail and phone of every colleague.
Assigning or clearing a teacher's club is allowed for an admin, and for a
coordinator only within the clubs they coordinate. Every write on
`/coordinator-profiles` is admin-only.


## 📅 `src/features/club-weekly-summary/` — Resumo dos clubinhos

The screen the Monday coordinator e-mail links to (`/adm/resumo-semanal`,
behind the `club_weekly_summary` flag, allowed for `admin` and `coordinator`).
Before it existed, that e-mail pointed at `/adm/controle-clubinhos` — an
admin-only route — so a coordinator clicking it was redirected to the dashboard
with nothing about the summary they had just read.

### One period at a time

The screen reads **one range at a time**, never a list of every week:

| Piece | Responsibility |
| --- | --- |
| `RangeNavigator` | The four views (semana / mês / trimestre / ano), the arrows that step one range back or forward, and the shortcut back to the current one. |
| `RangeStats` | Five numbers for the chosen range: cobertura, pagelas faltando, presença, encontros, semanas com pendência. |
| `ClubBreakdownList` | One row per club inside the range. With a single week it shows the exact status; with a month or a quarter it shows totals, because thirteen weeks have no single status. |
| `CoverageTimelineChart` | The whole year as one line, with the chosen range highlighted. One measure, one axis. |
| `WeeksHeatStrip` | The year as a band of squares, each painted by the **worst** status among its clubs. Doubles as a jump-to-week control. |

`utils.ts` owns every rule that decides what is drawn — `buildRanges`,
`currentRangeIndex`, `rangeTotals`, `aggregateByClub`, `weekOverallStatus` —
so each one is checked by `e2e/unit/club-weekly-summary.utils.spec.ts` without
mounting a screen.

### Mobile first

The phone is the base, and the desktop is what gets added on top:

- The page is `98%` wide on `xs` and `95%` from `md` up — the same rule as
  `IdeasPageView`, `PageVideoView` and `WeekMaterialsPageView` (`PAGE_WIDTH`).
- The two filter selects share the first row (`xs: 5` / `xs: 7`); stacked, they
  alone filled half the screen before a single number appeared.
- The four view buttons split the width equally on `xs` and shrink to their own
  text from `md` up. The "back to current" shortcut drops to its own full-width
  row on the phone — squeezed between the arrows, the period label had no room.
- Heat-strip squares are **larger on the phone than on the desktop** (44 px vs
  30 px): there they are a touch target, and 44 px is the floor for a thumb.
- The chart gives back axis width on `xs` (34 px instead of 48, three ticks
  instead of five) so the line keeps the room.
- Nothing scrolls the page sideways; the `flows` spec asserts it.

### Contract rules

- The response types mirror `src/modules/club-control/dto/club-weekly-summary.dto.ts`
  field by field. The scope is the API's: a coordinator receives their own
  clubs, and `clubId` only narrows the set the session already sees.
- Months and quarters group **whole weeks**, by the Monday each week starts on.
  Slicing by calendar day would cut an academic week in half, and there is no
  half week in pagela control.
- Deactivated clubs are hidden by default. They never change status, and in a
  base with ten of them every range became a list of "Desativado"; the filter
  brings them back for whoever needs the history.
- Future weeks are hidden by default, and the API's `highlights` already
  excludes them: they start with no pagela, and counting them would make March
  look like a year behind.
- `sumCounts` recomputes the percentage over the total, never averages the
  parts: 1 of 1 plus 0 of 9 is 10%, not 50%.

### Seed for local demo

`npm run seed:weekly-summary` (in `clubinhonib-api`) fills weeks 1 through the
current one with every scenario — em dia, parcial, sem pagela, dia sem
Clubinho, and two deliberately blank weeks. It **deletes** pagelas to open the
empty cells, so it refuses any target that is not the local API unless
`ALLOW_REMOTE_SEED=1`; `DRY_RUN=1` reports what it would do.
