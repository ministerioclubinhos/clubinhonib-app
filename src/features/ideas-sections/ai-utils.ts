import {
  IdeaAiDecision,
  IdeaAiErrorCode,
  IdeaAiMediaStatus,
  IdeaAiQueueFilter,
  IdeaAiScope,
  IdeaWordDiffKind,
  type IdeaAiStatus,
  type IdeaAiAttempt,
  type IdeaAiEnhancementRequest,
  type IdeaAiFinalText,
  type IdeaAiDecisions,
  type IdeaAiDetail,
  type IdeasSectionResponse,
  type IdeaWordDiff,
} from './types';
import { MediaType, type MediaItem } from '@/store/slices/types';
import { IDEA_AI_DIFF_MAX_CELLS, IDEA_AI_WORKING_STATUSES } from './ai-constants';
export function initialIdeaAiDecisions(detail?: IdeaAiDetail): IdeaAiDecisions | null {
  const current = detail?.currentResult;
  if (!current) return null;
  const pick = (available: boolean, decision: IdeaAiDecision) =>
    !available
      ? IdeaAiDecision.ORIGINAL
      : decision === IdeaAiDecision.PENDING
        ? IdeaAiDecision.ENHANCED
        : decision;
  return {
    enhancementId: current.id,
    title: pick(Boolean(current.enhancedTitle), current.titleDecision),
    description: pick(current.enhancedDescription !== null, current.descriptionDecision),
    medias: (detail?.snapshot?.medias ?? []).map((m) => {
      const result = current.medias.find((r) => r.sourceMediaId === m.id);
      return {
        sourceMediaId: m.id,
        decision: pick(
          result?.status === IdeaAiMediaStatus.ENHANCED,
          result?.decision ?? IdeaAiDecision.PENDING
        ),
      };
    }),
  };
}
/**
 * Diff de palavras (LCS limitado) com o que entrou e o que saiu, preservando
 * os espaços para exibição. Espaço removido não é mostrado; espaço novo conta
 * como igual, para o diff não piscar em quebras de linha.
 */
export function ideaWordDiff(original: string, enhanced: string): IdeaWordDiff[] {
  const a = original.match(/\S+|\s+/g) ?? [];
  const b = enhanced.match(/\S+|\s+/g) ?? [];
  const isSpace = (text: string) => !text.trim();
  if (a.length * b.length > IDEA_AI_DIFF_MAX_CELLS) {
    const known = new Set(a);
    return b.map((text) => ({
      text,
      kind: isSpace(text) || known.has(text) ? IdeaWordDiffKind.SAME : IdeaWordDiffKind.ADDED,
    }));
  }
  const table = Array.from({ length: a.length + 1 }, () => new Uint16Array(b.length + 1));
  for (let i = a.length - 1; i >= 0; i--)
    for (let j = b.length - 1; j >= 0; j--)
      table[i][j] =
        a[i] === b[j] ? table[i + 1][j + 1] + 1 : Math.max(table[i + 1][j], table[i][j + 1]);
  const parts: IdeaWordDiff[] = [];
  const push = (text: string, kind: IdeaWordDiffKind) => {
    if (kind === IdeaWordDiffKind.REMOVED && isSpace(text)) return;
    const effective = kind === IdeaWordDiffKind.ADDED && isSpace(text) ? IdeaWordDiffKind.SAME : kind;
    const last = parts[parts.length - 1];
    if (last && last.kind === effective) last.text += text;
    else parts.push({ text, kind: effective });
  };
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      push(b[j], IdeaWordDiffKind.SAME);
      i++;
      j++;
    } else if (table[i + 1][j] >= table[i][j + 1]) push(a[i++], IdeaWordDiffKind.REMOVED);
    else push(b[j++], IdeaWordDiffKind.ADDED);
  }
  while (i < a.length) push(a[i++], IdeaWordDiffKind.REMOVED);
  while (j < b.length) push(b[j++], IdeaWordDiffKind.ADDED);
  return parts;
}

/** A removed publication projection must not be restored by its AI choice. */
export function excludedIdeaSourceIds(
  section: IdeasSectionResponse,
  medias: MediaItem[]
): string[] {
  const retainedUrls = new Set(medias.map((m) => m.url));
  return (section.aiEnhancement?.snapshot?.medias ?? [])
    .filter((source) => {
      const versions =
        section.aiEnhancement?.attemptHistory.flatMap((a) =>
          a.medias.filter((m) => m.sourceMediaId === source.id).map((m) => m.enhancedMedia?.url)
        ) ?? [];
      return (
        !retainedUrls.has(source.url) &&
        !versions.some((url) => Boolean(url && retainedUrls.has(url)))
      );
    })
    .map((source) => source.id);
}

/**
 * Resumo das escolhas, para o cartão de publicação.
 *
 * Quem publica está a algumas telas de distância da comparação: a lista diz,
 * em uma linha por item, o que o botão vai enviar.
 */
export function ideaAiChoiceSummary(
  decisions: IdeaAiDecisions | null,
  excludedMediaIds: string[] = []
): string[] {
  if (!decisions) return [];
  const label = (decision: IdeaAiDecision) =>
    decision === IdeaAiDecision.ENHANCED ? 'versão da IA' : 'original';
  const medias = decisions.medias.filter((m) => !excludedMediaIds.includes(m.sourceMediaId));
  const enhanced = medias.filter((m) => m.decision === IdeaAiDecision.ENHANCED).length;
  const original = medias.length - enhanced;
  const lines = [`Título: ${label(decisions.title)}`, `Descrição: ${label(decisions.description)}`];
  if (medias.length)
    lines.push(
      `Materiais: ${enhanced} com IA e ${original} ${original === 1 ? 'original' : 'originais'}`
    );
  return lines;
}

/** Texto da versão escolhida (original ou da IA) para um campo. */
export function ideaAiChosenText(
  decision: IdeaAiDecision,
  original: string,
  enhanced: string | null
): string {
  return decision === IdeaAiDecision.ENHANCED && enhanced !== null ? enhanced : original;
}

/** Texto inicial da etapa 2: a versão escolhida de cada campo. */
export function initialIdeaAiFinalText(
  detail: IdeaAiDetail | undefined,
  decisions: IdeaAiDecisions | null,
  fallback: IdeaAiFinalText
): IdeaAiFinalText {
  const snapshot = detail?.snapshot;
  const current = detail?.currentResult;
  if (!decisions || !snapshot || !current) return fallback;
  return {
    title: ideaAiChosenText(decisions.title, snapshot.title, current.enhancedTitle),
    description: ideaAiChosenText(
      decisions.description,
      snapshot.description,
      current.enhancedDescription
    ),
  };
}

/** Ignora espaços: reorganizar um parágrafo não é edição. */
export function isIdeaTextEdited(base: string, final: string): boolean {
  const normalize = (text: string) => text.replace(/\s+/g, ' ').trim();
  return normalize(base) !== normalize(final);
}

/** Mídias que a IA pode refazer: documentos e imagens enviados como arquivo. */
export function ideaAiRegenerableMedias(detail?: IdeaAiDetail): IdeasSectionResponse['medias'] {
  return (detail?.snapshot?.medias ?? []).filter(
    (media) =>
      media.isLocalFile &&
      (media.mediaType === MediaType.DOCUMENT || media.mediaType === MediaType.IMAGE)
  );
}

/** O resultado atual tem algo reprovado ou com falha para refazer? */
export function ideaAiHasFailedItems(current: IdeaAiAttempt | null | undefined): boolean {
  if (!current) return false;
  return (
    current.enhancedTitle === null ||
    current.enhancedDescription === null ||
    current.medias.some(
      (m) =>
        (m.status === IdeaAiMediaStatus.FAILED ||
          m.status === IdeaAiMediaStatus.REJECTED_BY_GUARD) &&
        !m.carriedOver
    )
  );
}

/** Corpo do pedido de regeneração, sem campos vazios. */
export function buildIdeaAiRequest(
  scope: IdeaAiScope,
  mediaIds: string[],
  instructions: string
): IdeaAiEnhancementRequest {
  const trimmed = instructions.trim();
  return {
    scope,
    ...(scope === IdeaAiScope.MEDIA ? { mediaIds } : {}),
    ...(trimmed ? { instructions: trimmed } : {}),
  };
}

/**
 * Tentativas restantes (cancelamentos e falhas de infraestrutura não contam).
 * null = ainda sem dados de IA; a API decide no pedido.
 */
export function ideaAiAttemptsLeft(detail?: IdeaAiDetail): number | null {
  if (!detail) return null;
  return Math.max(0, detail.maxAttempts - detail.attemptsUsed);
}

/** Por que não dá para pedir uma nova melhoria agora (vazio = pode). */
export function ideaAiRegenerateBlock(
  section: IdeasSectionResponse
): string {
  const detail = section.aiEnhancement;
  if (section.pageId) return 'A ideia já foi publicada.';
  if (!detail) return '';
  if (!detail.enabled) return 'A melhoria de ideias por IA está desligada.';
  if (!detail.providerReady)
    return 'Configure o provedor de IA (chave e modelo de texto) para melhorar ideias.';
  if (detail.activeAttempt) return 'Aguarde a melhoria em andamento ou cancele-a.';
  if (ideaAiAttemptsLeft(detail) === 0) return 'Limite de tentativas atingido.';
  return '';
}

/** Percentual de progresso da tentativa ativa (null = indeterminado). */
export function ideaAiProgressPercent(attempt: IdeaAiAttempt | null | undefined): number | null {
  if (!attempt || attempt.progressTotal <= 0) return null;
  return Math.min(100, Math.round((attempt.progressDone / attempt.progressTotal) * 100));
}

/** A falha não depende da ideia: tentar de novo sem corrigir a causa não adianta. */
export function isIdeaAiInfraError(code: IdeaAiErrorCode | null): boolean {
  return (
    code === IdeaAiErrorCode.PROVIDER_NOT_CONFIGURED ||
    code === IdeaAiErrorCode.QUEUE_UNAVAILABLE ||
    code === IdeaAiErrorCode.STALLED ||
    code === IdeaAiErrorCode.SNAPSHOT_MISSING
  );
}

/** A revisão deve acompanhar: há tentativa na fila ou processando. */
export function isIdeaAiWorking(section: IdeasSectionResponse): boolean {
  const active = section.aiEnhancement?.activeAttempt;
  return Boolean(active && IDEA_AI_WORKING_STATUSES.includes(active.status));
}

/** Chip da fila em estado que ainda vai mudar sozinho. */
export function isIdeaAiQueueWorking(status: IdeaAiStatus | null | undefined): boolean {
  return Boolean(status && IDEA_AI_WORKING_STATUSES.includes(status));
}

/** Valor do seletor da fila; vazio = todas. */
export function parseIdeaAiQueueFilter(value: string): IdeaAiQueueFilter | undefined {
  return Object.values(IdeaAiQueueFilter).find((filter) => filter === value);
}

/**
 * Fração das palavras alteradas (inserções + remoções sobre o total). Acima
 * de `IDEA_AI_DIFF_REWRITE_RATIO`, marcar palavra a palavra só polui: a IA
 * reorganizou o texto.
 */
export function ideaDiffChangeRatio(parts: IdeaWordDiff[]): number {
  const words = (text: string) => text.split(/\s+/).filter(Boolean).length;
  let changed = 0;
  let total = 0;
  for (const part of parts) {
    const count = words(part.text);
    total += count;
    if (part.kind !== IdeaWordDiffKind.SAME) changed += count;
  }
  return total ? changed / total : 0;
}
