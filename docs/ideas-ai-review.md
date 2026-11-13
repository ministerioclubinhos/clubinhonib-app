# Ideias compartilhadas — revisão e regeneração com IA

Complementa a seção "Compartilhar ideia" de [content_materials.md](content_materials.md).
Contrato da API: `clubinhonib-api/docs/api-ideas-enhancement.md`.

## Feature flag

`idea_ai_enhancement` liga todo o fluxo de IA das ideias. Desligada, a API não
enfileira no envio, recusa pedidos/regenerações e o worker não processa; a
revisão mostra o aviso `idea-ai-disabled`, esconde "Regenerar com IA" e continua
permitindo cancelar, restaurar e publicar resultados já gerados. O estado vem da
API em `aiEnhancement.enabled`. No `./run.sh local` a flag é criada e ligada.

## Princípio: upgrade, não mudança total

A IA melhora a ideia que o professor compartilhou sem perder a ideia central, a
originalidade e o jeito de quem escreveu. A API reprova propostas que se
afastam demais do original (menos de 70% das palavras-chave mantidas; 60% no
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
