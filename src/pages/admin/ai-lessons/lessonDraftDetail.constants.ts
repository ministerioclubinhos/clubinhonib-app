import type { TiptapDocument } from '@/services/aiLessonsService';
import { LessonStageType } from '@/services/aiLessonsService';

export const LESSON_STAGE_LABELS: Record<LessonStageType, string> = {
  LESSON: '1. Lição completa',
  LESSON_VISUALS: '2. Visuais da história',
  STANDARD_GAME: '3. Brincadeira',
  VERSE_VISUALS: '4. Visuais do versículo',
  VERSE_FIXATION: '5. Fixação divertida do versículo',
  MEDITATION_YOUNGER: '6. Meditação dos menores',
  MEDITATION_OLDER: '7. Meditação dos maiores',
  MANUAL_WORK: '8. Trabalho manual',
};

export const LESSON_STAGE_SHORT_LABELS: Record<LessonStageType, string> = {
  LESSON: '1. Lição',
  LESSON_VISUALS: '2. Visuais',
  STANDARD_GAME: '3. Brincadeira',
  VERSE_VISUALS: '4. Vis. Versículo',
  VERSE_FIXATION: '5. Fixação',
  MEDITATION_YOUNGER: '6. Med. Menores',
  MEDITATION_OLDER: '7. Med. Maiores',
  MANUAL_WORK: '8. Trab. Manual',
};

export const LESSON_STAGE_DESCRIPTIONS: Record<LessonStageType, string> = {
  LESSON: 'Conteúdo-base da aula e escolha de um único versículo principal NVI para memorização.',
  LESSON_VISUALS:
    'Personagens, ambientes e cenas, em ordem narrativa, para auxiliar o professor a contar a história.',
  STANDARD_GAME:
    'Brincadeira prática da aula e seus visuais de apoio, separada da atividade de memorização.',
  VERSE_VISUALS:
    'Sequência de imagens mnemônicas baseada na melhor quebra do versículo; a última imagem mostra somente a referência.',
  VERSE_FIXATION:
    'Dinâmica ou brincadeira divertida para praticar e memorizar o versículo, separada dos visuais mnemônicos.',
  MEDITATION_YOUNGER:
    'Folha A4 com duas cópias de atividades visuais simples para crianças de 5 a 7 anos.',
  MEDITATION_OLDER:
    'Folha A4 com três desafios de compreensão e aplicação para crianças de 8 a 11 anos, acompanhados de gabarito.',
  MANUAL_WORK:
    'Desenho bíblico em preto e branco para colorir, com o versículo principal, duplicado na folha para impressão e recorte.',
};

export const LESSON_STAGE_ORDER = Object.values(LessonStageType);

export const LESSON_STAGE_STATUS_LABELS: Record<string, string> = {
  NOT_STARTED: 'Não iniciada',
  GENERATING: 'Gerando',
  DRAFT: 'Em produção',
  PRODUCER_APPROVED: 'Concluída pelo produtor',
  IN_REVIEW: 'Em aprovação final',
  CHANGES_REQUESTED: 'Ajustes solicitados',
  APPROVED: 'Aprovada na revisão final',
  FAILED: 'Falhou',
  STALE: 'Desatualizada',
};

export const LESSON_STAGE_STATUS_COLORS: Record<
  string,
  'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'
> = {
  NOT_STARTED: 'default',
  GENERATING: 'info',
  DRAFT: 'primary',
  PRODUCER_APPROVED: 'info',
  IN_REVIEW: 'warning',
  CHANGES_REQUESTED: 'error',
  APPROVED: 'success',
  FAILED: 'error',
  STALE: 'warning',
};

export const displayAiFailure = (type: LessonStageType, message: string): string => {
  const normalized = message.toLowerCase();
  if (
    normalized.includes('insufficient_quota') ||
    normalized.includes('credit_balance_exhausted') ||
    normalized.includes('no credits remaining')
  )
    return `Falha no item ${LESSON_STAGE_LABELS[type]} usando OpenAI: os créditos da conta acabaram. Adicione créditos ou ajuste o faturamento do provedor e tente novamente.`;
  return message;
};

const LEGACY_DOCUMENT_LABELS: Record<string, string> = {
  'FUN MECHANICS': 'MECÂNICAS DIVERTIDAS',
  AGES5TO7: 'CRIANÇAS DE 5 A 7 ANOS',
  AGES8TO11: 'CRIANÇAS DE 8 A 11 ANOS',
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
  const legacyHeadings = ['TEXTO DO VERSÍCULO', 'REFERÊNCIA DO VERSÍCULO', 'VERSÃO BÍBLICA'];
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
