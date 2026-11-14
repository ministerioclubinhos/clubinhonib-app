import {
  OLDER_MEDITATION_ACTIVITY_FIELDS,
  OLDER_MEDITATION_DISPLAY as D,
  OLDER_MEDITATION_LEGACY_ACTIVITIES,
  OLDER_MEDITATION_MAX_ACTIVITIES,
  OLDER_MEDITATION_MIN_ACTIVITIES,
} from './constants';
import { meditationFieldDocument } from '../meditation-editor-core/rich-document';
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
    if (
      node.type !== 'heading' ||
      object(node.attrs).meditationField ||
      text(node).trim().toUpperCase() !== 'INSTRUÇÃO'
    )
      return [];
    const remaining = nodes.slice(index + 1);
    const end = remaining.findIndex(
      (item) => item.type === 'heading' && !object(item.attrs).meditationField
    );
    return [(end < 0 ? remaining : remaining.slice(0, end)).map(text).join('\n').trim()];
  });
  const hasHeading = (heading: string) =>
    nodes.some((node) => node.type === 'heading' && text(node).trim().toUpperCase() === heading);
  const activities = Array.isArray(data.activities) ? data.activities : [];
  const activityCount = Math.min(
    OLDER_MEDITATION_MAX_ACTIVITIES,
    Math.max(
      OLDER_MEDITATION_MIN_ACTIVITIES,
      instructions.length || activities.length || OLDER_MEDITATION_LEGACY_ACTIVITIES
    )
  );
  return {
    title: title ? text(title) : string(data.title),
    verseText: verse[0]?.replace(/^[“"]|[”"]$/g, '') ?? string(data.verseText),
    verseReference:
      verse[1]?.replace(/\s*—\s*NVI$/i, '') ?? (hasVerse ? '' : string(data.verseReference)),
    firstActivity: instructions[0] ?? string(object(activities[0]).instruction),
    secondActivity: instructions[1] ?? string(object(activities[1]).instruction),
    thirdActivity: instructions[2] ?? string(object(activities[2]).instruction),
    fourthActivity: instructions[3] ?? string(object(activities[3]).instruction),
    activityCount,
    biblicalText: hasHeading('TEXTO BÍBLICO')
      ? section(document, 'TEXTO BÍBLICO').join('\n')
      : string(data.biblicalText),
    introduction: hasHeading('ENTENDENDO A LIÇÃO')
      ? section(document, 'ENTENDENDO A LIÇÃO').join('\n')
      : hasHeading('INTRODUÇÃO')
        ? section(document, 'INTRODUÇÃO').join('\n')
        : string(data.introduction),
    prayer: hasPrayer ? section(document, 'FALANDO COM DEUS').join('\n') : string(data.prayer),
    images: meditationActivityImages(data, OLDER_MEDITATION_MAX_ACTIVITIES),
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
    instructions: olderMeditationInstructions(content),
  });
}

/** Campos das questões que a folha imprime, na ordem. */
export function olderMeditationActivityFields(content: OlderMeditationContent) {
  return OLDER_MEDITATION_ACTIVITY_FIELDS.slice(0, content.activityCount);
}

export function olderMeditationInstructions(content: OlderMeditationContent): string[] {
  return olderMeditationActivityFields(content).map((field) => content[field]);
}

export function olderMeditationDisplayFit(content: OlderMeditationContent) {
  const instructions = olderMeditationInstructions(content);
  const length =
    content.introduction.length + instructions.reduce((sum, item) => sum + item.length, 0);
  const imageCount = content.images.slice(0, instructions.length).filter(Boolean).length;
  return {
    fontSize: length > 3000 || (imageCount >= 2 && length > 2300) ? D.minimumFontSize : D.fontSize,
    imageHeight: D.imageHeight,
    activityWeights: instructions.map((instruction, index) => {
      const columns = content.images[index] ? 58 : 100;
      const lines = instruction
        .split(/\r?\n/)
        .reduce((sum, line) => sum + Math.max(1, Math.ceil(line.length / columns)), 0);
      return Math.max(lines * 18 + 24, content.images[index] ? D.imageHeight : 80);
    }),
  };
}

/** Native text stays editable; puzzle rows use a monospaced font rather than a bitmap. */
export function olderMeditationFieldDocument(
  document: TiptapDocument,
  field: OlderMeditationField,
  fallback: string
): TiptapDocument {
  const value = meditationFieldDocument(document, field, fallback);
  if (!/caça[ -]palavras|cruzadinha/i.test(fallback)) return value;
  return {
    ...value,
    content: value.content?.flatMap((node) => {
      if (
        node.type !== 'paragraph' ||
        !Array.isArray(node.content) ||
        !node.content.every((child) => object(child).type === 'text')
      )
        return [node];
      const lines: Array<Array<Record<string, unknown>>> = [[]];
      node.content.forEach((raw) => {
        const child = object(raw);
        string(child.text)
          .split(/\r?\n/)
          .forEach((part, index) => {
            if (index) lines.push([]);
            if (part) lines[lines.length - 1].push({ ...child, text: part });
          });
      });
      return lines.map((line) => {
        const isGrid = /^[A-ZÀ-Ü0-9#._\s]{4,}$/.test(line.map(text).join('').trim());
        return {
          ...node,
          content: line.map((child) => {
            if (!isGrid) return child;
            const marks = Array.isArray(child.marks) ? child.marks.map(object) : [];
            const style = marks.find((mark) => mark.type === 'textStyle');
            return {
              ...child,
              marks: [
                ...marks.filter((mark) => mark.type !== 'textStyle'),
                {
                  type: 'textStyle',
                  attrs: { fontFamily: 'Courier New', ...object(style?.attrs) },
                },
              ],
            };
          }),
        };
      });
    }),
  };
}
