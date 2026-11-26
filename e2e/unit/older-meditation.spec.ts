import { expect, test } from '@playwright/test';
import {
  olderMeditationActivityFields,
  olderMeditationDisplayFit,
  olderMeditationFieldDocument,
  readOlderMeditation,
  updateOlderMeditation,
} from '@/features/ai-lessons/older-meditation-editor/utils';
import { OlderMeditationField } from '@/features/ai-lessons/older-meditation-editor/types';
import { object } from '@/features/ai-lessons/meditation-editor-core/document';
import type { TiptapDocument } from '@/services/aiLessonsService';

test('preserva três desafios, três imagens e campos apagados no core dos maiores', () => {
  const document: TiptapDocument = { type: 'doc', content: [] };
  const data = {
    title: 'Jesus vive',
    biblicalText: 'João 11',
    introduction: 'Recorde a lição.',
    activities: [
      { instruction: 'Circule.' },
      { instruction: 'Decifre.' },
      { instruction: 'Ordene.', answer: 'Privado' },
    ],
    printableAssets: [
      { id: '1', url: '/first.png' },
      { id: '2', url: '/second.png' },
      { id: '3', url: '/third.png' },
    ],
  };
  const edited = updateOlderMeditation(
    document,
    data,
    OlderMeditationField.THIRD_ACTIVITY,
    'Numere os acontecimentos.'
  );
  expect(readOlderMeditation(edited, data)).toMatchObject({
    firstActivity: 'Circule.',
    secondActivity: 'Decifre.',
    thirdActivity: 'Numere os acontecimentos.',
    activityCount: 3,
    images: ['/first.png', '/second.png', '/third.png', ''],
  });
  const cleared = updateOlderMeditation(edited, data, OlderMeditationField.INTRODUCTION, '');
  expect(readOlderMeditation(cleared, data).introduction).toBe('');
  expect(JSON.stringify(cleared)).not.toContain('Privado');
});

test('mantém grades editáveis e alinhadas sem converter o exercício em imagem', () => {
  const content = 'Caça-palavras: encontre AMOR.\nA M O R\nB C D E\nF G H I\nPalavras: AMOR';
  const document = olderMeditationFieldDocument(
    { type: 'doc', content: [] },
    OlderMeditationField.FIRST_ACTIVITY,
    content
  );
  const grids = document.content?.filter(
    (node) =>
      Array.isArray(node.content) &&
      node.content.some((child) => {
        const marks = object(child).marks;
        return Array.isArray(marks) && marks.some((mark) => object(mark).type === 'textStyle');
      })
  );
  expect(grids).toHaveLength(3);
  expect(JSON.stringify(grids)).toContain('Courier New');
  expect(JSON.stringify(document)).not.toContain('image');
});

test('não reduz texto longo a uma fonte ilegível nem força três faixas iguais', () => {
  const content = readOlderMeditation(
    { type: 'doc', content: [] },
    {
      activities: [
        { instruction: 'Texto '.repeat(1200) },
        { instruction: 'Curto.' },
        { instruction: 'Outro.' },
      ],
    }
  );
  const fit = olderMeditationDisplayFit(content);
  expect(fit.fontSize).toBeGreaterThanOrEqual(13.33);
  expect(fit.activityWeights[0]).toBeGreaterThan(fit.activityWeights[1]);
});

test('mostra de 2 a 4 questões, conforme a folha gerada, com arte só onde houver', () => {
  const data = (count: number) => ({
    activities: Array.from({ length: count }, (_, index) => ({
      instruction: `Questão ${index + 1}.`,
    })),
    printableAssets: [{ id: '4', url: '/fourth.png' }],
  });
  const four = readOlderMeditation({ type: 'doc', content: [] }, data(4));
  expect(four.activityCount).toBe(4);
  expect(four.fourthActivity).toBe('Questão 4.');
  expect(four.images).toEqual(['', '', '', '/fourth.png']);
  expect(olderMeditationActivityFields(four)).toEqual([
    OlderMeditationField.FIRST_ACTIVITY,
    OlderMeditationField.SECOND_ACTIVITY,
    OlderMeditationField.THIRD_ACTIVITY,
    OlderMeditationField.FOURTH_ACTIVITY,
  ]);
  expect(olderMeditationDisplayFit(four).activityWeights).toHaveLength(4);
  const edited = updateOlderMeditation(
    { type: 'doc', content: [] },
    data(4),
    OlderMeditationField.FOURTH_ACTIVITY,
    'Quarta revisada.'
  );
  expect(readOlderMeditation(edited, data(4)).fourthActivity).toBe('Quarta revisada.');

  const two = readOlderMeditation({ type: 'doc', content: [] }, data(2));
  expect(two.activityCount).toBe(2);
  expect(olderMeditationActivityFields(two)).toHaveLength(2);
  expect(
    JSON.stringify(
      updateOlderMeditation(
        { type: 'doc', content: [] },
        data(2),
        OlderMeditationField.TITLE,
        'Tema'
      )
    )
  ).not.toContain('ATIVIDADE 3');
});
