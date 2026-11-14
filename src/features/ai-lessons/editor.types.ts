import type { Editor } from '@tiptap/core';
import type { TiptapDocument } from '@/services/aiLessonsService';

export interface LessonDocumentEditorProps {
  initialJson: TiptapDocument;
  onChange?: (json: TiptapDocument) => void;
  editable?: boolean;
}

export interface LessonEditorAdvancedToolsProps {
  editor: Editor;
  fullscreen: boolean;
  onToggleFullscreen: () => void;
  onOpenTool?: () => void;
}

export enum LessonEditorDialog {
  FORMAT = 'format',
  LINK = 'link',
  FIND = 'find',
}

export interface EditorTextMatch {
  from: number;
  to: number;
}

export enum LessonEditorColorMode {
  TEXT = 'color',
  HIGHLIGHT = 'highlight',
}

export interface LessonEditorColorToolsProps {
  mode?: LessonEditorColorMode;
  editor: Editor;
  onOpenTool?: () => void;
}
