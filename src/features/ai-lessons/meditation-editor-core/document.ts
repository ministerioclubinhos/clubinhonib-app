import type { TiptapDocument } from '@/services/aiLessonsService';
import { MeditationTextField } from './constants';
import type { MeditationDocumentContent } from './types';

export function object(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}
export function text(value: unknown): string {
  const node = object(value);
  if (node.type === 'hardBreak') return '\n';
  return typeof node.text === 'string'
    ? node.text
    : Array.isArray(node.content)
      ? node.content
          .map(text)
          .join(['bulletList', 'orderedList', 'listItem'].includes(String(node.type)) ? '\n' : '')
      : '';
}
export const string = (value: unknown): string => (typeof value === 'string' ? value : '');
export function section(document: TiptapDocument, heading: string): string[] {
  const nodes = document.content ?? [];
  const index = nodes.findIndex(
    (node) =>
      node.type === 'heading' &&
      !object(node.attrs).meditationField &&
      text(node).toUpperCase() === heading
  );
  if (index < 0) return [];
  const rest = nodes.slice(index + 1);
  const end = rest.findIndex(
    (node) => node.type === 'heading' && !object(node.attrs).meditationField
  );
  return (end < 0 ? rest : rest.slice(0, end)).map(text).filter(Boolean);
}

export function buildMeditationDocument(content: MeditationDocumentContent): TiptapDocument {
  // ProseMirror rejects empty text nodes, so an empty heading carries no content at all.
  const heading = (text: string, level = 2, attrs: Record<string, unknown> = {}) => ({
    type: 'heading',
    attrs: { level, ...attrs },
    content: text ? [{ type: 'text', text }] : [],
  });
  const paragraph = (text: string) => ({
    type: 'paragraph',
    content: text ? [{ type: 'text', text }] : [],
  });
  return {
    type: 'doc',
    content: [
      // Marked so the title is found even when it reads like a section label.
      heading(content.title, 1, { meditationField: MeditationTextField.TITLE }),
      heading('VERSÍCULO PARA MEMORIZAR'),
      paragraph(`“${content.verseText}”`),
      paragraph(content.verseReference),
      ...(content.biblicalText !== undefined
        ? [heading('TEXTO BÍBLICO'), paragraph(content.biblicalText)]
        : []),
      ...(content.introduction !== undefined
        ? [heading('ENTENDENDO A LIÇÃO'), paragraph(content.introduction)]
        : []),
      ...content.instructions.flatMap((instruction, index) => [
        heading(`ATIVIDADE ${index + 1}`, 3),
        heading('INSTRUÇÃO', 3),
        paragraph(instruction),
      ]),
      heading('FALANDO COM DEUS'),
      paragraph(content.prayer),
    ],
  };
}

export function meditationActivityImages(data: Record<string, unknown>, count: number): string[] {
  const assets = Array.isArray(data.printableAssets) ? data.printableAssets : [];
  return Array.from({ length: count }, (_, index) => {
    const asset =
      assets.find(
        (item) => Number(string(object(item).id).match(/(?:^|[-_])([1-4])$/)?.[1]) === index + 1
      ) ?? (assets.length === count ? assets[index] : undefined);
    return string(object(asset).url);
  });
}
