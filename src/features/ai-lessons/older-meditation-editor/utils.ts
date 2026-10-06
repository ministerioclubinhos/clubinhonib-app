import type { TiptapDocument } from '@/services/aiLessonsService';
import { OlderMeditationField, type OlderMeditationContent } from './types';

import {
  object,
  text,
  string,
  section,
  buildMeditationDocument,
  meditationActivityImages,
} from '../meditation-editor-core/document';

export function readOlderMeditation(
  document: TiptapDocument,
  data: Record<string, unknown>
): OlderMeditationContent {
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
  const hasHeading = (heading: string) =>
    nodes.some((node) => node.type === 'heading' && text(node).trim().toUpperCase() === heading);
  const activities = Array.isArray(data.activities) ? data.activities : [];
  return {
    title: title ? text(title) : string(data.title),
    verseText: verse[0]?.replace(/^[“"]|[”"]$/g, '') ?? string(data.verseText),
    verseReference:
      verse[1]?.replace(/\s*—\s*NVI$/i, '') ?? (hasVerse ? '' : string(data.verseReference)),
    firstActivity: instructions[0] ?? string(object(activities[0]).instruction),
    secondActivity: instructions[1] ?? string(object(activities[1]).instruction),
    thirdActivity: instructions[2] ?? string(object(activities[2]).instruction),
    biblicalText: hasHeading('TEXTO BÍBLICO')
      ? section(document, 'TEXTO BÍBLICO').join('\n')
      : string(data.biblicalText),
    introduction: hasHeading('ENTENDENDO A LIÇÃO')
      ? section(document, 'ENTENDENDO A LIÇÃO').join('\n')
      : hasHeading('INTRODUÇÃO')
        ? section(document, 'INTRODUÇÃO').join('\n')
        : string(data.introduction),
    prayer: hasPrayer ? section(document, 'FALANDO COM DEUS').join('\n') : string(data.prayer),
    images: meditationActivityImages(data, 3),
  };
}

/** One canonical AST feeds the full-page editor and the existing save/PDF contract. */
export function updateOlderMeditation(
  document: TiptapDocument,
  data: Record<string, unknown>,
  field: OlderMeditationField,
  value: string
): TiptapDocument {
  const content = { ...readOlderMeditation(document, data), [field]: value };
  return buildMeditationDocument({
    ...content,
    instructions: [content.firstActivity, content.secondActivity, content.thirdActivity],
  });
}

export function olderMeditationDisplayFit(content: OlderMeditationContent) {
  const length =
    content.introduction.length +
    content.firstActivity.length +
    content.secondActivity.length +
    content.thirdActivity.length;
  return {
    fontSize: length > 4500 ? 12 : length > 3000 ? 13.33 : 14.67,
    imageHeight: length > 2500 ? 100 : 140,
  };
}
