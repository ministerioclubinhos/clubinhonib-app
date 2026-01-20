# Utilities & Helpers

The `src/utils/` directory contains pure functions and helpers used throughout the application.

## 🛠️ Key Utilities

### Date & Time (`dateUtils.ts`, `dates.ts`)

- Functions for formatting dates (Brazilian standard `DD/MM/YYYY`).
- Helpers for calculating age or time differences.
- Wrapper around `dayjs` for consistency.

### Validation (`validators.ts`, `validateMediaURL.ts`)

- **`validateMediaURL`**: Checks if a URL belongs to allowed platforms (YouTube, Vimeo, Google Drive) and formats it correctly.
- **`validators.ts`**: Common validation logic (CPF, Phone, Email) often used with Yup schemas.

### Formatting (`masks.ts`, `textUtils.ts`)

- **`masks.ts`**: Input masks for Brazilian formats (CPF, CNPJ, Phone).
- **`textUtils.ts`**: Helpers for capitalizing strings or truncating text.

### Communication (`whatsapp.ts`, `eventBus.ts`)

- **`whatsapp.ts`**: Helper to generate WhatsApp API links for direct messaging.
- **`eventBus.ts`**: A simple publish/subscribe system for decoupling components (e.g., triggering a global refresh).

### API & Auth (`apiError.ts`, `useAuthRole.ts`)

- **`apiError.ts`**: logic for parsing backend error responses.
- **`useAuthRole.ts`**: Helper to check permissions based on user role.
