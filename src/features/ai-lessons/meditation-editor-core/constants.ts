export enum MeditationTextField {
  TITLE = 'title',
  VERSE_TEXT = 'verseText',
  VERSE_REFERENCE = 'verseReference',
  FIRST_ACTIVITY = 'firstActivity',
  SECOND_ACTIVITY = 'secondActivity',
  THIRD_ACTIVITY = 'thirdActivity',
  PRAYER = 'prayer',
  BIBLICAL_TEXT = 'biblicalText',
  INTRODUCTION = 'introduction',
}
export const MEDITATION_FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24];
export const MEDITATION_FONTS = ['Arial', 'Calibri', 'Times New Roman', 'Verdana'];
export const MEDITATION_SECTION_FIELDS = {
  verseText: 'VERSÍCULO PARA MEMORIZAR',
  verseReference: 'VERSÍCULO PARA MEMORIZAR',
  prayer: 'FALANDO COM DEUS',
  biblicalText: 'TEXTO BÍBLICO',
  introduction: 'ENTENDENDO A LIÇÃO',
} as const;
