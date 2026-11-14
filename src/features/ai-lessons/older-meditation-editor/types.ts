import type { TiptapDocument } from '@/services/aiLessonsService';

export enum OlderMeditationField {
  TITLE = 'title',
  VERSE_TEXT = 'verseText',
  VERSE_REFERENCE = 'verseReference',
  FIRST_ACTIVITY = 'firstActivity',
  SECOND_ACTIVITY = 'secondActivity',
  THIRD_ACTIVITY = 'thirdActivity',
  FOURTH_ACTIVITY = 'fourthActivity',
  BIBLICAL_TEXT = 'biblicalText',
  INTRODUCTION = 'introduction',
  PRAYER = 'prayer',
}

export interface OlderMeditationContent {
  title: string;
  verseText: string;
  verseReference: string;
  firstActivity: string;
  secondActivity: string;
  thirdActivity: string;
  fourthActivity: string;
  /** Questões impressas na folha: de 2 a 4, conforme o tamanho dos exercícios. */
  activityCount: number;
  biblicalText: string;
  introduction: string;
  prayer: string;
  images: string[];
}

export interface OlderMeditationEditorProps {
  initialJson: TiptapDocument;
  onChange?: (json: TiptapDocument) => void;
  editable?: boolean;
  structuredData: Record<string, unknown>;
  onOverflowChange?: (overflow: boolean) => void;
}
