/** Endereços e credenciais usados pelos testes; tudo pode vir do ambiente. */
export const API_URL = process.env.E2E_API_URL ?? 'http://localhost:3000';
export const APP_URL = process.env.E2E_APP_URL ?? 'http://localhost:5173';

export const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? 'superuser@clubinhonib.com';
export const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? 'Abc@123';

/** Usuários fixos criados pela suíte de automações da API (`scripts/automations`). */
export const TEACHER_EMAIL = process.env.E2E_TEACHER_EMAIL ?? 'teacher.automation@teste.clubinhonib.com';
export const TEACHER_PASSWORD = process.env.E2E_TEACHER_PASSWORD ?? 'Senha123@';

export const ADMIN_STORAGE = 'e2e/.auth/admin.json';
export const COORDINATOR_EMAIL = process.env.E2E_COORDINATOR_EMAIL ?? 'coordinator.automation@teste.clubinhonib.com';
export const COORDINATOR_PASSWORD = process.env.E2E_COORDINATOR_PASSWORD ?? 'Senha123@';
