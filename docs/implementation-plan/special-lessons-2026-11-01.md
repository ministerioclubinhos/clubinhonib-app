# Estúdio Clubinho — Plano de Implementação Frontend: Lições Especiais (`SPECIAL`), 2026-11-01

Status: implementado. Nota de 2026-11-10: a referência vigente do contrato é `clubinhonib-api/docs/api-ai-lessons.md`.

Referências de domínio analisadas:
- [`lições/especial/licao_especial.pdf`](../../../lições/especial/licao_especial.pdf) — *"O Picolé Roubado"* (narrativa contemporânea conectada às Escrituras e ao Plano da Salvação).
- [`lições/especial/Lição_1 Especial - O Plano da Salvação na linha do tempo.pdf`](../../../lições/especial/Lição_1%20Especial%20-%20O%20Plano%20da%20Salvação%20na%20linha%20do%20tempo.pdf) — *"O Plano da Salvação na Linha do Tempo"* (lição especial temática/panorâmica).
- [`lições/especial/Meditação - Lição Especial (Semana1).pdf`](../../../lições/especial/Meditação%20-%20Lição%20Especial%20(Semana1).pdf) e [`lições/especial/Linha do tempo _ Colorido.pdf`](../../../lições/especial/Linha%20do%20tempo%20_%20Colorido.pdf).
- Plano coordenado de backend: [`clubinhonib-api/docs/implementation-plan/special-lessons-2026-11-01.md`](../../../clubinhonib-api/docs/implementation-plan/special-lessons-2026-11-01.md).

---

## 1. Objetivo

Expandir a interface do **Estúdio Clubinho** e do **Criador / Gerenciador de Materiais** no `clubinhonib-app` para suportar a criação, listagem, produção, revisão e publicação de **Materiais / Lições Especiais (`LessonCategory.SPECIAL`)** de forma simples, flexível e enxuta:
1. **Pergunta explícita ao criar o material: *"É Material Semanal ou Material Especial?"***:
   - **No Estúdio Clubinho ([`LessonAiGenerateModal.tsx`](../../src/components/ai-lessons/LessonAiGenerateModal.tsx))**: logo na primeira seção do modal de criação de pacote, perguntar ao usuário qual tipo de material está sendo criado:
     - **Material Semanal (Lição Regular — 8 itens)** — narrativa bíblica semanal com número da semana obrigatório e pacote completo de 8 etapas.
     - **Material Especial (Lição Especial — 3 itens)** — pacote enxuto contendo **exclusivamente**:
       1. **Lição Especial + Versículo** (`LESSON`) com um **jeito legal, criativo e dinâmico de contar a lição especial** conectada a uma história para os dias de hoje;
       2. **Visual da Lição** (`LESSON_VISUALS`) pensado para esse **jeito legal de contar a lição especial** (cartazes/cenas + orientações criativas de apresentação);
       3. **Versículo / Visual do Versículo** (`VERSE_VISUALS`).
   - **No Criador de Páginas de Material ([`WeekMaterialPageForm.tsx`](../../src/features/week-materials/WeekMaterialPageForm.tsx) / `/adm/criar-pagina`)**: ao criar uma página de material manualmente, perguntar no topo do formulário se é **Material Semanal** ou **Material Especial**, adaptando os rótulos, placeholders e sugestões de preenchimento (`Semana 12` vs `Material Especial / Lição Especial`) e identificando visualmente os cards como `Material Especial` na listagem administrativa ([`WeekMaterialListCard.tsx`](../../src/features/week-materials/components/WeekMaterialListCard.tsx)).
2. **Quando `Material Especial` estiver selecionado no Estúdio Clubinho**:
   - O alerta informativo do modal explica que o pacote de **Material Especial** gerará apenas os **3 itens** (**Lição Especial com jeito legal de contar**, **Visual da Lição** e **Versículo / Visual do Versículo**).
   - O campo **Número da semana** passa a ser **opcional** (permitindo criar materiais especiais avulsos ou vinculados a uma semana).
   - O administrador informa o **Tema / Título** e as **Referências Bíblicas** que irão sustentar o ensino e se conectar à história para os dias de hoje.
   - Exibir um campo opcional e aberto (**Ideia / Contexto para a história nos dias de hoje ou jeito legal de contar**, até 2.000 caracteres) com exemplos práticos inspirados em *"O Picolé Roubado"* e *"O Plano da Salvação na Linha do Tempo"*, deixando claro que, se ficar em branco, a IA criará automaticamente uma história atual para crianças e uma forma criativa de contá-la conectada ao tema e às referências bíblicas.
3. **Fluxo de Produção e Revisão adaptado às 3 etapas no Material Especial**:
   - Na tela de Produção ([`LessonDraftDetailPage.tsx`](../../src/pages/admin/ai-lessons/LessonDraftDetailPage.tsx)) e na tela de Revisão ([`LessonReviewDetailPage.tsx`](../../src/pages/admin/ai-lessons/LessonReviewDetailPage.tsx)), exibir apenas as **3 abas/etapas** (`LESSON`, `LESSON_VISUALS`, `VERSE_VISUALS`) quando o pacote for `SPECIAL`, encadeando `VERSE_VISUALS` diretamente após `LESSON_VISUALS` em [`workflow.ts`](../../src/features/ai-lessons/workflow.ts).

---

## 2. Mapa de Entrega (Pacotes Frontend)

| Pacote | Prioridade / Escopo | Descrição Resumida |
| --- | --- | --- |
| **SFE01 — Contratos, `SPECIAL_STUDIO_STAGE_ORDER`, Workflow e Serviço HTTP** | P1 / S | Adicionar `LessonCategory` (`REGULAR`, `SPECIAL`), `SPECIAL_STUDIO_STAGE_ORDER` (`LESSON`, `LESSON_VISUALS`, `VERSE_VISUALS`), helper `getStudioStageOrder(category)` e atualizar `workflow.ts` (`lessonProductionActions`, `canPublishLesson`). |
| **SFE02 — Pergunta `Material Semanal vs Material Especial` no Modal do Estúdio Clubinho** | P1 / M | Atualizar `LessonAiGenerateModal.tsx` com a escolha inicial entre **Material Semanal (8 itens)** e **Material Especial (3 itens: Lição, Visual da Lição com jeito legal de contar, Versículo/Visual do Versículo)**, semana opcional e campo aberto de contexto/história para os dias de hoje. |
| **SFE03 — Pergunta `Material Semanal vs Material Especial` no Criador de Páginas de Material** | P1 / S | Atualizar `WeekMaterialPageForm.tsx`, `WeekMaterialListCard.tsx` e `week-materials/utils.ts` para perguntar na criação da página se é **Material Semanal** ou **Material Especial** e exibir badge `Material Especial` nos cards. |
| **SFE04 — Produção, Revisão (3 Etapas no Especial) e Identificação Visual** | P1 / M | Adaptar `LessonDraftDetailPage.tsx` e `LessonReviewDetailPage.tsx` para renderizar e validar as 3 etapas no Material Especial, exibir rótulos contextualizados e filtro por categoria nas filas de Produção e Revisão. |
| **SFE05 — Testes Unitários, E2E e Documentação** | P1 / S | Cobrir o workflow de 3 etapas do Material Especial, a escolha Semanal vs Especial no modal e no formulário de materiais em testes unitários (`e2e/unit/`) e atualizar `docs/content_materials.md`. |

---

## 3. Detalhamento Técnico por Pacote

### SFE01 — Contratos, `SPECIAL_STUDIO_STAGE_ORDER`, Workflow e Serviço HTTP

**Arquivos**:
- [`src/features/ai-lessons/types.ts`](../../src/features/ai-lessons/types.ts)
- [`src/features/ai-lessons/constants.ts`](../../src/features/ai-lessons/constants.ts)
- [`src/features/ai-lessons/utils.ts`](../../src/features/ai-lessons/utils.ts)
- [`src/features/ai-lessons/workflow.ts`](../../src/features/ai-lessons/workflow.ts)
- [`src/services/aiLessonsService.ts`](../../src/services/aiLessonsService.ts)

**Implementação**:
1. Adicionar enum `LessonCategory`:
   ```ts
   export enum LessonCategory {
     REGULAR = 'REGULAR', // Material Semanal (8 etapas)
     SPECIAL = 'SPECIAL', // Material Especial (3 etapas: LESSON, LESSON_VISUALS, VERSE_VISUALS)
   }
   ```
2. Em `constants.ts`:
   ```ts
   export const SPECIAL_STUDIO_STAGE_ORDER: readonly LessonStageType[] = [
     LessonStageType.LESSON,
     LessonStageType.LESSON_VISUALS,
     LessonStageType.VERSE_VISUALS,
   ];

   export function getStudioStageOrder(
     category?: LessonCategory | null
   ): readonly LessonStageType[] {
     return category === LessonCategory.SPECIAL
       ? SPECIAL_STUDIO_STAGE_ORDER
       : STUDIO_STAGE_ORDER;
   }
   ```
3. Em `workflow.ts`:
   - Em `lessonProductionActions`: usar `const stageOrder = getStudioStageOrder(lesson.category)` para calcular `index` e `previous` (assim, no Material Especial, `VERSE_VISUALS` depende diretamente da conclusão de `LESSON_VISUALS`).
   - Em `canPublishLesson`: validar `lesson.stages.length === getStudioStageOrder(lesson.category).length`.
4. Atualizar `Lesson` e `GenerateLessonPayload`:
   - `category?: LessonCategory;`
   - `specialContext?: string | null;`
   - `weekNumber: number | null;` (em `Lesson`) e `weekNumber?: number | null;` (em `GenerateLessonPayload`).
5. Adicionar helper puro `formatLessonBadgeLabel(lesson: Pick<Lesson, 'category' | 'weekNumber'>): string`:
   - Se `category === LessonCategory.SPECIAL`: retorna `weekNumber ? 'Material Especial · Semana ' + weekNumber : 'Material Especial'`.
   - Caso contrário: retorna `weekNumber ? 'Semana ' + weekNumber : 'Material Semanal'`.

---

### SFE02 — Pergunta `Material Semanal vs Material Especial` no Modal do Estúdio Clubinho

**Arquivos**:
- [`src/components/ai-lessons/LessonAiGenerateModal.tsx`](../../src/components/ai-lessons/LessonAiGenerateModal.tsx)

**Implementação**:
1. Adicionar no topo do modal a pergunta explícita **"Qual tipo de material você deseja criar?"** (`ToggleButtonGroup` ou cards selecionáveis com `data-testid="ai-lessons-category-selector"`):
   - Opção 1: **Material Semanal (8 itens)** — pacote semanal completo (lição, visuais, brincadeira, versículo, fixação, meditações e trabalho manual).
   - Opção 2: **Material Especial (3 itens)** — pacote especial contendo apenas **Lição Especial** (com jeito legal de contar + versículo), **Visual da Lição** (com jeito legal de contar) e **Visual do Versículo**.
2. Ajustar o texto do `Alert` informativo e os campos conforme a resposta:
   - **Quando `Material Semanal (REGULAR)`**:
     - Alerta explica a geração dos 8 itens tradicionais; **Número da semana \*** é obrigatório (`>= 1`).
   - **Quando `Material Especial (SPECIAL)`**:
     - Alerta explica: *"O Material Especial produzirá três itens: **1. Lição Especial + Versículo** (conectando o tema e as referências bíblicas a uma história para os dias de hoje com um jeito legal de contar), **2. Visual da Lição** (com dinâmica criativa de apresentação) e **3. Visual do Versículo**."*
     - **Tema / Título do Material Especial \***: placeholder contextualizado (`Ex: O Picolé Roubado / A Mentira no Recreio / O Plano da Salvação na Linha do Tempo`).
     - **Texto / Referências Bíblicas que conectam com a história \***: placeholder contextualizado (`Ex: Êxodo 20:15; Efésios 4:27,28; Romanos 6:23; 1 Coríntios 15:3,4; Romanos 10:13`).
     - **Ideia para a história nos dias de hoje / Jeito legal de contar (opcional)** (`data-testid="ai-lessons-special-context-input"`, até 2.000 caracteres):
       - Campo multiline aberto para o usuário descrever livremente uma situação atual, personagens, dilema cotidiano ou uma dinâmica/jeito legal de contar a lição — ou deixar em branco para que a IA crie a história contemporânea e a dinâmica de contação conectadas ao tema e às referências.
     - **Número da semana (opcional no Material Especial)**:
       - Pode ficar vazio (gera cabeçalho `LIÇÃO ESPECIAL` sem número de semana) ou ser preenchido caso pertença a uma semana específica (`LIÇÃO ESPECIAL N`).

---

### SFE03 — Pergunta `Material Semanal vs Material Especial` no Criador de Páginas de Material

**Arquivos**:
- [`src/features/week-materials/WeekMaterialPageForm.tsx`](../../src/features/week-materials/WeekMaterialPageForm.tsx)
- [`src/features/week-materials/components/WeekMaterialListCard.tsx`](../../src/features/week-materials/components/WeekMaterialListCard.tsx)
- [`src/features/week-materials/utils.ts`](../../src/features/week-materials/utils.ts)

**Implementação**:
1. Em `WeekMaterialPageForm.tsx` (usado em `/adm/criar-pagina` e na edição de páginas de materiais):
   - Adicionar no topo do card *"Informações da página"* a pergunta **"Tipo de material"** (`data-testid="week-materials-material-type-selector"`):
     - **Material Semanal** (`WEEKLY`)
     - **Material Especial** (`SPECIAL`)
   - Quando o usuário selecionar **Material Semanal**:
     - Campo 1: `label="Semana"` / `helperText="Ex.: Semana 12"`
     - Campo 2: `label="Tema da Semana"` / `helperText="Assunto tratado na visita"`
     - Campo 3: `label="Descrição do Tema da Semana"`
   - Quando o usuário selecionar **Material Especial**:
     - Campo 1: `label="Identificação do Material Especial"` / `helperText="Ex.: Material Especial ou Lição Especial — Semana 1"` (pré-preenchendo `"Material Especial"` se o campo estiver vazio ao alternar).
     - Campo 2: `label="Tema do Material Especial"` / `helperText="Ex.: O Picolé Roubado / O Plano da Salvação na Linha do Tempo"`
     - Campo 3: `label="Descrição / Contexto do Material Especial"` (garantindo a tag `[tipo:especial]` ao salvar).
2. Em `WeekMaterialListCard.tsx` e `week-materials/utils.ts`:
   - Detectar páginas de **Material Especial** e exibir um badge dedicado `{ label: 'Material Especial', color: 'secondary' }` no card da listagem administrativa.

---

### SFE04 — Produção, Revisão (3 Etapas no Especial) e Identificação Visual

**Arquivos**:
- [`src/pages/admin/ai-lessons/AiLessonsListPage.tsx`](../../src/pages/admin/ai-lessons/AiLessonsListPage.tsx)
- [`src/pages/admin/ai-lessons/AiLessonsReviewListPage.tsx`](../../src/pages/admin/ai-lessons/AiLessonsReviewListPage.tsx)
- [`src/pages/admin/ai-lessons/AiLessonsHubPage.tsx`](../../src/pages/admin/ai-lessons/AiLessonsHubPage.tsx)
- [`src/pages/admin/ai-lessons/LessonDraftDetailPage.tsx`](../../src/pages/admin/ai-lessons/LessonDraftDetailPage.tsx)
- [`src/pages/admin/ai-lessons/LessonReviewDetailPage.tsx`](../../src/pages/admin/ai-lessons/LessonReviewDetailPage.tsx)
- [`src/pages/admin/ai-lessons/lessonDraftDetail.constants.ts`](../../src/pages/admin/ai-lessons/lessonDraftDetail.constants.ts)

**Implementação**:
1. Em `LessonDraftDetailPage.tsx` e `LessonReviewDetailPage.tsx`:
   - Na tela de Revisão (`LessonReviewDetailPage.tsx`), substituir `STAGE_ORDER.map(...)` por `getStudioStageOrder(lesson.category).map(...)` e ajustar o texto de início de revisão (`"Os três itens do Material Especial estão concluídos..."` quando `SPECIAL` vs `"Os oito itens estão concluídos..."` quando `REGULAR`).
   - Na tela de Produção (`LessonDraftDetailPage.tsx`), quando `lesson.category === LessonCategory.SPECIAL`, ajustar a descrição das etapas `LESSON` e `LESSON_VISUALS` para destacar o **jeito legal de contar a Lição Especial** e exibir o `specialContext` no card de cabeçalho.
2. Substituir rótulos fixos `` `Semana ${lesson.weekNumber}` `` por `formatLessonBadgeLabel(lesson)` com destaque visual (`color="secondary"` quando `lesson.category === LessonCategory.SPECIAL`), evitando exibir `Semana null`.
3. Adicionar filtro rápido por tipo de material (**Todos**, **Material Semanal**, **Material Especial**) nas listagens de Produção (`AiLessonsListPage.tsx`) e Revisão (`AiLessonsReviewListPage.tsx`).

---

### SFE05 — Testes Unitários e Documentação

**Arquivos**:
- `e2e/unit/studio-drafts.spec.ts`
- `docs/content_materials.md`

**Verificação**:
- `NODE_OPTIONS='--max-old-space-size=2048' npm run type-check`
- `NODE_OPTIONS='--max-old-space-size=2048' npm run check:test-ids`
- `NODE_OPTIONS='--max-old-space-size=2048' npm run test:unit -- e2e/unit/studio-`
- `NODE_OPTIONS='--max-old-space-size=2048' npm run build`
- `npx eslint` nos arquivos alterados.
