import { defineConfig, devices } from '@playwright/test';

/**
 * Testes de ponta a ponta dos fluxos de edição do painel.
 *
 * Rodam contra o app em `http://localhost:5173` e a API em
 * `http://localhost:3000`, ambos já de pé (`npm run start:local` em cada
 * repositório). O projeto `setup` faz o login uma vez e guarda a sessão em
 * `e2e/.auth/admin.json`; os demais reaproveitam esse estado.
 */
const APP_URL = process.env.E2E_APP_URL ?? 'http://localhost:5173';

/**
 * O projeto `unit` importa módulos de `src/` direto no Node. O build ESM do
 * Material UI usa importações de diretório que o Node recusa; o loader em
 * `e2e/support/node-esm-loader.mjs` completa o caminho. Vai em `NODE_OPTIONS`
 * porque os testes rodam em processos filhos, que herdam o ambiente.
 */
const loaderUrl = new URL('./e2e/support/register-loader.mjs', import.meta.url).href;
const loaderFlag = `--import=${loaderUrl}`;
if (!(process.env.NODE_OPTIONS ?? '').includes(loaderFlag)) {
  process.env.NODE_OPTIONS = [process.env.NODE_OPTIONS, loaderFlag].filter(Boolean).join(' ');
}

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'e2e/report' }]],
  outputDir: 'e2e/test-results',
  use: {
    baseURL: APP_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    locale: 'pt-BR',
    timezoneId: 'America/Sao_Paulo',
  },
  projects: [
    /**
     * Regras puras (utils, builders de query e payload): rodam no Node, sem
     * navegador e sem API. É o que eram os testes unitários do Vitest.
     */
    { name: 'unit', testMatch: /unit\/.*\.spec\.ts/, use: { trace: 'off', screenshot: 'off' } },
    { name: 'setup', testMatch: /support\/auth\.setup\.ts/ },
    /** Fluxos reais do painel e das telas, logado como administrador. */
    {
      name: 'chromium',
      dependencies: ['setup'],
      testMatch: /(edit|flows)\/.*\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], storageState: 'e2e/.auth/admin.json' },
    },
  ],
});
