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

## ⚠️ Key Dependencies

- **Material UI**: Core component library.
- **Framer Motion**: Used for complex animations and page transitions.
- **React Icons**: For iconography throughout the app.
