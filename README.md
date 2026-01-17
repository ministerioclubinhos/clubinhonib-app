# Clubinhos NIB

Sistema de gestão e apoio para o ministério infantil Clubinhos NIB. O projeto visa facilitar a organização de atividades, escalas e comunicação entre os irmãos e líderes.

## 🛠️ Tech Stack

- **Core**: React 18, TypeScript, Vite
- **UI/UX**: TailwindCSS, Lucide React, Radix UI
- **State & Data**: TanStack Query, React Hook Form, Zod
- **Infraestrutura**: AWS Amplify, CloudFormation

## 🚀 Getting Started

### Pré-requisitos

- Node.js 18+
- npm ou yarn

### Instalação

```bash
# Instalar dependências
npm install
```

### Desenvolvimento

```bash
# Iniciar servidor local
npm run dev
```

## 📦 Scripts Principais

- `npm run build`: Compila o projeto para produção.
- `npm run preview`: Visualiza o build de produção localmente.
- `npm run lint`: Executa verificação de código (ESLint).

## ☁️ Deploy

O deploy é automatizado via AWS Amplify. Consulte a documentação de infraestrutura para detalhes:
👉 [Infraestrutura e Deploy](./cloudformation/README.md)
