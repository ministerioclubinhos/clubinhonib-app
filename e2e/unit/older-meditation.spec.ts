import { expect, test } from '@playwright/test';
import {
  readOlderMeditation,
  updateOlderMeditation,
} from '@/features/ai-lessons/older-meditation-editor/utils';
import { OlderMeditationField } from '@/features/ai-lessons/older-meditation-editor/types';
import type { TiptapDocument } from '@/services/aiLessonsService';

test('preserva três desafios, arte opcional e campos apagados no core dos maiores', () => {
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
    printableAssets: [{ id: '3', url: '/third.png' }],
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
    images: ['', '', '/third.png'],
  });
  const cleared = updateOlderMeditation(edited, data, OlderMeditationField.INTRODUCTION, '');
  expect(readOlderMeditation(cleared, data).introduction).toBe('');
  expect(JSON.stringify(cleared)).not.toContain('Privado');
});
