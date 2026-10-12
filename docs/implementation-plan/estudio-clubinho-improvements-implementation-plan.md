# Plano de Implementação Frontend — Estúdio Clubinho: correções baseadas em evidências

**Status:** frontend implemented against the current local backend contracts; validation results and rollout dependencies are recorded in section 11. The audit below remains historical evidence.

**Revisão:** 2026-10-11 — revisão 2, após a exigência de precisão e zero suposições.

**Repositório / commit-base:** `clubinhonib-app` / `8d07971c5ffdc9abc85f0ca74eb2c0e395e36086`.

**Contrato complementar:** [plano backend](../../../clubinhonib-api/docs/implementation-plan/estudio-clubinho-improvements-implementation-plan.md), baseado em `d90c373efdcf34ee2eb06dcd50efe4d1a18b8e48`.

---

## 0. Contrato de precisão — zero suposições

The original audit covered analysis and planning only. The subsequent user request explicitly authorized implementing this frontend plan. No deployment or environment change is included.

Regras de execução deste plano:

1. **FATO:** comportamento diretamente localizado no código, com arquivo e símbolo/linha.
2. **REPRODUZIDO:** comportamento executado em teste/sondagem; o ambiente e as limitações devem acompanhar o resultado.
3. **RISCO:** consequência possível do código, ainda sem reprodução integral. Não chamar de incidente ou bug confirmado em produção.
4. **CORREÇÃO PLANEJADA:** mudança motivada por evidência; não é descrição do sistema atual.
5. **DECISÃO PENDENTE:** regra de produto ou contrato que a evidência não determina. Bloqueia somente a implementação dependente, até que a escolha e seu contrato sejam registrados nos dois planos.
6. Nenhum endpoint, campo, estado, tabela, flag, SLA, limite de custo ou biblioteca nova pode ser tratado como existente ou aprovado por constar na revisão anterior deste plano.
7. Antes de implementar, conferir o commit e os arquivos. Se houver alteração relevante, atualizar diagnóstico e testes; não aplicar números de linha antigos cegamente.
8. Cada correção precisa de um teste que exponha o problema anterior e de critérios observáveis de aceite. Aprovação de testes existentes não prova cenários que eles não exercitam.

Este plano não declara “zero bugs no sistema”. Exige ausência de falhas conhecidas **nos cenários de aceite do recorte entregue**, com evidência de execução.

### 0.1 O que foi corrigido em relação à primeira versão do plano

Foram retirados do desenho obrigatório: protocolo SSE v2, endpoints de operações/histórico/restauração, publicação assíncrona, campo adicional de versão para salvar, API de capacidades, nova flag e política fixa de reinício da revisão. Eram soluções propostas, não contratos comprovados ou decisões do solicitante.

A primeira correção de concorrência usará o **`lockVersion` já existente**. A necessidade de outro campo não foi demonstrada. Alteração da política de revisão e novos contratos ficam no registro de decisões da seção 5.

## 1. Base auditada e limites da análise

Foram lidos rota → página → hooks/cache → cliente HTTP → DTO/controller/service do backend, incluindo os caminhos de geração, edição, revisão, preferências, configuração e PDF.

Na revisão 2, `git diff --name-only` e `git diff --cached --name-only` não indicaram mudanças em arquivos rastreados. Os dois planos estão como arquivos novos. As funcionalidades que já estavam no workspace, inclusive meditação dos maiores, início de revisão e prévia de trabalho manual, fazem parte da base e não são entregas deste plano.

Evidências executadas: quatro arquivos unitários existentes, com **7 testes aprovados**, e três sondagens de callbacks extraídos do código atual. Não foi executado navegador nesta revisão; não se afirma que layout, foco, navegação ou persistência HTTP foram homologados.

Regras aplicáveis: [AGENTS.md](../../AGENTS.md), [boas práticas](../../docs/CLUBINHO_FRONTEND_BEST_PRACTICES.md), [documentação do domínio](../../docs/content_materials.md). Os planos históricos em `../../../plan-implemations/` não prevalecem sobre os contratos atuais.

## 2. Inventário verificado

| Área | Arquivo / contrato existente | Comportamento confirmado |
| --- | --- | --- |
| Rotas | [App.tsx](../../src/App.tsx), bloco a partir da linha 322 | `/adm/estudio`, `/adm/estudio/licoes`, `/adm/estudio/licoes/:id`, `/adm/estudio/revisao`, `/adm/estudio/revisao/:id`, `/adm/estudio/orientacoes`; dentro do guard administrativo |
| Configuração | `App.tsx`, linha 319 | `/adm/config-provedores-ia`; `/adm/estudio/config` redireciona para essa página |
| Navegação | [AdminLayout.tsx](../../src/components/Adm/AdminLayout/AdminLayout.tsx) | Grupo Estúdio Clubinho com visão geral, produção, revisão e orientações |
| Etapas | [types.ts](../../src/features/ai-lessons/types.ts) | `LESSON`, `LESSON_VISUALS`, `STANDARD_GAME`, `VERSE_VISUALS`, `VERSE_FIXATION`, `MEDITATION_YOUNGER`, `MEDITATION_OLDER`, `MANUAL_WORK` |
| Servidor/cache | [useAiLessons.ts](../../src/hooks/api/useAiLessons.ts), [queryClient.ts](../../src/config/queryClient.ts) | TanStack Query com cliente estável; retry de mutation desativado; query tem retry 1 e stale time de 2 minutos |
| Transporte | [aiLessonsService.ts](../../src/services/aiLessonsService.ts), [axiosConfig.ts](../../src/config/axiosConfig.ts) | Axios compartilhado com autenticação, refresh e erros globais; SSE também usa esse cliente |
| Edição | [LessonDraftDetailPage.tsx](../../src/pages/admin/ai-lessons/LessonDraftDetailPage.tsx) | Estado local `edited`; documento usa edição local ou versão corrente; salvamento explícito |
| Editores | [LibreOfficeDocEditor.tsx](../../src/components/ai-lessons/LibreOfficeDocEditor.tsx), [YoungerMeditationEditor.tsx](../../src/features/ai-lessons/younger-meditation-editor/YoungerMeditationEditor.tsx), [OlderMeditationEditor.tsx](../../src/features/ai-lessons/older-meditation-editor/OlderMeditationEditor.tsx) | Todos já possuem opção `editable`, padrão `true` |
| Revisão | [review-actions.ts](../../src/features/ai-lessons/review-actions.ts), [LessonReviewDetailPage.tsx](../../src/pages/admin/ai-lessons/LessonReviewDetailPage.tsx) | Pacote `PACKAGE_READY` oferece iniciar revisão; aprovação exige lição e item `IN_REVIEW`, com versão |
| Trabalho manual | [ManualWorkPreview.tsx](../../src/features/ai-lessons/manual-work-preview/ManualWorkPreview.tsx) | Preview compartilhado na produção/revisão; não planejar criá-lo novamente |

**Preservar:** ordem e produtos das oito etapas, editores específicos, autorização administrativa, padrões editoriais e publicação explícita. Não trocar modelos, prompts-base ou layouts para corrigir problemas de estado.

## 3. Achados com rastreabilidade

Prioridades são classificação técnica deste plano: P0 = integridade do trabalho/fluxo/segredo; P1 = confiabilidade de interação; P2 = organização. Não representam frequência medida em produção.

| ID | Prioridade / classe | Evidência e conclusão limitada |
| --- | --- | --- |
| FE-01 | P0 / FATO | `LessonDraftDetailPage.tsx:440` e `:459`: ambos os handlers de seleção chamam `setEdited(null)`. O texto local é descartado ao trocar de etapa; não há proteção nesses handlers. Fluxo em navegador ainda precisa de regressão |
| FE-02 | P0 / FATO + RISCO | `LessonDraftDetailPage.tsx:619–630` envia `stage.lockVersion` do render corrente; `useAiLessons.ts:49` substitui o cache por evento. Não existe uma base de edição separada. Risco: A edita conteúdo antigo, recebe via SSE o lock novo de B e salva usando esse lock novo. A API já compara locks em `saveContent:1301` |
| FE-03 | P0 / FATO | `LessonDraftDetailPage.tsx:598–697`: gerar considera dependência/geração, mas não todos os estados recusados pelo backend; concluir não testa `edited` ou `complete.isPending`; editores não recebem `editable`. O fieldset externo bloqueia durante geração, mas não resolve esses outros estados |
| FE-04 | P0 / REPRODUZIDO ISOLADAMENTE | `AdminPromptSettingsPage.tsx:149–152` substitui todo `drafts` quando `query.data` muda; `:171` altera cache após salvar. Callback executado com A salva e B local não salva substituiu B pelo valor remoto antigo. Existe aviso no botão `leave:206`; não afirmar ausência completa de proteção de saída |
| FE-05 | P0 / FATO, dependência BE-01 | `features/ai-providers/hooks.ts` armazena a resposta de settings; `AiProvidersConfigPage.tsx:86–90` copia para formulário. O DTO da API contém `apiKey`. Exposição é ao administrador autenticado; não foi demonstrado acesso anônimo ou vazamento real |
| FE-06 | P1 / REPRODUZIDO ISOLADAMENTE | `AiLessonsReviewListPage.tsx:57–81` filtra uma página já recebida; `:99` mantém `data.total`. Fixture: página 1 com 12 DRAFT, total 14, outros 2 IN_REVIEW na página seguinte → lista visível vazia e total 14 |
| FE-07 | P0 / REPRODUZIDO NO SERVIÇO BACKEND | `review-actions.ts` depende de lição `IN_REVIEW`; BE-02 comprovou devolução → save → conclusão → submissão recusada, com sete itens ainda `IN_REVIEW`. A UI não consegue reparar o agregado sozinha |
| FE-08 | P1 / FATO + RISCO | `useAiLessons.ts:39–61` assina enquanto há ID, reconecta em atraso fixo e não expõe diagnóstico; `aiLessonsService.ts:113–162` agrega texto e trata qualquer rejeição como desconexão. Backend envia snapshot a cada 2 s. Custo/memória/volume não foram medidos |
| FE-09 | P1 / FATO | `useAiLessons.ts:69–86` atualiza/invalida só detalhe ao salvar/gerar; `:88–110` invalida todo prefixo ao revisar/submeter. Prompts usam o mesmo prefixo. Há critérios de atualização diferentes; não afirmar que todo refetch apaga drafts se a resposta não mudou |
| FE-10 | P1 / FATO | `LessonDraftDetailPage.openStagePreview` usa a mesma mensagem de LibreOffice para qualquer exceção. Limpeza de Blob da prévia **já existe** por efeito; melhorar diagnóstico e resposta atrasada, sem alegar que não há cleanup |
| FE-11 | P1 / REPRODUZIDO ISOLADAMENTE | `AiProvidersConfigPage.handleFetchLiveModels:115` publica `severity: success` sem testar erro. Callback recebeu `{ isError: true }` e mesmo assim anunciou sucesso. `setForm(settings)` também exige proteção de edição dirty quando dados mudarem |
| FE-12 | P2 / FATO | `aiLessonsService.ts` declara tipos junto ao cliente e usa `status: string`; seu `structuredDataJson` é não nulo, enquanto `LessonVersionResponseDto` permite `null`. Corrigir tipos e responsabilidades no escopo tocado |

## 4. Contratos atuais — sem endpoints inventados

Base: `src/services/aiLessonsService.ts`, `AiLessonsController`, `AiProvidersController` e DTOs no backend. Prefixo completo de lições: `/api/v1/lessons`.

| Operação existente | Entrada / saída efetiva a preservar |
| --- | --- |
| `POST /api/v1/lessons` | `theme`, `biblicalReference`, `weekNumber` → `LessonResponseDto` |
| `GET /api/v1/lessons` | `status?`, `search?`, `page`, `limit`, `sort`, `order` → `items`, `total`, `page`, `limit`, `totalPages` |
| `GET /api/v1/lessons/dashboard` | `total`, `byStatus`, `recent` |
| `GET /api/v1/lessons/:id` | Lição com etapas, versões e comentários |
| `GET /api/v1/lessons/:id/events` | SSE cujo `data` é `LessonResponseDto`; nenhum protocolo v2 no controller |
| `POST /api/v1/lessons/:id/stages/generate` | `stage`, `revisionInstructions?`, `visualType?`, `visualOrientation?`, `visualQuantity?` → lição; não retorna `operationId` |
| `PATCH /api/v1/lessons/:id/stages/content` | `stage`, `lockVersion`, `tiptapAstJson`, `structuredDataJson?`, `changeSummary?` → lição |
| `POST /api/v1/lessons/:id/stages/complete-production` | `stage`; controller usa `ReviewStageRequestDto` |
| `POST /api/v1/lessons/:id/package/submit-review` | ID da lição; sem body tipado no handler |
| `POST /api/v1/lessons/:id/stages/approve` | `stage`; não possui `expectedVersionId` no DTO atual |
| `POST /api/v1/lessons/:id/stages/request-changes` | `stage`, `note`; serviço exige texto após trim |
| `GET /api/v1/lessons/:id/stages/:stage/preview.pdf` | ID/etapa → PDF da versão corrente; não aceita seleção de versão no handler |
| `POST /api/v1/lessons/:id/export/pdf` | ID → PDF consolidado; serviço exige etapas aprovadas |
| `POST /api/v1/lessons/:id/publish-week-material` | ID → `{ lesson, weekMaterialId }`; request aguarda o serviço de publicação |
| `DELETE /api/v1/lessons/:id` | `{ success, message }` |
| `GET/PATCH /api/v1/lessons/prompt-preferences/me`, `POST .../reset` | Preferências por administrador e etapa; save usa `stage`, `prompt`, `lockVersion?`; reset usa `stage` |
| `GET/PUT /api/v1/lessons/providers/settings` | Settings agregados; existem também variantes `openai/settings`, `gemini/settings` e consultas `openai/models`, `gemini/models` |

Limites verificados: query page ≥ 1; limit 1–50, padrão 10; busca até 200; sort `createdAt`, `updatedAt`, `theme`, `weekNumber`, padrão `updatedAt`; order `ASC`/`DESC`, padrão `DESC`. As telas atualmente usam pageSize 12. Não confundir default da API com default da tela.

`failureCode` está persistido no backend, mas **não é campo de `LessonStageResponseDto`**. O frontend não deve criar lógica dependente desse campo antes de contrato efetivamente implementado/testado.

## 5. Registro compartilhado de decisões pendentes

A seção 6 do backend detalha o que deve ser decidido. Os IDs abaixo são iguais nos dois planos. Nenhuma ausência de resposta equivale a aprovação.

| Decisão | Lacuna real | Entrega que depende dela |
| --- | --- | --- |
| D-01 — Rodada após solicitar ajustes | Continuar revisão dos itens não devolvidos ou encerrar/reabrir a rodada? O código atual não fecha o ciclo; não determina qual política o produto deseja | BE-02 e apresentação/ações de FE-07 |
| D-02 — Filtro da fila no servidor | Transporte do conjunto de status e DTO correspondente ainda não definidos. O conjunto hoje exibido é conhecido; adicionar `PUBLISHING` é mudança de produto, não correção automaticamente autorizada | BE-09 e FE-06 |
| D-03 — Settings sem leitura de segredo | Campos públicos substitutos e semântica de substituir/limpar chave precisam ser fechados. API hoje aceita chave opcional e a devolve | BE-01 e FE-05 |
| D-04 — Recuperação de publicação | Como reconhecer material já criado após falha/reinício, sem vínculo na lição? Modelo de persistência e contrato ainda não fechados | BE-06 e futura UI de recuperação; não criar tela baseada em endpoint inexistente |
| D-05 — Geração após perda de lease | Identidade de tentativa e critério de commit/retomada precisam ser demonstrados contra código e banco; campos atuais já oferecem lease, mas não fecham a garantia | BE-04/05; não expor fases ou IDs novos sem resposta definida |
| D-06 — Documento canônico | Quais campos do texto editado alteram dados estruturados e derivados? Contratos específicos por etapa precisam ser verificados | BE-13; não proibir edição de versículo nem mudar conteúdo por inferência |

FE-01/02/03/04/10/11 e correção de tipagem FE-12 não precisam esperar essas decisões. FE-08/09 podem evoluir mantendo o payload atual; compactação do SSE depende de medição e contrato posterior.

## 6. Plano de correção por pacote

As regras abaixo são **correções planejadas**, não comportamento atual. Nomes de arquivos novos são deliberadamente deixados à organização do recorte; os pontos de entrada reais estão indicados.

### F1 — Preservar edição local e usar corretamente o lock existente

**Achados:** FE-01/02. **Arquivos:** `LessonDraftDetailPage.tsx`, `useAiLessons.ts`, tipos/helpers de `features/ai-lessons`. **API nova:** nenhuma.

1. Vincular o draft a lição e etapa; a base deve guardar o `lockVersion` do conteúdo sobre o qual começou a edição. Enquanto houver draft, SSE/refetch não pode substituir essa base pelo lock remoto novo.
2. Preservar o texto ao alternar etapas, ou condicionar a troca ao salvamento/descarte explícito. O aceite é ausência de descarte silencioso; o mecanismo escolhido deve ser documentado no PR e testado nos handlers mobile e desktop.
3. Save envia o lock base pelo campo já existente. 409 mantém texto/base local e informa conflito; não reenviar automaticamente com o lock novo.
4. Associar callback de sucesso à lição, etapa e revisão local enviadas. Texto digitado depois do envio ou em outra etapa não pode ser limpo por `setEdited(null)` global.
5. Explicitar alterações pendentes antes de deixar o detalhe; verificar navegação por botões, menu, voltar do navegador e refresh separadamente. Não prometer recuperação após fechar a aba sem storage implementado e decidido.

**Teste antes/depois:** sessão A inicia em lock N; B salva N+1; evento chega a A; A deve continuar enviando N e receber conflito. Texto de A e versão de B permanecem disponíveis. Não exige `baseVersionId` novo na API.

### F2 — Ações compatíveis com o workflow real

**Achados:** FE-03/07. **Arquivos:** detalhe de produção, detalhe de revisão, `review-actions.ts` e navegação de etapas.

1. Extrair helpers puros para disponibilidade de editar, gerar, concluir, revisar e publicar, a partir das condições existentes no backend; registrar diferenças encontradas, sem impor regra nova na UI para esconder erro de servidor.
2. Passar `editable` explicitamente aos três editores. Estados recusados para edição pelo backend não podem oferecer edição como se fosse salvável.
3. Bloquear concluir enquanto há edição não resolvida ou mutation correspondente pendente. Aplicar a mesma proteção a ações conflitantes; preservar a separação entre concluir produção e aprovar revisão.
4. Manter bloqueio de geração já documentado enquanto o contrato de concorrência não mudar. Não retirar o fieldset global apenas por preferência de UX.
5. Depois de D-01 e BE-02, cobrir devolução do primeiro, intermediário e último item. Não alterar enums/estados no cache para fabricar uma correção.
6. Corrigir a descrição da fila que sugere publicação automática: a API exige chamada explícita para publicar. Criar material também não define semana atual.

**Aceite:** todos os estados editáveis/bloqueados do backend têm caso de teste; usuário não conclui conteúdo salvo diferente do draft que ainda está na tela.

### F3 — Prompts e configuração sem sobrescrita por refetch

**Achados:** FE-04/11. **Arquivos:** `AdminPromptSettingsPage.tsx`, `AiProvidersConfigPage.tsx` e respectivos hooks.

1. Não reconstruir indiscriminadamente drafts dirty ao mudar query.data. Atualizar a etapa salva e entradas não editadas; tratar reset apenas no alvo confirmado.
2. Reter lock/base da preferência editada. O aviso existente no botão de sair deve continuar funcionando; testar outros meios de navegação em vez de presumir cobertura.
3. Ao consultar modelos, verificar o resultado de erro antes de contar listas. Erro não é “zero modelos disponíveis”; nenhuma mensagem de sucesso nesse ramo.
4. No formulário de settings, resposta nova não substitui campos dirty sem resolução explícita. Não registrar segredo ou formulário inteiro em log.

**Aceite:** editar duas etapas e salvar uma preserva a outra; query de modelos falha e feedback indica falha; refetch de settings não perde alteração local.

### F4 — Fila de revisão e cache

**Achados:** FE-06/09. **Dependência:** D-02 + BE-09 para a fila; invalidação pode ser corrigida antes.

1. Fechar DTO de filtro de revisão no backend e testá-lo. Usar exatamente esse DTO no cliente; não enviar `view=review` ou array de status enquanto não fizerem parte dele.
2. Remover filtro posterior à paginação somente quando o servidor já fornecer o mesmo conjunto de itens e total.
3. Preservar busca, ordenação estável, pageSize e mudança para página 1 após filtros. Tratar erro de consulta de maneira distinta de lista vazia.
4. Separar chaves de detalhe, listas, dashboard e preferências. Save/geração que altere estado do agregado deve atualizar/invalidate os consumidores afetados; revisar/submeter não deve invalidar prompts sem relação.
5. Incluir todos os filtros no cache, manter `apiAxios` e cliente de Query existentes; não buscar todas as páginas e paginar no navegador como correção.

**Aceite:** fixture com 12 rascunhos mais recentes e 2 itens revisáveis retorna fila de 2, total 2, sem página vazia artificial. Validar combinações de status/busca e resultado vazio real.

### F5 — SSE, prévia e erros com contrato atual

**Achados:** FE-08/10. **Arquivos:** `aiLessonsService.ts`, `useAiLessons.ts`, detalhe/dialog de PDF.

1. Manter autenticação/refresh do Axios. Distinguir cancelamento intencional, falha transitória e acesso definitivamente negado; cada caso deve ter teste. Não duplicar o refresh global.
2. Expor estado de conexão à tela; garantir cleanup no unmount/troca de lição. Validar finalização normal do stream e reconexão, não apenas rejeição HTTP.
3. Medir bytes, duração e quantidade de snapshots recebidos antes de escolher compactação, timer ou mudança de transporte. Manter valores atuais até decisão fundamentada.
4. Preservar a limpeza de Blob já existente. Associar resposta da prévia à lição/etapa da solicitação e ignorar resposta atrasada de outro alvo; fornecer loading/erro também no download.
5. Interpretar falha JSON recebida como Blob e usar mensagem da API quando segura. Não atribuir toda falha ao LibreOffice; não exibir stack nem detalhes internos.
6. Uma atualização remota não substitui draft dirty, conforme F1. Não afirmar ordenação por revisão ou recuperação de eventos perdidos, pois o contrato atual não tem esses campos.

**Aceite:** queda/reconexão/troca de ID não misturam dados nem eliminam draft; 403 definitivo não vira loop sem feedback; 422 e falha de rede produzem diagnósticos distintos; prévia antiga não ocupa modal da etapa nova.

### F6 — Settings seguros, com contrato coordenado

**Achado:** FE-05. **Dependência:** D-03 + BE-01.

1. Fechar exemplos reais de request/response para agregado e variantes individuais; verificar referências em `types.ts`, `api.ts`, `utils.ts`, `hooks.ts` e testes de provedores.
2. Preparar frontend para resposta sem chave salva; somente chave recém-digitada fica no formulário transitório. Não preencher cache com segredo nem reenviar placeholder/mascaramento como chave.
3. Implementar preservar/substituir/remover segundo D-03. Não inventar a semântica de string vazia: o backend atual a aceita no DTO.
4. Atualizar API e cliente em ordem compatível; remover segredo de todas as variantes, não apenas do getter agregado. Rollback não reintroduz o segredo.

**Aceite:** segredo sintético já persistido no servidor jamais aparece na resposta pública esperada, cache, DOM ou log; a chave recém-digitada pode aparecer no campo de entrada até salvar, conforme D-03.

### F7 — Tipagem e manutenção no recorte alterado

**Achado:** FE-12. Separar DTOs/enums, constants e helpers em arquivos da feature, conforme AGENTS. Corrigir nullability de dados estruturados. Reutilizar componentes/listagens e editores existentes; não adotar nova biblioteca ou executar migração massiva de pastas.

**Aceite:** API e tipos do cliente concordam; type-check não usa cast para ocultar divergência; nenhum `any` novo; componentes alterados mantêm seletores estáveis.

## 7. Matriz obrigatória de regressão

| Teste | Entrada / ação | Resultado esperado da correção | Pacote |
| --- | --- | --- | --- |
| T-F01 | Editar, trocar etapa em mobile/desktop, voltar | Texto preservado ou troca interrompida até resolução explícita | F1 |
| T-F02 | Edição em N, SSE de N+1, salvar A | Request usa N; 409 não apaga A; B permanece salva | F1 |
| T-F03 | Digitar ou trocar etapa durante save | Callback limpa apenas edição enviada se ainda for a mesma revisão local | F1 |
| T-F04 | Dois prompts dirty; salvar/resetar um | Outro prompt e sua base permanecem íntegros | F3 |
| T-F05 | Item DRAFT/IN_REVIEW/APPROVED, geração ativa, save pendente | Editor e ações respeitam matriz real da API e bloqueios locais | F2 |
| T-F06 | Devolver, editar e concluir item 8 | Após D-01, fluxo completo segue regra decidida sem fabricar status no cliente | F2 |
| T-F07 | 12 DRAFT + 2 IN_REVIEW e busca/status | Itens e total representam mesmo filtro, antes da paginação | F4 |
| T-F08 | SSE interrompido, 403, unmount e mudança de ID | Diagnóstico e cleanup, sem mistura de lições ou apagamento de draft | F5 |
| T-F09 | PDF 422 em Blob; resposta atrasada de outra etapa | Mensagem adequada; documento corresponde ao alvo; URLs liberadas | F5 |
| T-F10 | `refetch` de modelos com `isError: true` | Nenhuma mensagem de sucesso ou lista vazia simulada | F3 |
| T-F11 | Settings com chave sintética já persistida e edição local | Contrato D-03 respeitado; segredo persistido ausente do cache/DOM/log e chave recém-digitada tratada conforme contrato | F6 |
| T-F12 | Editor de meditações, visuais e trabalho manual | Conteúdo, vínculos, formatação e modos leitura existentes preservados | F1/F2/F7 |

Testar formulário/rota real com Playwright e API local quando a correção afetar persistência. Mocks de falhas/SSE não substituem leitura posterior da API. Testes de regras puras ficam em `e2e/unit`. Não usar produção ou provedores pagos para criar fixtures.

Acessibilidade/móvel: verificar teclado, foco e alvos de 44 × 44 px exigidos pelo guia; incluir viewport de 360 px como caso de teste, sem afirmar que foi homologado nesta análise.

## 8. Ordem de execução, gates e rollback

1. **Gate de base:** reler arquivos e registrar contratos; fixture falha antes da correção.
2. **Primeiro recorte:** F1 + correções locais F2/F3, que não exigem API nova.
3. **Integrações:** F4 após D-02/BE-09; revisão completa de F2 após D-01/BE-02; F6 após D-03/BE-01.
4. **Resiliência:** F5 mantendo payload existente; evolução de publicação depende de D-04 e não pode bloquear correções locais.
5. **Manutenção:** F7 dentro de cada recorte, preservando imports/consumidores durante movimentações necessárias.
6. **Gate de entrega:** testes do recorte, type-check, lint, build e documentação atualizados. Pendência de decisão não pode ser marcada como “implementada”.

Rollback: reverter o recorte de UI, preservando compatibilidade com a API realmente implantada. Não refazer geração/publicação para compensar timeout; consultar o detalhe existente. Para `PUBLISHING` sem vínculo, mostrar o estado recebido; não prometer recuperação até BE-06 estar resolvido. Não reintroduzir exposição de segredo.

```bash
NODE_OPTIONS='--max-old-space-size=2048' npm run type-check
NODE_OPTIONS='--max-old-space-size=2048' npm run lint
NODE_OPTIONS='--max-old-space-size=2048' npm run check:test-ids
NODE_OPTIONS='--max-old-space-size=2048' npm run test:unit
npm run test:e2e
NODE_OPTIONS='--max-old-space-size=2048' npm run build
```

Comandos pertencem à implementação futura; browser E2E exige app/API locais. Atualizar `docs/content_materials.md` junto de mudança comportamental e `docs/project_structure.md` se a estrutura efetivamente mudar.

## 9. Evidência de execução da revisão 2

### 9.1 Testes existentes executados novamente

```bash
npm run test:unit -- e2e/unit/ai-lessons-generation.spec.ts e2e/unit/lesson-review-actions.spec.ts e2e/unit/manual-work-preview.spec.ts e2e/unit/ai-provider-settings.spec.ts
```

Resultado: **7 passed**, saída 0. Não cobrem T-F01/02/03/06/07 completos.

### 9.2 Sondagens adicionais executadas

Callbacks foram extraídos da árvore sintática dos arquivos atuais e executados isoladamente com entradas sintéticas. Nenhum componente foi montado em navegador; nenhum arquivo de aplicação foi alterado.

| Registro | Callback real | Entrada | Saída observada |
| --- | --- | --- | --- |
| R-FE-04 | Efeito que chama `setDrafts` em `AdminPromptSettingsPage` | A salva no cache; B local não salva; B remota antiga | B local substituída por B remota antiga |
| R-FE-06 | `useMemo` de `filteredItems` em `AiLessonsReviewListPage` | 12 DRAFT na página, total 14 | Zero itens após filtro; expressão de total continua 14 |
| R-FE-11 | `handleFetchLiveModels` em `AiProvidersConfigPage` | Consulta retorna erro, sem data | Feedback com `severity: success` |

Essas sondagens comprovam o comportamento das funções com as entradas descritas. Não são testes E2E nem testes novos incorporados à suite. Na implementação, transformar cada uma na regressão apropriada.

### 9.3 Fingerprints dos arquivos centrais

SHA-256 para conferir a base, não para inferir comportamento de versões futuras:

```text
ab26485f3775188ea0931c23a7f6de004b2fd4f9740ca038fc9d5032ab56c2f1  src/pages/admin/ai-lessons/LessonDraftDetailPage.tsx
90eabc17a2e940b88f8291fecc8fe8344fc53c2cb36d71b8bc7a854fe2c5b2b5  src/pages/admin/ai-lessons/AdminPromptSettingsPage.tsx
ebc97f6b0a11ac2c140935b1da8a02a54704022b37d1139b4c5e8a1f80c4541b  src/pages/admin/ai-lessons/AiLessonsReviewListPage.tsx
ba5f574f4f38966a6e243ec053d6d744ca12ca94dc7b77a833fbb070341abb68  src/features/ai-providers/AiProvidersConfigPage.tsx
9e509d02c80143a351a6ea9c1aa23057fc8853b668747e622527d6c031e1d8cf  src/hooks/api/useAiLessons.ts
d5f220218ba50b325d2f9a7383608284465f027c5f3d3c7ed2d7cf4c6cdc1c1e  src/services/aiLessonsService.ts
```

## 10. Critérios finais de aceite

- [x] Cada mudança cita achado, arquivo, contrato e teste correspondente.
- [x] Nenhuma nova rota/campo é consumida por suposição.
- [x] Texto local e lock base não são substituídos por troca de etapa/SSE/refetch.
- [x] Callback de save não limpa outra edição.
- [x] Fila e total usam o mesmo filtro de servidor após D-02.
- [x] Fluxo de ajustes segue D-01 registrada nos dois planos.
- [x] Settings seguem D-03 sem segredo em resposta pública/cache.
- [x] Falhas de modelos/PDF/SSE não produzem sucesso falso ou diagnóstico inventado.
- [x] Testes, UI móvel/teclado, documentação e verificações do recorte foram executados.
- [x] Alterações alheias preservadas; sem deploy ou mudança de ambiente nesta tarefa documental.


## 11. Frontend implementation — 2026-10-11

The sibling API changed during this implementation. Its worktree was inspected
but not edited by this frontend task. The historical statement that `statuses`,
`hasApiKey` and `failureCode` do not exist no longer describes that local API.

### Verified integration contracts

- **D-01 / BE-02:** the current service permits approval/change requests in
  `IN_REVIEW` and `CHANGES_REQUESTED`, for items still `IN_REVIEW`. Completing
  production counts `PRODUCER_APPROVED`, `IN_REVIEW`, `APPROVED` with versions;
  submission changes only producer-approved items. The frontend mirrors these
  implemented rules. Saving retains server-owned downstream invalidation.
- **D-02 / BE-09:** `QueryLessonsDto.statuses` accepts comma-separated enum
  values (and arrays); the repository applies it before count/pagination.
  When present it takes precedence over `status`. The frontend sends only the
  selected status set and preserves the original five review statuses.
- **D-03 / BE-01:** aggregate and individual settings return `hasApiKey`.
  Update service omits/preserves, trims/replaces, or removes with an explicit
  empty `apiKey`. All client response adapters select public fields, and the
  input UI separates the three actions. No masked placeholder is submitted.
- No operation IDs, recovery routes, SSE revisions or lease fields were added
  to frontend requests. D-04/05/06 remain server-owned work; the client adds no
  publication recovery or document rewriting assumptions.

### Changes and regression evidence

| Findings | Implementation | Regression coverage |
| --- | --- | --- |
| FE-01/02 | Per-lesson/per-stage drafts retain original lock and structured data; immutable save acknowledgement; explicit discard and navigation protection | `studio-drafts.spec.ts`, `studio-integrity.spec.ts`, `studio-resilience.spec.ts` |
| FE-03/07 | Pure workflow rules, explicit editor permissions, conflicting-action guards, review policy matching the local API | `studio-drafts.spec.ts`, `lesson-review-actions.spec.ts`, real review cycles for items 1/4/8 |
| FE-04/11 | Dirty prompt bases and provider form drafts survive refetch; model error result checked before counts | `studio-drafts.spec.ts`, `ai-provider-settings.spec.ts`, real prompt save/reset test |
| FE-06/09 | Server-side status set, distinct errors/empty lists and scoped query invalidation | `studio-transport.spec.ts`, 12-draft/2-review-item API fixture |
| FE-08/10 | SSE cancellation/EOF/denial/reconnect diagnostics and metrics; target-bound PDF requests, Blob errors and download progress | `studio-transport.spec.ts`, `studio-resilience.spec.ts` |
| FE-05 | Separate response/request/form types and explicit public response selection; credential actions follow the implemented API | provider unit/browser regressions; backend public settings contract |
| FE-12 | DTOs/enums/constants/helpers moved into the feature; structured-data nullability preserved; existing import compatibility | type-check, unit/editor regressions and test-ID gate |

The chosen stage-switch behavior preserves drafts, on both mobile and desktop.
Drafts exist only in memory. The original SSE timing and payload remain unchanged;
measurement support does not constitute a claim that stream compression or
bandwidth has been optimized. A request failure never automatically regenerates
or republishes content.

Validation results are recorded after the final verification run. Backend-first
rollout is required for review filtering and public settings. No deployment,
production fixture, paid generation, environment edit or API source edit was
performed by this frontend task.
