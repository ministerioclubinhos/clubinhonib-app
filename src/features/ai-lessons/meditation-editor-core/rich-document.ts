import type { TiptapDocument } from '@/services/aiLessonsService';
import { object, text } from './document';
import { MeditationTextField as Field, MEDITATION_SECTION_FIELDS } from './constants';

export function meditationFieldRange(
  document: TiptapDocument,
  field: string
): [number, number] | null {
  const nodes = document.content ?? [];
  const marked = nodes.flatMap((node, index) =>
    object(node.attrs).meditationField === field ? [index] : []
  );
  if (marked.length) return [marked[0], marked[marked.length - 1] + 1];
  if (field === Field.TITLE) {
    const index = nodes.findIndex(
      (node) =>
        node.type === 'heading' &&
        Number(object(node.attrs).level) === 1 &&
        !/^MEDITAÇÃO|^LIÇÃO\s+\d|^TÍTULO$/i.test(text(node).trim())
    );
    return index < 0 ? null : [index, index + 1];
  }
  const activity = [Field.FIRST_ACTIVITY, Field.SECOND_ACTIVITY, Field.THIRD_ACTIVITY].indexOf(
    field as Field
  );
  const headings = nodes.flatMap((node, index) =>
    node.type === 'heading' && text(node).trim().toUpperCase() === 'INSTRUÇÃO' ? [index] : []
  );
  const heading =
    activity >= 0
      ? headings[activity]
      : nodes.findIndex(
          (node) =>
            node.type === 'heading' &&
            text(node).trim().toUpperCase() ===
              MEDITATION_SECTION_FIELDS[field as keyof typeof MEDITATION_SECTION_FIELDS]
        );
  if (heading === undefined || heading < 0) return null;
  const start = heading + 1;
  const next = nodes
    .slice(start)
    .findIndex((node) => node.type === 'heading' && !object(node.attrs).meditationField);
  const end = next < 0 ? nodes.length : start + next;
  if (field === Field.VERSE_TEXT) return start < end ? [start, start + 1] : null;
  if (field === Field.VERSE_REFERENCE) return start + 1 < end ? [start + 1, start + 2] : null;
  return [start, end];
}

export function meditationFieldDocument(
  document: TiptapDocument,
  field: string,
  fallback: string
): TiptapDocument {
  const range = meditationFieldRange(document, field);
  const content = range
    ? document.content?.slice(...range).map((node) => {
        const sourceAttrs = object(node.attrs);
        const attrs = { ...sourceAttrs };
        delete attrs.meditationField;
        delete attrs.meditationRichType;
        delete attrs.meditationHeadingLevel;
        if (field === Field.TITLE) {
          if (sourceAttrs.meditationRichType === 'heading')
            attrs.level = sourceAttrs.meditationHeadingLevel ?? 1;
          else delete attrs.level;
          return {
            ...node,
            type: sourceAttrs.meditationRichType === 'heading' ? 'heading' : 'paragraph',
            attrs,
          };
        }
        return { ...node, attrs };
      })
    : undefined;
  return {
    type: 'doc',
    content: content?.length
      ? content
      : [{ type: 'paragraph', content: fallback ? [{ type: 'text', text: fallback }] : [] }],
  };
}

export function replaceMeditationField(
  document: TiptapDocument,
  field: string,
  value: TiptapDocument,
  preserveTitle = false
): TiptapDocument {
  const range = meditationFieldRange(document, field);
  if (!range) return document;
  const nodes = document.content ?? [];
  const replacement = value.content ?? [];
  return {
    ...document,
    content: [
      ...nodes.slice(0, range[0]),
      ...replacement.map((node) =>
        field === Field.TITLE
          ? {
              ...node,
              type: 'heading',
              attrs: {
                ...object(node.attrs),
                meditationField: field,
                meditationRichType:
                  object(node.attrs).meditationRichType ??
                  (preserveTitle ? 'paragraph' : node.type),
                meditationHeadingLevel:
                  object(node.attrs).meditationHeadingLevel ??
                  (preserveTitle ? undefined : object(node.attrs).level),
                level: 1,
              },
            }
          : { ...node, attrs: { ...object(node.attrs), meditationField: field } }
      ),
      ...nodes.slice(range[1]),
    ],
  };
}

export function preserveMeditationFormatting(
  canonical: TiptapDocument,
  previous: TiptapDocument
): TiptapDocument {
  return Object.values(Field).reduce((result, field) => {
    const range = meditationFieldRange(previous, field);
    return range
      ? replaceMeditationField(
          result,
          field,
          {
            type: 'doc',
            content: previous.content?.slice(...range),
          },
          true
        )
      : result;
  }, canonical);
}
