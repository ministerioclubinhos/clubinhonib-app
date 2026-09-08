# Testes do frontend (Playwright)

Todos os testes do app rodam no Playwright. Configuração em `../playwright.config.ts`.

| Projeto    | Onde                      | O que cobre                                                                                  | Precisa de                    |
| ---------- | ------------------------- | -------------------------------------------------------------------------------------------- | ----------------------------- |
| `unit`     | `unit/*.spec.ts`          | Regras puras de `src/` (utils, builders de query e payload). Sem navegador, sem API.         | Nada                          |
| `setup`    | `support/*.setup.ts`      | Login do administrador pela tela (`.auth/admin.json`) e **desligamento dos envios de e-mail**. | App + API locais              |
| `teardown` | `support/*.teardown.ts`   | Religa os envios, só com `E2E_RESTORE_EMAIL_FLAGS=1`.                                        | API local                     |
| `chromium` | `edit/**`, `flows/**`     | Telas reais: `edit/` grava e relê pela API; `flows/` cobre listagens, diálogos e editores.    | App + API locais              |

```bash
npm run test:unit       # só as regras puras (segundos)
npm run test:e2e        # setup + edit + flows contra localhost:5173 / localhost:3000 (sem janela)
npm run test:e2e:headed # o mesmo, com o navegador visível
npm test                # tudo
npm run test:report     # relatório HTML da última rodada
```

A rodada padrão é *headless*: o Chromium abre em segundo plano e nada aparece na tela. Use `test:e2e:headed`
para vê-lo, `npm run test:e2e -- --ui` para o modo interativo com time-travel, ou `-- --debug` para o Inspector.

## Envios de e-mail ficam desligados durante a rodada

A suíte cria usuário, publica informativo, material e evento — e cada uma dessas ações dispara um aviso para toda a
base ativa. Com as flags `email_*` ligadas (o padrão delas), uma rodada completa estourava a cota diária do provedor,
e isso acontecia em **toda** rodada.

Por isso o projeto `setup` desliga todas as flags `email_*` que estiverem ligadas antes de qualquer teste de
navegador (`support/email-flags.setup.ts`), registrando em `.auth/email-flags.json` só o que ele mesmo desligou.

- **Elas continuam desligadas depois da rodada**, de propósito. É o lado seguro: um `Ctrl+C` no meio pula qualquer
  teardown, e aí a cota fica protegida em vez de exposta.
- Para religar ao fim de uma rodada limpa: `E2E_RESTORE_EMAIL_FLAGS=1 npm run test:e2e`. Só as chaves que aquela
  rodada desligou voltam — o que já estava desligado por decisão de alguém continua assim.
- Para religar tudo agora, sem rodar a suíte:
  `E2E_RESTORE_EMAIL_FLAGS=1 npx playwright test e2e/support/email-flags.teardown.ts --project=teardown`.
- Desligar uma flag sobrevive à rodada, então o passo **recusa** qualquer `E2E_API_URL` que não seja local;
  `E2E_ALLOW_REMOTE_FLAGS=1` libera, e a responsabilidade é de quem passar.

Nenhum teste da suíte afirma que um e-mail saiu, então desligar não enfraquece nenhuma verificação.

Variáveis aceitas (`support/env.ts`): `E2E_APP_URL`, `E2E_API_URL`, `E2E_ADMIN_EMAIL`, `E2E_ADMIN_PASSWORD`,
`E2E_TEACHER_EMAIL`/`E2E_TEACHER_PASSWORD`, `E2E_COORDINATOR_EMAIL`/`E2E_COORDINATOR_PASSWORD`,
`E2E_RESTORE_EMAIL_FLAGS` e `E2E_ALLOW_REMOTE_FLAGS`. Os usuários fixos
por papel vêm da suíte de automações da API (`clubinhonib-api/scripts/automations`); o superusuário vem de
`npm run automation:seed-superuser` no repositório da API.

## Convenções

- Cada teste cria seus dados pela API (`support/api.ts`) com `uniqueSuffix()` e os remove em `afterAll`.
- Seletores: papéis acessíveis (`getByRole`) e o `data-testid` `<feature>-<componente>[-id]` (`support/ui.ts` tem os gestos do MUI).
- Um módulo testado em `unit` não pode puxar React ou Material UI em tempo de execução; importe constantes do módulo puro,
  não do barrel de UI. O loader `support/node-esm-loader.mjs` só resolve as importações de diretório do MUI que sobram.
- Rode uma rodada por vez: os projetos de navegador compartilham `.auth/admin.json`.
