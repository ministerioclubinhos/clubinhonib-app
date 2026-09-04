# Children Ministry Module

This module focuses on the core beneficiaries of the system: the children. It handles data registration, attendance tracking, and spiritual decisions.

## 📁 Key Files

- **Features**:
  - `src/features/children/`: Core logic for child profiles and data.
  - `src/features/pagelas/`: Owner of the `/pagelas` contract — types, api, utils.
  - `src/features/pagela-clubs/`: The `/adm/pagelas` screen (clubs → children → pagelas).
  - `src/features/pagela-teacher/`: The teacher area, consuming the same contract.

## 🧒 `/adm/criancas` — managing children

The screen uses the shared admin listing shell (see
[Components](./components.md)): a grid of `ChildCard`, a debounced search over
name, guardian and phone, a select for the active filter, and an expandable area
with the club number and the two date ranges (birth date, joined date).

### Contract notes

- `gender` is the `Gender` enum (`M` | `F`) on both sides. The API rejects any
  other value; it used to accept any string up to 255 characters.
- The listing's default ordering is `orderBy=name&order=ASC`. It used to send
  `orderBy=updatedAt`, which the API did not support, so the results came back
  sorted by name while the screen believed they were sorted by last change.
- `meta.orderBy` and `meta.order` report the ordering actually applied.
- The address payload carries only the seven address fields. Global validation
  rejects unknown properties, so `id`, `createdAt` and `updatedAt` must be
  stripped before sending a previously loaded address back.
- Birth and join dates are calendar days (`YYYY-MM-DD`) and are formatted by
  splitting the text — never through `new Date`, which would read them as UTC
  and show the previous day in Manaus.

## 👶 Features

- **Child Profiles**: Detailed records including personal info, guardians, and medical notes.
- **Attendance Tracking (Pagela)**:
  - Weekly attendance logging.
  - Tracking of bible bringing and visitors.
  - Monitoring of spiritual decisions (accepting Christ).
- **Reporting**: Generating aggregate data on attendance and engagement for ministry leaders.

## 🔖 `/adm/pagelas` — browsing pagelas

Three panels chained left to right: clubs → children of the chosen club →
pagelas of the chosen child. Below `md` the panels become one step at a time,
with a back arrow, because three columns do not fit on a phone.

### Feature layout

| Path | Responsibility |
| --- | --- |
| `src/features/pagelas/` | Owner of the `/pagelas` contract: `types`, `api`, `constants`, `utils`. The teacher area consumes it too. |
| `src/features/pagela-clubs/` | The admin screen: navigation state, the three panels, and the hooks that feed them. |

The screen reads clubs from `features/clubs` and children from
`features/children` — it never re-declares those contracts.

### Admin and coordinator

`/adm` already refuses teachers, so this screen only ever serves an
administrator or a coordinator. The difference is not enforced here: the API
scopes every list by the caller's role, so a coordinator's `/clubs`,
`/children` and `/pagelas` already come back limited to the clubs they
coordinate.

What the screen does with that is wording. `viewerScopeOf(isAdmin)` picks
between two sets of texts (`CLUBS_SUBTITLE`, `CLUBS_SUBTITLE_MOBILE`,
`CLUBS_EMPTY_MESSAGE`) so a coordinator seeing two clubs understands that is
their scope, not the whole ministry. **Never filter by role on this side** —
duplicating the rule in the client is how the two copies drift apart.

### Contract rules

- The pagination envelope of `/pagelas/paginated` is the shared one:
  `data`, `total`, `page`, `limit`, `pageCount`.
- Requests carry only the fields the API's DTOs declare; validation runs with
  `forbidNonWhitelisted`, so one extra key is a `400`. `buildCreatePagelaRequest`,
  `buildUpdatePagelaRequest` and `buildPagelasQuery` are the only places that
  assemble a body or a query, and `utils.spec.ts` locks the key set each one
  produces.
- On `PATCH`, `null` means "clear" — the note and the teacher who recorded it.
- The free-text search only understands `2026-48`, `2026` or `48`. Anything
  else filters nothing, so the field says so instead of quietly returning
  everything.
- `referenceDate` is a calendar day, never a timestamp. Format it with
  `formatReferenceDate`, which reads the string by components — `new Date(str)`
  parses it as UTC midnight and shows the previous day in Manaus.
