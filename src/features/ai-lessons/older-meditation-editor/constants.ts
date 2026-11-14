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
  fourthActivity: 'Instrução da quarta questão',
  biblicalText: 'Relatos estudados (subtítulo)',
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
  fourthActivity: 'fourth-activity',
  biblicalText: 'biblical-text',
  introduction: 'introduction',
};

/** Questões da folha, na ordem impressa (de 2 a 4, como nas folhas feitas à mão). */
export const OLDER_MEDITATION_ACTIVITY_FIELDS = [
  OlderMeditationField.FIRST_ACTIVITY,
  OlderMeditationField.SECOND_ACTIVITY,
  OlderMeditationField.THIRD_ACTIVITY,
  OlderMeditationField.FOURTH_ACTIVITY,
] as const;
export const OLDER_MEDITATION_MIN_ACTIVITIES = 2;
export const OLDER_MEDITATION_MAX_ACTIVITIES = 4;
/** Folhas salvas antes da regra de 2 a 4 questões tinham sempre três. */
export const OLDER_MEDITATION_LEGACY_ACTIVITIES = 3;

export const OLDER_MEDITATION_DISPLAY = {
  fontSize: 14.67,
  minimumFontSize: 13.33,
  imageHeight: 230,
  rowGap: 16,
  maximumRowExpansion: 1.18,
  overflowTolerance: 2,
} as const;
