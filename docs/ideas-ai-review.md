# Ideias compartilhadas — revisão e regeneração com IA

Complementa a seção "Compartilhar ideia" de [content_materials.md](content_materials.md).
Contrato da API: `clubinhonib-api/docs/api-ideas-enhancement.md`.

## Feature flag

`idea_ai_enhancement` liga todo o fluxo de IA das ideias, para o professor **e
para a administração**. Desligada:

- **Back:** não enfileira no envio, o worker não processa, todos os endpoints
  `/ideas-sections/:id/ai-enhancement*` respondem 403 (`IdeaAiEnabledGuard`) e a
  leitura da ideia e da fila não traz nada de IA (`aiEnhancement` e `aiStatus`
  ausentes; o filtro `aiStatus` é ignorado).
- **Front:** a revisão não mostra a faixa de IA, a comparação, as versões da IA
  nos materiais nem o diálogo de regenerar; a fila esconde o filtro "Melhoria por
  IA" e a etiqueta de estado nos cartões. A ideia é revisada e publicada só com
  o que o professor enviou.

O estado vem de `useFeatureFlagsContext().isEnabled(FEATURE.IDEA_AI_ENHANCEMENT)`.
No `./run.sh local` a flag é criada e ligada.

## Princípio: upgrade, não mudança total

A IA melhora a ideia que o professor compartilhou sem perder a ideia central, a
originalidade e o jeito de quem escreveu. A API reprova propostas que se
afastam demais do original (menos de 70% das palavras-chave mantidas, sem contar acento, maiúscula nem pequenos erros de grafia; 60% no
título) e mostra o motivo na guarda de essência da etapa 2; o original fica.

Vídeos (upload ou link do YouTube) nunca passam pela IA: aparecem como
"Vídeos não passam por melhoria", não contam no progresso e não podem ser
escolhidos em "Materiais escolhidos".

## Professor (`/compartilhar-ideia`)

- O aviso de processamento por IA (antes do envio e na tela de sucesso) só
  aparece com a flag `idea_ai_enhancement` ligada. A frase "o vídeo enviado não
  será alterado" só aparece quando há vídeo.

## Fila (`/adm/ideias-compartilhadas`)

- Filtro "Melhoria por IA": todas, pronta para revisar, IA trabalhando, IA falhou,
  sem melhoria. O filtro vai à API (`aiStatus`), não é aplicado na tela.
- Enquanto alguma ideia da página está na fila da IA ou processando, a lista se
  atualiza a cada 15 s (só com a aba visível).

## Revisão (`/adm/editar-ideias-compartilhadas/:id`)

### Estrutura visual

Uma coluna em largura total, na ordem de uso (celular e desktop):

1. **Cabeçalho enxuto:** voltar, "Revisar ideia compartilhada", o título da ideia e
   os chips (estado, visibilidade, materiais, data de envio).
2. **Faixa de IA (`idea-review-step-ai`):** no desktop é uma linha com o estado,
   as tentativas e o botão "Regenerar com IA…" à direita; no celular o botão
   ocupa a largura toda. Abaixo ficam só os avisos que importam (progresso,
   erro, limite), uma linha com a tentativa em comparação e o histórico
   recolhido. Com o limite atingido há um só aviso visível.
3. **Título e Descrição:** um bloco por campo, com o seletor Original | Versão
   IA e três colunas no desktop — **Original do professor | Melhorada pela IA |
   Texto final (vai ao ar)**. A versão escolhida ganha borda mais forte e um
   check. No celular as três empilham, na mesma ordem.
4. **Materiais:** um cartão só; cada arquivo aparece uma vez, com a comparação
   dentro dele.
5. **Publicar (`idea-review-publication`):** no desktop é uma barra fixa no
   rodapé da janela, em uma linha (checklist curta, destino, visibilidade,
   confirmação e "Publicar ideia"); no celular é o último cartão, e a barra
   fixa "Publicar ideia" continua no rodapé.

### Documentos com imagens

- **PDF visual** — só imagem (molde do Canva) ou com texto e imagens de conteúdo
  (caça-palavras) — ganha uma versão limpa, sem IA: o mesmo conteúdo com nitidez
  e níveis ajustados. Essa versão não tem DOCX nem edição, o texto deixa de ser
  selecionável, e a comparação avisa que o conteúdo é o mesmo.
- Fica "Mantido como enviado" (a etiqueta traz o motivo na dica) o PDF que não
  pôde ser tratado: muitas páginas, leitura falhou ou o servidor sem `pdftoppm`.
- Quando há versão da IA de um documento, um aviso lembra que ela é só texto e
  pede para conferir os dois arquivos antes de escolher
  (`idea-ai-document-text-only`).

### Etapa 1 — Melhoria com IA

- Mostra tentativas usadas/limite, progresso real por item da tentativa ativa,
  o motivo de falha (`IDEA_AI_ERROR_LABELS`) e por que a regeneração está
  bloqueada (`ideaAiRegenerateBlock`): ideia publicada, provedor sem
  configuração, tentativa em andamento ou limite.
- **Regenerar com IA…** abre `IdeaAiRegenerateDialog`: escopo (só o que falhou —
  sugerido quando há falha —, só texto, materiais escolhidos, tudo), orientação
  opcional (até 500 caracteres) e o custo em tentativas. Nada é pedido sem
  confirmação.
- **Cancelar melhoria** (tentativa ativa) não consome tentativa.
- **Histórico**: escopo, tentativa base, orientação, motivo e "Usar este
  resultado" para voltar a comparar uma tentativa anterior.
- Acompanhamento (`useIdeasSectionById`): consulta a cada 5 s só enquanto há
  tentativa ativa; pausa com a aba oculta e retoma ao voltar; erros 400/401/403/404
  encerram; erros transitórios esperam 10 s e param após 3 seguidos. As consultas
  periódicas não disparam toast global. Um 409 nas ações atualiza a tela.

### Etapa 2 — O que será publicado

- Para título e descrição: escolha Original/Versão IA e um campo editável com o
  **texto final**, que parte da versão escolhida. O que for digitado é o que a
  API publica (a escolha é registrada como `edited`). Trocar a versão volta o
  campo ao texto daquela versão.
- Diff acessível: no original, o que a IA removeu aparece riscado (`<del>`); na
  versão da IA, o que entrou aparece sublinhado (`<ins>`). Cada coluna continua
  legível mesmo com frases reordenadas.
- A guarda de essência é mostrada por campo, em lista, com o que fazer em seguida.
- Materiais aproveitados de outra tentativa, ou mantidos porque a nova falhou,
  são identificados (`IdeaAiMediaNotice`).
- Quando chega um resultado novo durante a revisão, as escolhas e o texto voltam
  às versões sugeridas e um aviso explica isso.
  O aviso oferece **Restaurar meu texto**, que devolve o título e a descrição
  que estavam na tela antes do resultado novo (só aparece se forem diferentes).
- **Usar todas as melhorias** e **Manter tudo original** pedem confirmação
  quando o título ou a descrição foram editados à mão, porque substituem o texto.
- Com uma única página de destino cadastrada, ela já vem selecionada; enquanto as
  páginas carregam, a mensagem "nenhuma página cadastrada" não aparece.

### Editar o documento melhorado

Para um documento (PDF/Word) com versão da IA, a etapa 2 mostra **Editar
documento** na coluna "Melhorada pela IA". Abre um editor tipo Word em tela cheia
com o conteúdo que a IA gerou; **Gerar PDF** cria o PDF e o DOCX novos e troca os
arquivos da versão da IA ("Editado manualmente" aparece no cartão).

- O editor é **isolado do Estúdio**: cópia própria em
  `src/features/ideas-sections/document-editor/` (TipTap), sem importar nada de
  `ai-lessons`. Mudanças lá não alteram esta tela, e vice-versa. O back também tem
  conversor próprio (`IdeaTiptapDocxProvider`).
- O aviso do topo lembra o princípio: melhorar e documentar com clareza, sem trocar
  etapas, materiais ou objetivos do professor. **Ver original** abre o arquivo
  enviado. A guarda de essência da IA não roda em edição humana.
- **Cancelar** com alterações pede confirmação. O botão **Gerar PDF** só habilita
  depois de uma alteração.
- Resultados antigos (sem o conteúdo do editor guardado) abrem com o texto extraído
  do PDF e um aviso de que a formatação precisa ser refeita.
- Bloqueado com a IA trabalhando, ideia publicada ou resultado trocado (409).
- Os arquivos antigos saem do S3 só depois de salvar e só se nenhuma outra
  tentativa os usar; se o salvamento falhar, os novos são descartados.

### Publicação

- Título e descrição precisam de 1–120 e 1–2000 caracteres.
- Com a IA ainda trabalhando, "Publicar sem a IA" cancela a tentativa e publica o
  que foi revisado nas etapas 2 e 3, sem descartar edições.
- Duplo clique não publica duas vezes. Sucesso mostra um aviso e volta à fila.
  Decisões desatualizadas (409) recarregam a revisão e pedem nova confirmação.
- Ideia publicada: todas as etapas ficam só para consulta e sem ações de IA.
- Alterações não salvas são protegidas ao sair da tela.

## Testes

- `e2e/unit/idea-ai.utils.spec.ts`, `e2e/unit/idea-ai.regeneration.spec.ts`.
- `e2e/flows/idea-ai-review.spec.ts` usa respostas simuladas da API (sem chamar o
  provedor de IA nem gastar tokens).
