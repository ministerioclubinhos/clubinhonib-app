import { useEffect } from 'react';
import { Box } from '@mui/material';
import { EditorContent, useEditor, type Editor } from '@tiptap/react';
import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { LessonParagraphSpacing } from '../editor.extensions';
import StarterKit from '@tiptap/starter-kit';
import { TextAlign } from '@tiptap/extension-text-align';
import { TextStyle, FontFamily, FontSize } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Highlight } from '@tiptap/extension-highlight';
import type { TiptapDocument } from '@/services/aiLessonsService';
import type { MeditationRichFieldProps } from './types';
import { MeditationTextField } from './constants';

export function MeditationRichField({
  document,
  field,
  testId,
  label,
  editable,
  centered,
  autoActivate = false,
  onActivate,
  onChange,
}: MeditationRichFieldProps) {
  const editor: Editor | null = useEditor({
    extensions: [
      StarterKit.configure({ link: { openOnClick: false } }),
      Subscript,
      Superscript,
      LessonParagraphSpacing,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      TextStyle,
      FontFamily,
      FontSize,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ['paragraph', 'heading', 'blockquote'] }),
    ],
    content: document,
    editable,
    editorProps: {
      handleKeyDown: (_view, event) => {
        if (
          event.key === 'Enter' &&
          [
            MeditationTextField.TITLE,
            MeditationTextField.VERSE_TEXT,
            MeditationTextField.VERSE_REFERENCE,
          ].includes(field as MeditationTextField)
        )
          return editor?.commands.setHardBreak() ?? false;
        return false;
      },
      attributes: {
        'data-testid': testId,
        'aria-label': label,
        role: 'textbox',
        'aria-multiline': 'true',
      },
    },
    onCreate: ({ editor }) => {
      if (autoActivate) onActivate(editor);
    },
    onFocus: ({ editor }) => onActivate(editor),
    onUpdate: ({ editor }) => onChange(editor.getJSON() as TiptapDocument),
  });
  useEffect(() => {
    if (
      editor &&
      JSON.stringify(editor.getJSON()) !==
        JSON.stringify(editor.schema.nodeFromJSON(document).toJSON())
    )
      editor.commands.setContent(document, { emitUpdate: false });
  }, [document, editor]);
  useEffect(() => {
    editor?.setEditable(editable);
  }, [editable, editor]);
  return (
    <Box
      data-testid={`${testId}-field`}
      sx={{
        width: '100%',
        minWidth: 0,
        '& .tiptap': {
          outline: 'none',
          minHeight: '1.2em',
          textAlign: centered ? 'center' : 'left',
          overflowWrap: 'anywhere',
          whiteSpace: 'pre-wrap',
          '& p': { m: 0, lineHeight: 1.2, fontSize: 'inherit', fontFamily: 'inherit' },
          '& ul, & ol': { m: 0, pl: 2 },
          '& h1, & h2, & h3': { m: 0, lineHeight: 1.2, color: 'inherit' },
          '& h1': { fontSize: '2em' },
          '& h2': { fontSize: '1.5em' },
          '& h3': { fontSize: '1.2em' },
          '& blockquote': { my: 0, mx: 1, pl: 1, borderLeft: '3px solid #ccc' },
          '& table': { borderCollapse: 'collapse', width: '100%', tableLayout: 'fixed' },
          '& td, & th': { border: '1px solid #777', p: '3px', verticalAlign: 'top' },
          '& th': { bgcolor: '#eee' },
          '& .selectedCell': { bgcolor: '#dbeafe' },
          '& .column-resize-handle': {
            position: 'absolute',
            right: '-2px',
            top: 0,
            bottom: 0,
            width: '4px',
            bgcolor: '#1976d2',
          },
          '&:focus': { outline: editable ? '2px solid #1976d2' : undefined },
        },
      }}
    >
      <EditorContent editor={editor} />
    </Box>
  );
}
