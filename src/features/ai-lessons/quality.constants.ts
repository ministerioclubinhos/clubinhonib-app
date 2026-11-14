import { LessonQualityIssueKind } from './quality.types';

/** Lower end of the story length in the manual lessons (p25 ≈ 920 words). */
export const LESSON_STORY_MIN_WORDS = 900;
/** Section heading of the story in the generated LESSON document. */
export const LESSON_STORY_HEADING = 'LIÇÃO BÍBLICA';
/** One caveat can be fine; the warning starts when it repeats. */
export const LESSON_DISCLAIMER_REPEAT_THRESHOLD = 2;
export const LESSON_QUALITY_MAX_EXCERPTS = 3;
export const LESSON_QUALITY_EXCERPT_MAX_LENGTH = 180;

const EVANGELISTS = '(?:Mateus|Marcos|Lucas)';
const SOURCE_VERBS =
  '(?:conta|contam|registra|registram|menciona|mencionam|descreve|descrevem|relata|relatam|acompanha|acompanham|destaca|destacam|informa|informam|dá destaque|dão destaque)';

/** Patterns of gross problems seen in generated lessons. Matching is approximate on purpose. */
export const LESSON_QUALITY_PATTERNS: Record<
  Exclude<LessonQualityIssueKind, LessonQualityIssueKind.SHORT_STORY>,
  readonly RegExp[]
> = {
  [LessonQualityIssueKind.SOURCE_COMMENTARY]: [
    new RegExp(`\\b${EVANGELISTS}(?:\\s+e\\s+${EVANGELISTS})?\\s+${SOURCE_VERBS}\\b`, 'giu'),
    new RegExp(`\\b(?:segundo|conforme)\\s+(?:o\\s+relato\\s+de\\s+)?${EVANGELISTS}\\b`, 'giu'),
    new RegExp(`\\bem\\s+${EVANGELISTS},`, 'giu'),
    /\b(?:nos outros relatos|os evangelhos (?:contam|registram)|relatos paralelos)\b/giu,
  ],
  [LessonQualityIssueKind.PROMPT_LEAK]: [
    /\b(?:narre|conte isso|conte esse|não prolongue|não acrescente|não precisamos inventar|não devemos inventar|confira a redação|conferência humana|redação exata|revisão humana)\b/giu,
  ],
  [LessonQualityIssueKind.REPEATED_DISCLAIMER]: [
    /não (?:devemos concluir|significa que|quer dizer que|é uma promessa de que|ensina que toda|ensina que doen)/giu,
    /sem dizer que toda/giu,
  ],
  [LessonQualityIssueKind.MARKDOWN]: [/\*\*|__|(?:^|\n)#{1,6}\s/gu],
};

export const LESSON_QUALITY_TEXTS = {
  title: 'Pontos para conferir antes de aprovar',
  summary: (count: number) =>
    count === 1 ? '1 ponto para conferir antes de aprovar' : `${count} pontos para conferir antes de aprovar`,
  showDetails: 'Ver detalhes',
  hideDetails: 'Ocultar detalhes',
  hint: 'Checagem automática e aproximada: não bloqueia nada e não gera nada de novo. Corrija na edição ou gere novamente se preferir.',
  labels: {
    [LessonQualityIssueKind.SHORT_STORY]: (words: number) =>
      `A história tem cerca de ${words} palavras; as lições manuais costumam ter de 900 a 1.250.`,
    [LessonQualityIssueKind.SOURCE_COMMENTARY]: 'O texto comenta o que cada evangelista registra; a aula deveria contar a história direto às crianças.',
    [LessonQualityIssueKind.PROMPT_LEAK]: 'Há instruções para quem escreve no meio do texto da aula.',
    [LessonQualityIssueKind.REPEATED_DISCLAIMER]: 'A mesma ressalva aparece várias vezes.',
    [LessonQualityIssueKind.MARKDOWN]: 'Há marcas de formatação (asteriscos ou cerquilhas) no texto.',
  },
} as const;
