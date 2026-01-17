# Clubinhos NIB

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white)
![AWS Amplify](https://img.shields.io/badge/AWS-Amplify-FF9900?style=flat-square&logo=aws-amplify&logoColor=white)

Sistema de gestão e apoio para o ministério infantil **Clubinhos NIB**. O projeto moderniza a organização de atividades, escalas de voluntários e comunicação interna, oferecendo uma experiência fluida para líderes e membros.

---

## 🛠️ Tecnologias

Buscamos excelência técnica utilizando ferramentas modernas e performáticas:

| Categoria | Tecnologias |
|-----------|-------------|
| **Core** | [React 18](https://react.dev), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/) |
| **Estilo & UI** | [TailwindCSS](https://tailwindcss.com/), [Radix UI](https://www.radix-ui.com/), [Lucide Icons](https://lucide.dev/) |
| **Estado & Dados** | [TanStack Query](https://tanstack.com/query), [Zustand](https://github.com/pmndrs/zustand), [React Hook Form](https://react-hook-form.com/) |
| **DevOps** | AWS Amplify, CloudFormation, GitHub Actions |

## 🚀 Como Iniciar

### Pré-requisitos

Certifique-se de ter instalado:

- **Node.js 18+**
- **npm** ou **yarn**

### Instalação Rápida

```bash
# Clone o repositório
git clone https://github.com/clubinhonib/clubinhonib-app.git

# Entre no diretório
cd clubinhonib-app

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

Acesse `http://localhost:5173` para ver a aplicação rodando.

## 📦 Scripts Úteis

- **`npm run build`**: Gera o build otimizado para produção.
- **`npm run preview`**: Testa o build de produção localmente.
- **`npm run lint`**: Analisa e corrige problemas de código (ESLint/Prettier).

## ☁️ Infraestrutura & Deploy

Nossa infraestrutura é totalmente gerenciada como código (IaC) via AWS CloudFormation e provisionada pelo AWS Amplify.

👉 **[Documentação Completa de Deploy](./cloudformation/README.md)** para detalhes sobre ambientes (Staging/Prod), configuração de DNS e pipeline de CI/CD.
