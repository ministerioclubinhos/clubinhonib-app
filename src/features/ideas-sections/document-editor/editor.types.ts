import type { Editor } from '@tiptap/core';

/** Documento do editor das ideias (JSON do TipTap), igual ao que a API guarda. */
export interface IdeaTiptapDocument {
  type: 'doc';
  content?: Array<Record<string, unknown>>;
}

export interface IdeaDocumentEditorProps {
  initialJson: IdeaTiptapDocument;
  onChange?: (json: IdeaTiptapDocument) => void;
  editable?: boolean;
}

export interface IdeaEditorAdvancedToolsProps {
  editor: Editor;
  fullscreen: boolean;
  onToggleFullscreen: () => void;
  onOpenTool?: () => void;
}

export enum IdeaEditorDialog {
  FORMAT = 'format',
  LINK = 'link',
  FIND = 'find',
}

export interface EditorTextMatch {
  from: number;
  to: number;
}

export enum IdeaEditorColorMode {
  TEXT = 'color',
  HIGHLIGHT = 'highlight',
}

export interface IdeaEditorColorToolsProps {
  mode?: IdeaEditorColorMode;
  editor: Editor;
  onOpenTool?: () => void;
}
