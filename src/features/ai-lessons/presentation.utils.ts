import {
  AI_QUOTA_FAILURE_MARKERS,
  LEGACY_DOCUMENT_LABELS,
  LEGACY_VERSE_HEADINGS,
  LESSON_STAGE_LABELS,
  LESSON_STAGE_SHORT_LABELS,
  SPECIAL_STAGE_DESCRIPTIONS,
  SPECIAL_STAGE_LABELS,
  SPECIAL_STAGE_SHORT_LABELS,
  LESSON_STAGE_DESCRIPTIONS,
} from './presentation.constants';
import { LessonCategory, LessonStageType, type TiptapDocument } from './types';

export function lessonStageLabel(
  stage: LessonStageType,
  category?: LessonCategory,
  short = false
): string {
  const regular = short ? LESSON_STAGE_SHORT_LABELS : LESSON_STAGE_LABELS;
  const special = short ? SPECIAL_STAGE_SHORT_LABELS : SPECIAL_STAGE_LABELS;
  return category === LessonCategory.SPECIAL ? (special[stage] ?? regular[stage]) : regular[stage];
}

export function lessonStageDescription(stage: LessonStageType, category?: LessonCategory): string {
  return category === LessonCategory.SPECIAL
    ? (SPECIAL_STAGE_DESCRIPTIONS[stage] ?? LESSON_STAGE_DESCRIPTIONS[stage])
    : LESSON_STAGE_DESCRIPTIONS[stage];
}

export const displayAiFailure = (
  type: LessonStageType,
  message: string,
  category?: LessonCategory
): string => {
  const normalized = message.toLowerCase();
  if (AI_QUOTA_FAILURE_MARKERS.some((marker) => normalized.includes(marker)))
    return `Falha no item ${lessonStageLabel(type, category)}: os créditos da conta do provedor de IA acabaram. Adicione créditos ou ajuste o faturamento do provedor configurado e tente novamente.`;
  return message;
};

export const localizeLegacyDocumentLabels = (document: TiptapDocument): TiptapDocument => {
  const visit = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map(visit);
    if (!value || typeof value !== 'object') return value;
    const entry = value as Record<string, unknown>;
    return Object.fromEntries(
      Object.entries(entry).map(([key, child]) => [
        key,
        key === 'text' && typeof child === 'string'
          ? (LEGACY_DOCUMENT_LABELS[child] ?? child)
          : visit(child),
      ])
    );
  };
  const localized = visit(document) as TiptapDocument;
  const content = localized.content ?? [];
  const nodeText = (value: unknown): string => {
    if (Array.isArray(value)) return value.map(nodeText).join('');
    if (!value || typeof value !== 'object') return '';
    const entry = value as Record<string, unknown>;
    return `${typeof entry.text === 'string' ? entry.text : ''}${nodeText(entry.content)}`;
  };
  const legacyHeadings = LEGACY_VERSE_HEADINGS;
  const sectionIndexes = content
    .map((node, index) =>
      node.type === 'heading' && legacyHeadings.includes(nodeText(node).trim()) ? index : -1
    )
    .filter((index) => index >= 0);
  if (!sectionIndexes.length) return localized;
  const sectionValue = (heading: string): string => {
    const start = content.findIndex(
      (node) => node.type === 'heading' && nodeText(node).trim() === heading
    );
    if (start < 0) return '';
    const values: string[] = [];
    for (let index = start + 1; index < content.length; index += 1) {
      if (content[index].type === 'heading') break;
      const text = nodeText(content[index]).trim();
      if (text) values.push(text);
    }
    return values.join(' ');
  };
  const verseText = sectionValue('TEXTO DO VERSÍCULO').replace(/^[“"']|[”"']$/g, '');
  const verseReference = sectionValue('REFERÊNCIA DO VERSÍCULO');
  const verseVersion = sectionValue('VERSÃO BÍBLICA');
  const removed = new Set<number>();
  sectionIndexes.forEach((start) => {
    for (let index = start; index < content.length; index += 1) {
      if (index > start && content[index].type === 'heading') break;
      removed.add(index);
    }
  });
  const firstIndex = Math.min(...sectionIndexes);
  const replacement: Array<Record<string, unknown>> = [
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: 'VERSÍCULO PARA MEMORIZAR' }],
    },
    ...(verseText
      ? [{ type: 'paragraph', content: [{ type: 'text', text: `“${verseText}”` }] }]
      : []),
    ...(verseReference || verseVersion
      ? [
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: [verseReference, verseVersion].filter(Boolean).join(' — ') },
            ],
          },
        ]
      : []),
  ];
  return {
    ...localized,
    content: content.flatMap((node, index) =>
      index === firstIndex ? replacement : removed.has(index) ? [] : [node]
    ),
  };
};
