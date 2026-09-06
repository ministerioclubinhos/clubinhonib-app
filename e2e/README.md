# Testes do frontend (Playwright)

Todos os testes do app rodam no Playwright. Configuração em `../playwright.config.ts`.

| Projeto    | Onde                      | O que cobre                                                                                  | Precisa de                    |
| ---------- | ------------------------- | -------------------------------------------------------------------------------------------- | ----------------------------- |
| `unit`     | `unit/*.spec.ts`          | Regras puras de `src/` (utils, builders de query e payload). Sem navegador, sem API.         | Nada                          |
| `setup`    | `support/auth.setup.ts`   | Login do administrador pela tela; guarda a sessão em `.auth/admin.json`.                     | App + API locais              |
| `chromium` | `edit/**`, `flows/**`     | Telas reais: `edit/` grava e relê pela API; `flows/` cobre listagens, diálogos e editores.    | App + API locais              |

```bash
npm run test:unit       # só as regras puras (segundos)
npm run test:e2e        # setup + edit + flows contra localhost:5173 / localhost:3000
npm test                # tudo
npm run test:report     # relatório HTML da última rodada
```

Variáveis aceitas (`support/env.ts`): `E2E_APP_URL`, `E2E_API_URL`, `E2E_ADMIN_EMAIL`, `E2E_ADMIN_PASSWORD`,
`E2E_TEACHER_EMAIL`/`E2E_TEACHER_PASSWORD` e `E2E_COORDINATOR_EMAIL`/`E2E_COORDINATOR_PASSWORD`. Os usuários fixos
por papel vêm da suíte de automações da API (`clubinhonib-api/scripts/automations`); o superusuário vem de
`npm run automation:seed-superuser` no repositório da API.

## Convenções

- Cada teste cria seus dados pela API (`support/api.ts`) com `uniqueSuffix()` e os remove em `afterAll`.
- Seletores: papéis acessíveis (`getByRole`) e o `data-testid` `<feature>-<componente>[-id]` (`support/ui.ts` tem os gestos do MUI).
- Um módulo testado em `unit` não pode puxar React ou Material UI em tempo de execução; importe constantes do módulo puro,
  não do barrel de UI. O loader `support/node-esm-loader.mjs` só resolve as importações de diretório do MUI que sobram.
- Rode uma rodada por vez: os projetos de navegador compartilham `.auth/admin.json`.
