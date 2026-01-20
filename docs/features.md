# Features & State Management

This application uses a modular feature-based architecture supported by Redux Toolkit for state management.

## 📂 Feature Organization

The `src/features/` directory contains domain-specific logic, organized by functional area:

- `children/`: Management of children's records.
- `clubs/` & `club-control/`: Club administration and lifecycle.
- `comments/`: Commenting system for interactive pages.
- `documents/`: Document management.
- `statistics/`: Data visualization and reporting analytics.
- `profile/`: User profile management.

## 🔄 State Management (Redux)

We use **Redux Toolkit** for efficient global state management.

- **Store**: Configured in `src/store/index.ts`.
- **Slices**: Each feature has a corresponding slice in `src/store/slices/`.
  - Examples: `authSlice`, `clubSlice`, `uiSlice`.
- **Async Actions**: We use `createAsyncThunk` for handling API side-effects.

## 📡 API Integration

- **Configuration**: Axios is configured in `src/config/axiosConfig.ts` with interceptors for token management.
- **Error Handling**: Centralized error utilities in `src/utils/apiError.ts` ensure consistent user feedback.
