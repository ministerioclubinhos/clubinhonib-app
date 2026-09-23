import { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Box, IconButton, Paper, Stack, Tooltip, useMediaQuery, useTheme } from '@mui/material';
import { FormatBold, FormatItalic, FormatListBulleted, FormatListNumbered, Redo, Undo } from '@mui/icons-material';
import { TiptapDocument } from '@/services/aiLessonsService';

type Props = { initialJson: TiptapDocument; onChange: (json: TiptapDocument) => void };

export const LibreOfficeDocEditor = ({ initialJson, onChange }: Props) => {
  const theme = useTheme(); const compact = useMediaQuery(theme.breakpoints.down('md'));
  const editor = useEditor({ extensions: [StarterKit], content: initialJson, onUpdate: ({ editor: value }) => onChange(value.getJSON() as TiptapDocument) });
  useEffect(() => { if (editor && JSON.stringify(editor.getJSON()) !== JSON.stringify(initialJson)) editor.commands.setContent(initialJson); }, [editor, initialJson]);
  if (!editor) return null;
  return <Box data-testid="ai-lesson-document-editor" sx={{ bgcolor: 'grey.100', p: { xs: 1, md: 3 }, overflowX: 'auto' }}>
    <Paper variant="outlined" sx={{ p: 1, mb: 2, mx: 'auto', maxWidth: 794 }}><Stack direction="row" spacing={0.5} flexWrap="wrap">
      <Tooltip title="Desfazer"><IconButton onClick={() => editor.chain().focus().undo().run()}><Undo /></IconButton></Tooltip>
      <Tooltip title="Refazer"><IconButton onClick={() => editor.chain().focus().redo().run()}><Redo /></IconButton></Tooltip>
      <Tooltip title="Negrito"><IconButton color={editor.isActive('bold') ? 'primary' : 'default'} onClick={() => editor.chain().focus().toggleBold().run()}><FormatBold /></IconButton></Tooltip>
      <Tooltip title="Itálico"><IconButton color={editor.isActive('italic') ? 'primary' : 'default'} onClick={() => editor.chain().focus().toggleItalic().run()}><FormatItalic /></IconButton></Tooltip>
      <Tooltip title="Lista"><IconButton onClick={() => editor.chain().focus().toggleBulletList().run()}><FormatListBulleted /></IconButton></Tooltip>
      <Tooltip title="Lista numerada"><IconButton onClick={() => editor.chain().focus().toggleOrderedList().run()}><FormatListNumbered /></IconButton></Tooltip>
    </Stack></Paper>
    <Paper elevation={4} sx={{ width: compact ? '100%' : '210mm', minHeight: compact ? 600 : '297mm', mx: 'auto', p: compact ? 2 : '20mm', boxSizing: 'border-box', bgcolor: 'white' }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Box component="img" src="/header_esquerdo.png" alt="Nova Igreja Batista" sx={{ width: '42%', maxHeight: 72, objectFit: 'contain', objectPosition: 'left' }} />
        <Box component="img" src="/header_direito.png" alt="Clubinho Bíblico para Crianças" sx={{ width: '42%', maxHeight: 72, objectFit: 'contain', objectPosition: 'right' }} />
      </Stack>
      <EditorContent editor={editor} />
    </Paper>
  </Box>;
};
