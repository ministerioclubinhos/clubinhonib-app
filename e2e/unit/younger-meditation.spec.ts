import { expect, test } from '@playwright/test';
import {
  readYoungerMeditation,
  updateYoungerMeditation,
} from '@/features/ai-lessons/younger-meditation-editor/utils';
import { YoungerMeditationField } from '@/features/ai-lessons/younger-meditation-editor/types';
import type { TiptapDocument } from '@/services/aiLessonsService';

const data = {
  title: 'Jesus vive',
  verseText: 'Eu sou a vida.',
  verseReference: 'João 11:25',
  prayer: 'Jesus, obrigado.',
  activities: [
    { instruction: 'Pinte Jesus.', answer: 'Jesus' },
    { instruction: 'Pinte seus amigos.' },
  ],
  printableAssets: [{ url: '/first.png' }, { url: '/second.png' }],
};
test('recupera instruções de ASTs antigos e mantém os assets', () => {
  const document: TiptapDocument = {
    type: 'doc',
    content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Resposta: Jesus' }] }],
  };
  expect(readYoungerMeditation(document, data)).toMatchObject({
    firstActivity: 'Pinte Jesus.',
    secondActivity: 'Pinte seus amigos.',
    images: ['/first.png', '/second.png'],
  });
});
test('edita uma fonte única para as duas cópias e conserva as demais instruções', () => {
  const document = updateYoungerMeditation(
    { type: 'doc' },
    data,
    YoungerMeditationField.FIRST_ACTIVITY,
    'Pinte a cena de Jesus.'
  );
  const next = updateYoungerMeditation(
    document,
    data,
    YoungerMeditationField.TITLE,
    'Jesus ressuscitou'
  );
  expect(readYoungerMeditation(next, data)).toMatchObject({
    title: 'Jesus ressuscitou',
    firstActivity: 'Pinte a cena de Jesus.',
    secondActivity: 'Pinte seus amigos.',
  });
  expect(JSON.stringify(next)).not.toContain('Resposta:');
  expect(data.title).toBe('Jesus vive');
});

test('conserva todos os parágrafos de uma instrução salva no editor antigo', () => {
  const document: TiptapDocument = {
    type: 'doc',
    content: [
      { type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text: 'INSTRUÇÃO' }] },
      { type: 'paragraph', content: [{ type: 'text', text: 'Jesus voltou à vida.' }] },
      { type: 'paragraph', content: [{ type: 'text', text: 'Pinte Jesus.' }] },
      { type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text: 'RESPOSTA' }] },
      { type: 'paragraph', content: [{ type: 'text', text: 'Gabarito interno.' }] },
    ],
  };
  expect(readYoungerMeditation(document, data).firstActivity).toBe(
    'Jesus voltou à vida.\nPinte Jesus.'
  );
  expect(readYoungerMeditation(document, data).firstActivity).not.toContain('Gabarito');
});

test('permite limpar um campo sem restaurar o conteúdo estruturado antigo', () => {
  let document = updateYoungerMeditation({ type: 'doc' }, data, YoungerMeditationField.PRAYER, '');
  document = updateYoungerMeditation(document, data, YoungerMeditationField.VERSE_REFERENCE, '');
  expect(readYoungerMeditation(document, data)).toMatchObject({ prayer: '', verseReference: '' });
});
