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
