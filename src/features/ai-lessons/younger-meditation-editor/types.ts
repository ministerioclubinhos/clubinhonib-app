import type { TiptapDocument } from '@/services/aiLessonsService';

export enum YoungerMeditationField {
  TITLE = 'title',
  VERSE_TEXT = 'verseText',
  VERSE_REFERENCE = 'verseReference',
  FIRST_ACTIVITY = 'firstActivity',
  SECOND_ACTIVITY = 'secondActivity',
  PRAYER = 'prayer',
}

export interface YoungerMeditationContent {
  title: string;
  verseText: string;
  verseReference: string;
  firstActivity: string;
  secondActivity: string;
  prayer: string;
  images: string[];
}

export interface YoungerMeditationEditorProps {
  initialJson: TiptapDocument;
  onChange?: (json: TiptapDocument) => void;
  editable?: boolean;
  structuredData: Record<string, unknown>;
}
