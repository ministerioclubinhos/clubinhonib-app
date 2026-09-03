# Authentication Module

The authentication module manages user sessions, registration, password recovery, and role-based access control.

## 📁 Key Files

- **Pages**:
  - `src/pages/Login/Login.tsx`: User login page.
  - `src/pages/Register/Register.tsx`: User registration page.
  - `src/pages/ForgotPassword/ForgotPassword.tsx`: Initiates password recovery flow.
  - `src/pages/ResetPassword/ResetPassword.tsx`: Handles password reset with token.
- **State**:
  - `src/store/slices/auth/authSlice.ts`: Redux slice for authentication state (user, token, role).
- **Hooks**:
  - `src/hooks/useAuth.ts`: Custom hook for accessing auth state.
- **Services**:
  - `src/core/auth/services/`: Services for API communication.

## 🔐 Features

- **JWT Authentication**: Secure token-based authentication.
- **Role-Based Access**:
  - **Admin**: Full system access.
  - **Coordinator**: Management of specific clubs.
  - **Teacher**: Access to teacher area and their clubs.
- **Persistent Session**: Sessions are persisted using `redux-persist`.
- **Password Recovery**: Secure flow for users to reset forgotten passwords.

## 👤 `/meu-perfil` — the signed-in user's profile

### Two surfaces, one screen

The page talks to two endpoint families, and they are not the same thing:

| Route | What it is | Frontend type |
| --- | --- | --- |
| `/profile` | The **account**: name, e-mail, phone, CPF, password, photo. | `MyProfile` |
| `/profiles` | The **extended** profile: personal data and preferences. | `CompleteProfile` |

`GET /auth/me` answers the very same `MyProfile` as `GET /profile`, so the
Redux `User` is declared as `export type User = MyProfile` — one declaration,
not a parallel copy. Everything the page renders comes straight from that
object; it no longer copies the user field by field into a local shape.

### Feature layout

`src/features/profile/` follows the standard: `types.ts`, `constants.ts`,
`utils.ts`, `api.ts`, `hooks.ts`, `components/`, `index.ts`. `ProfilePage.tsx`
lives in the feature, not under `pages/`. The old `constants/` and `utils/`
subfolders are gone — role and gender styling is presentation and moved to
`components/profileStyles.tsx`.

### Contract rules

- The response types are the API's contracts, not a convenient subset. The
  previous `Profile` type invented `mediaItems`, `memberProfile` (with teams
  and shelters) and `leaderProfile: any`, none of which the API ever sent,
  while omitting `personalData`, `preferences`, `teacherProfile` and
  `coordinatorProfile`, which it always did.
- Requests carry only the fields the API's DTOs declare — validation runs with
  `forbidNonWhitelisted`, so one extra key is a `400`.
  `buildUpdateAccountRequest`, `buildChangePasswordRequest` and
  `buildCompleteProfileRequest` are the only places that assemble a body, and
  `utils.spec.ts` locks the key set each one produces.
- `buildUpdateAccountRequest` sends **only what changed**: reasserting the
  current e-mail or CPF would trigger the uniqueness check for nothing.
- The current password goes only when it is required — a social login has
  none, and sending it empty fails validation. `requiresCurrentPassword` reads
  `commonUser` to decide.
- `birthDate` is a calendar day, never a timestamp. Format it with
  `formatDateOnly`, which reads the string by components — `new Date(str)`
  parses it as UTC midnight and shows the previous day in Manaus.
