import { OlderMeditationField } from './types';

export const OLDER_MEDITATION_PAGE = {
  width: 794,
  height: 1123,
  margin: 24,
  imageWidth: 290,
  imageHeight: 160,
  logo: '/header_esquerdo_meditação.png',
  colors: { black: '#252223', yellow: '#fff200', gray: '#e5e5e5', prayer: '#686868' },
} as const;
export const OLDER_MEDITATION_FIELD_LABELS: Record<OlderMeditationField, string> = {
  title: 'Título',
  verseText: 'Texto do versículo',
  verseReference: 'Referência do versículo',
  firstActivity: 'Instrução da primeira questão',
  secondActivity: 'Instrução da segunda questão',
  prayer: 'Oração',
  thirdActivity: 'Instrução da terceira questão',
  biblicalText: 'Texto bíblico',
  introduction: 'Entendendo a lição',
};

export const OLDER_MEDITATION_FIELD_IDS: Record<OlderMeditationField, string> = {
  title: 'title',
  verseText: 'verse-text',
  verseReference: 'verse-reference',
  firstActivity: 'first-activity',
  secondActivity: 'second-activity',
  prayer: 'prayer',
  thirdActivity: 'third-activity',
  biblicalText: 'biblical-text',
  introduction: 'introduction',
};
