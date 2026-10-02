import { expect, test } from '@playwright/test';
import { Schema } from '@tiptap/pm/model';
import {
  countEditorText,
  findEditorTextMatches,
  normalizeEditorLinkUrl,
  normalizeEditorColor,
} from '@/features/ai-lessons/editor.utils';

const schema = new Schema({
  nodes: {
    doc: { content: 'paragraph+' },
    paragraph: { content: 'inline*', group: 'block' },
    text: { group: 'inline' },
    hardBreak: { inline: true, group: 'inline' },
  },
  marks: { bold: {} },
});

test('localiza através de marcas sem unir parágrafos ou perder posições após quebras', () => {
  const doc = schema.node('doc', null, [
    schema.node('paragraph', null, [
      schema.text('Je'),
      schema.text('sus', [schema.mark('bold')]),
      schema.node('hardBreak'),
      schema.text('Jesus'),
    ]),
    schema.node('paragraph', null, schema.text('JESUS')),
  ]);
  expect(findEditorTextMatches(doc, 'Jesus')).toEqual([
    { from: 1, to: 6 },
    { from: 7, to: 12 },
    { from: 14, to: 19 },
  ]);
  expect(findEditorTextMatches(doc, 'Jesus', true)).toHaveLength(2);
  expect(findEditorTextMatches(doc, 'JesusJESUS')).toEqual([]);
  expect(findEditorTextMatches(doc, '')).toEqual([]);
});

test('conta palavras e caracteres Unicode e aceita apenas links compatíveis com o PDF', () => {
  const doc = schema.node('doc', null, schema.node('paragraph', null, schema.text('Olá Jesus 😀')));
  expect(countEditorText(doc)).toEqual({ words: 3, characters: 11 });
  expect(normalizeEditorLinkUrl(' example.com/apoio ')).toBe('https://example.com/apoio');
  expect(normalizeEditorLinkUrl('mailto:professor@example.com')).toBe(
    'mailto:professor@example.com'
  );
  expect(normalizeEditorLinkUrl('javascript:alert(1)')).toBeNull();
  expect(normalizeEditorLinkUrl('file:///etc/passwd')).toBeNull();
});

test('normaliza cores personalizadas e recusa códigos inválidos', () => {
  expect(normalizeEditorColor(' #7c3aed ')).toBe('#7C3AED');
  expect(normalizeEditorColor('red')).toBeNull();
  expect(normalizeEditorColor('#12')).toBeNull();
});
