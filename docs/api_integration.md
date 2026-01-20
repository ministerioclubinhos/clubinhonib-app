# API Integration & Configuration

This document outlines how the application interfaces with the backend and external services.

## 📡 Axios Configuration

The core API client is configured in `src/config/axiosConfig.ts`.

- **Base URL**: Dynamically set via environment variables (see [Deployment](./deployment_infrastructure.md)).
- **Interceptors**:
  - **Request**: Automatically attaches the Authorization header (Bearer token) from the Redux state.
  - **Response**: Global error handling logic is triggered here, often redirecting to login on 401 Unauthorized errors.

## 🛡️ Error Handling

We leverage a centralized error handling strategy defined in `src/utils/apiError.ts`.

- **Standardized Responses**: The backend returns errors in a specific format which is parsed by `getErrorMessage`.
- **User Feedback**: Errors are often displayed via `notistack` (toast notifications) or specific form field errors using `react-hook-form`.
- **Constants**: All error messages are centralized in `src/constants/errorMessages.ts` to prevent hardcoding.

## 🌐 Environment Variables

The application uses different environment configurations located in `env/`:

- `.env.local`: Local development overrides.
- `.env.stg`: Staging environment settings.
- `.env.prod`: Production environment settings.

**Key Variables**:

- `VITE_API_URL`: The endpoint for the backend API.
- `VITE_GOOGLE_ADS_CLIENT_ID`: Google Client ID for authentication.
