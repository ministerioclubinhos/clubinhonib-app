import { expect, test } from '@playwright/test';
import type { TiptapDocument } from '@/services/aiLessonsService';
import { buildMeditationDocument } from '@/features/ai-lessons/meditation-editor-core/document';
import {
  meditationFieldDocument,
  preserveMeditationFormatting,
  replaceMeditationField,
} from '@/features/ai-lessons/meditation-editor-core/rich-document';

test('preserva a formatação dos outros campos e compartilha o AST entre as cópias', () => {
  const canonical = buildMeditationDocument({
    title: 'Jesus vive',
    verseText: 'Vida',
    verseReference: 'João 11',
    instructions: ['Circule.', 'Ordene.'],
    prayer: 'Jesus, obrigado.',
  });
  const rich: TiptapDocument = {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        attrs: { textAlign: 'center' },
        content: [
          {
            type: 'text',
            text: 'Circule.',
            marks: [
              { type: 'bold' },
              { type: 'textStyle', attrs: { color: '#ff0000', fontSize: '12pt' } },
            ],
          },
        ],
      },
    ],
  };
  const saved = replaceMeditationField(canonical, 'firstActivity', rich);
  const reloaded = preserveMeditationFormatting(canonical, saved);
  const otherEdited = replaceMeditationField(reloaded, 'prayer', {
    type: 'doc',
    content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Nova oração.' }] }],
  });
  expect(meditationFieldDocument(otherEdited, 'firstActivity', '')).toEqual(rich);
  expect(JSON.stringify(meditationFieldDocument(otherEdited, 'secondActivity', ''))).toContain(
    'Ordene.'
  );
});

test('preserva tabelas, listas e títulos dentro do campo sem confundir as seções', () => {
  const canonical = buildMeditationDocument({
    title: 'Jesus vive',
    verseText: 'Vida',
    verseReference: 'João 11',
    instructions: ['Primeira questão.', 'Segunda questão.'],
    prayer: 'Obrigado.',
  });
  const rich: TiptapDocument = {
    type: 'doc',
    content: [
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Perguntas' }] },
      {
        type: 'table',
        content: [
          {
            type: 'tableRow',
            content: [
              {
                type: 'tableCell',
                content: [
                  { type: 'paragraph', content: [{ type: 'text', text: 'Alternativa A' }] },
                ],
              },
            ],
          },
        ],
      },
      {
        type: 'bulletList',
        content: [
          {
            type: 'listItem',
            content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Lembre a lição.' }] }],
          },
        ],
      },
    ],
  };
  const saved = replaceMeditationField(canonical, 'firstActivity', rich);
  const restored = preserveMeditationFormatting(canonical, saved);
  expect(
    meditationFieldDocument(restored, 'firstActivity', '').content?.map((node) => node.type)
  ).toEqual(['heading', 'table', 'bulletList']);
  expect(JSON.stringify(meditationFieldDocument(restored, 'secondActivity', ''))).toContain(
    'Segunda questão.'
  );
});
