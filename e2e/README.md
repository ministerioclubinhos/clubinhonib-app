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

## IA simulada: nenhum teste gasta tokens

O projeto `setup` tem a trava `support/ai-provider.setup.ts`: antes de qualquer
teste de navegador ele lê `GET /health` da API e **aborta a rodada** se
`aiProviderMode` não for `fake`. Suba a API assim:

```bash
AI_PROVIDER_MODE=fake ./run.sh local
```

Nesse modo a API percorre o fluxo inteiro (fila, worker, guardas, banco), mas
o transporte de IA devolve respostas simuladas e nunca chama OpenAI/Gemini.
Testes de tela que precisam de um resultado específico de IA continuam podendo
simular a resposta da API no navegador (`page.route`, ver `ideasMocks.ts`).
Só para uma rodada intencional com IA real: `E2E_ALLOW_LIVE_AI=1`.

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

## Exclusão e edição de páginas: o arquivo no S3 é conferido

`edit/pages-delete.spec.ts` e `edit/pages-media-cleanup.spec.ts` cobrem materiais da semana, galerias de
vídeos, páginas de ideias e galerias de fotos nas duas operações que dão medo: excluir e editar.

Os dois erros dessas operações são invisíveis pela API. **Esquecer de apagar o arquivo** deixa órfão no
bucket — a resposta é a mesma, a tela fica certa, e a conta do S3 cresce em silêncio. **Apagar demais**
quebra a mídia que continuava publicada, apontando para um objeto que não existe mais. Por isso cada
cenário sobe arquivo de verdade (`support/pageSeeds.ts`) e confere o bucket direto, com um GET anônimo na
URL do objeto (`support/s3.ts`): `expectS3ObjectGone` para o que saiu, `expectS3ObjectPresent` para o que
tinha de ficar. Os objetos são de leitura pública — é assim que o site mostra as fotos —, então `200` é
arquivo no ar e `403`/`404` é arquivo removido.

Os arquivos vão para o bucket real (`clubinho-nib-storage`), sob o prefixo do `ENVIRONMENT` da API local
(`local/uploads/...`). Uma varredura do que sobrou de rodadas antigas está na API:
`node scripts/s3/audit-orphans.js`.

Nem as seções nem as mídias vêm ordenadas pela API, e os botões de remover seção e remover foto são
numerados pela posição na tela. Os testes por isso releem a página antes de clicar e calculam a posição do
alvo (`positionOf`): um número fixo removeria outro item quando o banco devolvesse a lista em outra ordem.

## Proteções da tela de edição

`edit/pages-edit-safety.spec.ts` cobre o que protege o administrador enquanto ele edita: a mensagem que a
API recusou chega inteira ao formulário (o teste força um 422 com `page.route`), sair pelo menu ou pelo
botão "Voltar para a lista" com rascunho pendente pede confirmação — e "Continuar editando" preserva o que
estava digitado —, e o botão de excluir fica travado enquanto a exclusão acontece (o teste atrasa o
`DELETE` para reproduzir a janela em que o clique duplo cabia).

## Página pública de ideias

`flows/ideas-page-view.spec.ts` cobre a tela que o professor abre pelo link compartilhado: o cabeçalho
resume o que a página tem, cada seção vira um cartão com uma linha por tipo de mídia, a galeria abre só o
tipo daquela seção, e no celular a página não rola para o lado e a galeria ocupa a tela inteira. O último
cenário guarda a edição pelo cabeçalho, que antes ia para `/adm/editar-pagina-ideias` sem o id — uma rota
que não existe.

## Convenções

- Cada teste cria seus dados pela API (`support/api.ts`) com `uniqueSuffix()` e os remove em `afterAll`.
- Seletores: papéis acessíveis (`getByRole`) e o `data-testid` `<feature>-<componente>[-id]` (`support/ui.ts` tem os gestos do MUI).
- Um módulo testado em `unit` não pode puxar React ou Material UI em tempo de execução; importe constantes do módulo puro,
  não do barrel de UI. O loader `support/node-esm-loader.mjs` só resolve as importações de diretório do MUI que sobram.
- Rode uma rodada por vez: os projetos de navegador compartilham `.auth/admin.json`.
- Quem confere arquivo no S3 usa o `fetch` do Node (`support/s3.ts`), e não o cliente do Playwright: um
  contexto novo aberto no meio do teste atropela os arquivos de trace da rodada.
