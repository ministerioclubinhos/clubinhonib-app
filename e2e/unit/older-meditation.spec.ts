import { expect, test } from '@playwright/test';
import {
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
    images: ['/first.png', '/second.png', '/third.png'],
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
