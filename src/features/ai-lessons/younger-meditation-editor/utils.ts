import type { TiptapDocument } from '@/services/aiLessonsService';
import { YoungerMeditationField, type YoungerMeditationContent } from './types';

import {
  object,
  text,
  string,
  section,
  buildMeditationDocument,
  meditationActivityImages,
} from '../meditation-editor-core/document';

export function readYoungerMeditation(
  document: TiptapDocument,
  data: Record<string, unknown>
): YoungerMeditationContent {
  const nodes = document.content ?? [];
  const title = nodes.find(
    (node) =>
      node.type === 'heading' &&
      Number(object(node.attrs).level) === 1 &&
      !/^MEDITAÇÃO|^TÍTULO$/i.test(text(node))
  );
  const verse = section(document, 'VERSÍCULO PARA MEMORIZAR');
  const hasVerse = nodes.some(
    (node) =>
      node.type === 'heading' && text(node).trim().toUpperCase() === 'VERSÍCULO PARA MEMORIZAR'
  );
  const hasPrayer = nodes.some(
    (node) => node.type === 'heading' && text(node).trim().toUpperCase() === 'FALANDO COM DEUS'
  );
  const instructions = nodes.flatMap((node, index) => {
    if (node.type !== 'heading' || text(node).trim().toUpperCase() !== 'INSTRUÇÃO') return [];
    const remaining = nodes.slice(index + 1);
    const end = remaining.findIndex((item) => item.type === 'heading');
    return [(end < 0 ? remaining : remaining.slice(0, end)).map(text).join('\n').trim()];
  });
  const activities = Array.isArray(data.activities) ? data.activities : [];
  return {
    title: title ? text(title) : string(data.title),
    verseText: verse[0]?.replace(/^[“"]|[”"]$/g, '') ?? string(data.verseText),
    verseReference:
      verse[1]?.replace(/\s*—\s*NVI$/i, '') ?? (hasVerse ? '' : string(data.verseReference)),
    firstActivity: instructions[0] ?? string(object(activities[0]).instruction),
    secondActivity: instructions[1] ?? string(object(activities[1]).instruction),
    prayer: hasPrayer ? section(document, 'FALANDO COM DEUS').join('\n') : string(data.prayer),
    images: meditationActivityImages(data, 2),
  };
}

/** One canonical AST feeds both displayed copies and the existing save/PDF contract. */
export function updateYoungerMeditation(
  document: TiptapDocument,
  data: Record<string, unknown>,
  field: YoungerMeditationField,
  value: string
): TiptapDocument {
  const content = { ...readYoungerMeditation(document, data), [field]: value };
  return buildMeditationDocument({
    ...content,
    instructions: [content.firstActivity, content.secondActivity],
  });
}

export function youngerMeditationDisplayFit(content: YoungerMeditationContent) {
  const length = Math.max(content.firstActivity.length, content.secondActivity.length);
  const size = length > 850 ? 14 : length > 600 ? 16 : length > 400 ? 18 : 20;
  const charactersPerLine = 250 / ((size / 2) * 0.52);
  const lines = Math.max(
    ...[content.firstActivity, content.secondActivity].map((instruction) =>
      instruction
        .split(/\r?\n/)
        .reduce((sum, line) => sum + Math.max(1, Math.ceil(line.length / charactersPerLine)), 0)
    )
  );
  return {
    fontSize: (size * 2) / 3,
    titleFontSize: content.title.length > 110 ? 12 : 15.33,
    verseFontSize: content.verseText.length + content.verseReference.length > 250 ? 10.67 : 13.33,
    imageHeight: Math.max(60, Math.min(160, 245 - lines * (size / 2 + 1))),
  };
}
