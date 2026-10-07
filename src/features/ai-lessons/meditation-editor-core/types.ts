export interface MeditationDocumentContent {
  title: string;
  verseText: string;
  verseReference: string;
  instructions: string[];
  prayer: string;
  biblicalText?: string;
  introduction?: string;
}

export interface MeditationRichFieldProps {
  document: import('@/services/aiLessonsService').TiptapDocument;
  field: string;
  autoActivate?: boolean;
  testId: string;
  label: string;
  editable: boolean;
  centered: boolean;
  onActivate: (editor: import('@tiptap/react').Editor) => void;
  onChange: (document: import('@/services/aiLessonsService').TiptapDocument) => void;
}
export interface MeditationToolbarProps {
  editor: import('@tiptap/react').Editor | null;
  fullscreen: boolean;
  onToggleFullscreen: () => void;
}
