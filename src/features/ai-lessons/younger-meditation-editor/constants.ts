import { YoungerMeditationField } from './types';

export const YOUNGER_MEDITATION_PAGE = {
  width: 794,
  height: 1123,
  margin: 24,
  gap: 20,
  copyHeight: 487,
  imageWidth: 290,
  imageHeight: 160,
  logo: '/header_esquerdo_meditação.png',
  colors: { black: '#252223', yellow: '#fff200', gray: '#e5e5e5', prayer: '#686868' },
} as const;
export const YOUNGER_MEDITATION_FIELD_LABELS: Record<YoungerMeditationField, string> = {
  title: 'Título',
  verseText: 'Texto do versículo',
  verseReference: 'Referência do versículo',
  firstActivity: 'Instrução da primeira questão',
  secondActivity: 'Instrução da segunda questão',
  prayer: 'Oração',
};
export const YOUNGER_MEDITATION_COPIES = ['upper', 'lower'] as const;

export const YOUNGER_MEDITATION_FIELD_IDS: Record<YoungerMeditationField, string> = {
  title: 'title',
  verseText: 'verse-text',
  verseReference: 'verse-reference',
  firstActivity: 'first-activity',
  secondActivity: 'second-activity',
  prayer: 'prayer',
};
