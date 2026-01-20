# Clubinhos NIB

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white)
![AWS Amplify](https://img.shields.io/badge/AWS-Amplify-FF9900?style=flat-square&logo=aws-amplify&logoColor=white)

**Clubinhos NIB** is a comprehensive management and support system designed for the children's ministry of Nova Igreja Batista (NIB). It modernizes the organization of educational activities, volunteer schedules, and internal communication, providing a fluid and engaging experience for leaders, teachers, and members.

---

## 🚀 Features

- **Activity Management**: Plan and distribute weekly activities, materials, and lessons for different age groups.
- **Media Sharing**: A dedicated platform for teachers to share photos and videos of club activities, fostering community and inspiration.
- **Volunteer Coordination**: Manage schedules, roles, and communication for ministry volunteers.
- **Interactive Dashboard**: A user-friendly interface for tracking progress, upcoming events, and important announcements.
- **Secure Authentication**: Role-based access control ensuring data privacy and appropriate permissions for admins, coordinators, and teachers.

## 📚 Documentation & Modules

Explore our detailed documentation to understand specific modules and architecture:

| Module | Description |
| :--- | :--- |
| [🔐 Authentication](./docs/authentication.md) | Login, registration, and role-based access control. |
| [🍎 Teacher Area](./docs/teacher_area.md) | Dashboard, class reporting, and media sharing for teachers. |
| [🏢 Club Management](./docs/club_management.md) | Tools for admins, coordinators, and personnel oversight. |
| [👶 Children Ministry](./docs/children_ministry.md) | Profiles, attendance (Pagelas), and reporting for children. |
| [📚 Content & Materials](./docs/content_materials.md) | Weekly lessons, devotionals, and resource distribution. |
| [📄 Page Creator](./docs/page_creator.md) | Admin tools for dynamic content creation. |
| [💬 Engagement](./docs/engagement.md) | Comments, feedback, and social interaction features. |
| [📊 Statistics](./docs/statistics.md) | Data visualization and reporting analytics. |
| [📂 Features & State](./docs/features.md) | Redux slicing and feature organization. |
| [🧩 Components](./docs/components.md) | UI components and design system. |
| [🏗️ Project Structure](./docs/project_structure.md) | Folder layout and architectural patterns. |
| [📡 API & Config](./docs/api_integration.md) | Axios setup, environment variables, and error handling. |
| [🛠️ Utilities](./docs/utilities.md) | Helper functions, validation logic, and shared tools. |
| [☁️ Deployment](./docs/deployment_infrastructure.md) | Infrastructure as Code (CloudFormation) and Amplify setup. |

## 🛠️ Technology Stack

We strive for technical excellence by leveraging modern, high-performance tools and best practices:

| Category | Technologies |
| :--- | :--- |
| **Core** | [React 18](https://react.dev), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/) |
| **Styling & UI** | [Material UI](https://mui.com/), [Framer Motion](https://www.framer.com/motion/) |
| **State & Data** | [Redux Toolkit](https://redux-toolkit.js.org/), [Axios](https://axios-http.com/) |
| **Forms & Validation** | [React Hook Form](https://react-hook-form.com/), [Yup](https://github.com/jquense/yup) |
| **DevOps & Cloud** | AWS Amplify, CloudFormation, GitHub Actions |

## � Getting Started

### Prerequisites

Ensure you have the following installed on your machine:

- **Node.js 18+**
- **npm** or **yarn**

### Quick Installation

1. **Clone the repository:**

    ```bash
    git clone https://github.com/clubinhonib/clubinhonib-app.git
    ```

2. **Navigate to the project directory:**

    ```bash
    cd clubinhonib-app
    ```

3. **Install dependencies:**

    ```bash
    npm install
    ```

4. **Start the development server:**

    ```bash
    npm run dev
    ```

    Access `http://localhost:5173` to view the application in your browser.

## � Available Scripts

- **`npm run dev`**: Starts the development server with HMR.
- **`npm run build`**: Generates an optimized production build.
- **`npm run preview`**: Locally previews the production build.
- **`npm run lint`**: Analyzes code for potential errors using ESLint.
- **`npm run type-check`**: Runs TypeScript type checking.

## ☁️ Infrastructure & Deployment

Our infrastructure is fully managed as code (IaC) via **AWS CloudFormation** and provisioned using **AWS Amplify**, ensuring reliable and reproducible deployments across environments.

---

<p align="center">
  Built with ❤️ for the next generation.
</p>
