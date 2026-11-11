import { useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import {
  Box,
  Divider,
  Dialog,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Popover,
  Typography,
  Stack,
  Tooltip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  FormatAlignCenter,
  FormatAlignJustify,
  FormatAlignLeft,
  FormatAlignRight,
  FormatBold,
  FormatClear,
  FormatItalic,
  FormatListBulleted,
  FormatListNumbered,
  FormatQuote,
  FormatUnderlined,
  HorizontalRule,
  Redo,
  KeyboardArrowDown,
  StrikethroughS,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  TableChart,
  Title,
  Undo,
} from '@mui/icons-material';
import { TiptapDocument } from '@/services/aiLessonsService';

import {
  LessonEditorColorMode,
  type LessonDocumentEditorProps,
} from '@/features/ai-lessons/editor.types';
import { createLessonEditorExtensions } from '@/features/ai-lessons/editor.extensions';
import { countEditorText } from '@/features/ai-lessons/editor.utils';
import { LessonEditorColorTools } from '@/features/ai-lessons/components/LessonEditorColorTools';
import { LessonEditorAdvancedTools } from '@/features/ai-lessons/components/LessonEditorAdvancedTools';

export const LibreOfficeDocEditor = ({
  initialJson,
  onChange,
  editable = true,
}: LessonDocumentEditorProps) => {
  const theme = useTheme();
  const compact = useMediaQuery(theme.breakpoints.down('md'));

  const [fullscreen, setFullscreen] = useState(false);
  const lastEmitted = useRef<TiptapDocument | null>(null);
  const [toolsAnchor, setToolsAnchor] = useState<null | HTMLElement>(null);
  const [tableAnchor, setTableAnchor] = useState<null | HTMLElement>(null);

  const editor = useEditor({
    extensions: createLessonEditorExtensions(),
    content: initialJson,
    editable,
    // Toolbar state (active marks, undo/redo, counters) follows selection changes too.
    shouldRerenderOnTransaction: true,
    onUpdate: ({ editor: value }) => {
      const json = value.getJSON() as TiptapDocument;
      lastEmitted.current = json;
      onChange?.(json);
    },
  });

  useEffect(() => {
    // The parent echoing back what this editor just emitted needs no comparison.
    if (!editor || initialJson === lastEmitted.current) return;
    if (JSON.stringify(editor.getJSON()) !== JSON.stringify(initialJson)) {
      editor.commands.setContent(initialJson, { emitUpdate: false });
    }
  }, [editor, initialJson]);

  useEffect(() => {
    // Permission changes must not create an unsaved content draft.
    editor?.setEditable(editable, false);
  }, [editable, editor]);

  if (!editor) return null;

  const counts = countEditorText(editor.state.doc);
  const toggleFullscreen = () => {
    setToolsAnchor(null);
    setFullscreen((value) => !value);
  };
  const toolbarControls = (
    <Stack
      data-testid="ai-lesson-document-editor-toolbar-controls"
      direction="row"
      spacing={compact ? 0 : 0.5}
      alignItems="center"
      sx={{
        display: compact ? 'grid' : 'flex',
        gridTemplateColumns: 'repeat(4, minmax(44px, 1fr))',
        gap: compact ? 0.5 : undefined,
        flexWrap: 'wrap',
        minWidth: 0,
        width: '100%',
        '& > .MuiDivider-root': { display: compact ? 'none' : undefined },
        '& > *': { flexShrink: 0 },
        '& .MuiIconButton-root': { minWidth: 44, minHeight: 44 },
      }}
    >
      <LessonEditorAdvancedTools
        editor={editor}
        fullscreen={fullscreen}
        onToggleFullscreen={toggleFullscreen}
        onOpenTool={() => setToolsAnchor(null)}
      />
      {/* Histórico */}
      <Tooltip title="Desfazer (Ctrl+Z)">
        <span>
          <IconButton
            disabled={!editor.can().undo()}
            onClick={() => editor.chain().focus().undo().run()}
          >
            <Undo />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Refazer (Ctrl+Y)">
        <span>
          <IconButton
            disabled={!editor.can().redo()}
            onClick={() => editor.chain().focus().redo().run()}
          >
            <Redo />
          </IconButton>
        </span>
      </Tooltip>

      <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

      {/* Formatação Básica de Texto */}
      <Tooltip title="Negrito (Ctrl+B)">
        <IconButton
          color={editor.isActive('bold') ? 'primary' : 'default'}
          aria-pressed={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <FormatBold />
        </IconButton>
      </Tooltip>
      <Tooltip title="Itálico (Ctrl+I)">
        <IconButton
          color={editor.isActive('italic') ? 'primary' : 'default'}
          aria-pressed={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <FormatItalic />
        </IconButton>
      </Tooltip>
      <Tooltip title="Sublinhado (Ctrl+U)">
        <IconButton
          color={editor.isActive('underline') ? 'primary' : 'default'}
          aria-pressed={editor.isActive('underline')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <FormatUnderlined />
        </IconButton>
      </Tooltip>
      <Tooltip title="Tachado">
        <IconButton
          color={editor.isActive('strike') ? 'primary' : 'default'}
          aria-pressed={editor.isActive('strike')}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <StrikethroughS />
        </IconButton>
      </Tooltip>
      <Tooltip title="Subscrito (<sub>)">
        <IconButton
          color={editor.isActive('subscript') ? 'primary' : 'default'}
          aria-pressed={editor.isActive('subscript')}
          onClick={() => editor.chain().focus().toggleSubscript().run()}
        >
          <SubscriptIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Sobrescrito (<sup>)">
        <IconButton
          color={editor.isActive('superscript') ? 'primary' : 'default'}
          aria-pressed={editor.isActive('superscript')}
          onClick={() => editor.chain().focus().toggleSuperscript().run()}
        >
          <SuperscriptIcon />
        </IconButton>
      </Tooltip>
      <LessonEditorColorTools
        editor={editor}
        mode={LessonEditorColorMode.HIGHLIGHT}
        onOpenTool={() => setToolsAnchor(null)}
      />
      <LessonEditorColorTools editor={editor} onOpenTool={() => setToolsAnchor(null)} />

      <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

      {/* Cabeçalhos */}
      <Tooltip title="Título 1 (H1)">
        <IconButton
          color={editor.isActive('heading', { level: 1 }) ? 'primary' : 'default'}
          aria-pressed={editor.isActive('heading', { level: 1 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          <Title />
        </IconButton>
      </Tooltip>
      <Tooltip title="Subtítulo H2">
        <IconButton
          color={editor.isActive('heading', { level: 2 }) ? 'primary' : 'default'}
          aria-pressed={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Box component="span" sx={{ fontWeight: 800, fontSize: 13 }}>
            H2
          </Box>
        </IconButton>
      </Tooltip>
      <Tooltip title="Subtítulo H3">
        <IconButton
          color={editor.isActive('heading', { level: 3 }) ? 'primary' : 'default'}
          aria-pressed={editor.isActive('heading', { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <Box component="span" sx={{ fontWeight: 800, fontSize: 13 }}>
            H3
          </Box>
        </IconButton>
      </Tooltip>

      <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

      {/* Alinhamento */}
      <Tooltip title="Alinhar à Esquerda">
        <IconButton
          color={editor.isActive({ textAlign: 'left' }) ? 'primary' : 'default'}
          aria-pressed={editor.isActive({ textAlign: 'left' })}
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
        >
          <FormatAlignLeft />
        </IconButton>
      </Tooltip>
      <Tooltip title="Centralizar">
        <IconButton
          color={editor.isActive({ textAlign: 'center' }) ? 'primary' : 'default'}
          aria-pressed={editor.isActive({ textAlign: 'center' })}
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
        >
          <FormatAlignCenter />
        </IconButton>
      </Tooltip>
      <Tooltip title="Alinhar à Direita">
        <IconButton
          color={editor.isActive({ textAlign: 'right' }) ? 'primary' : 'default'}
          aria-pressed={editor.isActive({ textAlign: 'right' })}
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
        >
          <FormatAlignRight />
        </IconButton>
      </Tooltip>
      <Tooltip title="Justificar (Ambos os Lados)">
        <IconButton
          color={editor.isActive({ textAlign: 'justify' }) ? 'primary' : 'default'}
          aria-pressed={editor.isActive({ textAlign: 'justify' })}
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
        >
          <FormatAlignJustify />
        </IconButton>
      </Tooltip>

      <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

      {/* Listas e Blocos */}
      <Tooltip title="Lista com Marcadores">
        <IconButton
          color={editor.isActive('bulletList') ? 'primary' : 'default'}
          aria-pressed={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <FormatListBulleted />
        </IconButton>
      </Tooltip>
      <Tooltip title="Lista Numerada">
        <IconButton
          color={editor.isActive('orderedList') ? 'primary' : 'default'}
          aria-pressed={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <FormatListNumbered />
        </IconButton>
      </Tooltip>
      <Tooltip title="Bloco de Citação">
        <IconButton
          color={editor.isActive('blockquote') ? 'primary' : 'default'}
          aria-pressed={editor.isActive('blockquote')}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <FormatQuote />
        </IconButton>
      </Tooltip>
      <Tooltip title="Linha Divisória Horizontal">
        <IconButton onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          <HorizontalRule />
        </IconButton>
      </Tooltip>

      <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

      {/* Ferramentas de Tabela */}
      <Tooltip title="Inserir / Gerenciar Tabela">
        <IconButton
          color={editor.isActive('table') ? 'primary' : 'default'}
          aria-pressed={editor.isActive('table')}
          onClick={(e) => setTableAnchor(e.currentTarget)}
        >
          <TableChart />
        </IconButton>
      </Tooltip>
      <Menu anchorEl={tableAnchor} open={Boolean(tableAnchor)} onClose={() => setTableAnchor(null)}>
        <MenuItem
          onClick={() => {
            editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
            setTableAnchor(null);
          }}
        >
          Inserir Tabela 3x3
        </MenuItem>
        <MenuItem
          disabled={!editor.isActive('table')}
          onClick={() => {
            editor.chain().focus().addRowAfter().run();
            setTableAnchor(null);
          }}
        >
          Adicionar Linha Abaixo
        </MenuItem>
        <MenuItem
          disabled={!editor.isActive('table')}
          onClick={() => {
            editor.chain().focus().addColumnAfter().run();
            setTableAnchor(null);
          }}
        >
          Adicionar Coluna à Direita
        </MenuItem>
        <MenuItem
          disabled={!editor.isActive('table')}
          onClick={() => {
            editor.chain().focus().deleteRow().run();
            setTableAnchor(null);
          }}
        >
          Excluir Linha Selecionada
        </MenuItem>
        <MenuItem
          disabled={!editor.isActive('table')}
          onClick={() => {
            editor.chain().focus().deleteColumn().run();
            setTableAnchor(null);
          }}
        >
          Excluir Coluna Selecionada
        </MenuItem>
        <MenuItem
          data-testid="ai-lesson-editor-merge-cells"
          disabled={!editor.can().mergeCells()}
          onClick={() => {
            editor.chain().focus().mergeCells().run();
            setTableAnchor(null);
          }}
        >
          Mesclar células selecionadas
        </MenuItem>
        <MenuItem
          data-testid="ai-lesson-editor-split-cell"
          disabled={!editor.can().splitCell()}
          onClick={() => {
            editor.chain().focus().splitCell().run();
            setTableAnchor(null);
          }}
        >
          Dividir célula mesclada
        </MenuItem>
        <MenuItem
          disabled={!editor.isActive('table')}
          onClick={() => {
            editor.chain().focus().deleteTable().run();
            setTableAnchor(null);
          }}
        >
          Excluir Tabela Inteira
        </MenuItem>
      </Menu>

      <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

      {/* Limpar Formatação */}
      <Tooltip title="Limpar Toda Formatação">
        <IconButton onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}>
          <FormatClear />
        </IconButton>
      </Tooltip>
    </Stack>
  );

  const content = (
    <Box
      data-testid="ai-lesson-document-editor"
      sx={{
        bgcolor: 'grey.100',
        p: { xs: 1, md: 3 },
        minWidth: 0,
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
        maxHeight: fullscreen ? '100dvh' : { xs: '65dvh', md: '70dvh' },
        height: fullscreen ? '100dvh' : undefined,
        overflow: 'auto',
        overscrollBehavior: 'contain',
      }}
    >
      {/* Toolbar Word-like Rich Text */}
      {editable && (
        <Paper
          data-testid="ai-lesson-document-editor-toolbar"
          role="toolbar"
          aria-label="Ferramentas de edição do conteúdo"
          variant="outlined"
          sx={{
            p: 1,
            mb: 2,
            mx: 'auto',
            maxWidth: '100%',
            minWidth: 0,
            width: { xs: '100%', md: '95%' },
            boxSizing: 'border-box',
            position: 'sticky',
            top: 0,
            zIndex: theme.zIndex.appBar - 1,
            bgcolor: 'background.paper',
            boxShadow: 2,
          }}
        >
          {compact ? (
            <>
              <Stack
                data-testid="ai-lesson-document-editor-mobile-tools"
                direction="row"
                spacing={0.5}
                sx={{ '& .MuiIconButton-root': { minWidth: 44, minHeight: 44 } }}
              >
                <IconButton
                  aria-label="Desfazer"
                  disabled={!editor.can().undo()}
                  onClick={() => editor.chain().focus().undo().run()}
                >
                  <Undo />
                </IconButton>
                <IconButton
                  aria-label="Negrito"
                  aria-pressed={editor.isActive('bold')}
                  color={editor.isActive('bold') ? 'primary' : 'default'}
                  onClick={() => editor.chain().focus().toggleBold().run()}
                >
                  <FormatBold />
                </IconButton>
                <IconButton
                  aria-label="Itálico"
                  aria-pressed={editor.isActive('italic')}
                  color={editor.isActive('italic') ? 'primary' : 'default'}
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                >
                  <FormatItalic />
                </IconButton>
                <IconButton
                  data-testid="ai-lesson-document-editor-more-tools"
                  aria-label="Mais ferramentas"
                  aria-haspopup="dialog"
                  aria-expanded={Boolean(toolsAnchor)}
                  onClick={(event) => setToolsAnchor(event.currentTarget)}
                >
                  <KeyboardArrowDown
                    sx={{ transform: toolsAnchor ? 'rotate(180deg)' : undefined }}
                  />
                </IconButton>
              </Stack>
              <Popover
                data-testid="ai-lesson-document-editor-tools-popover"
                keepMounted
                anchorEl={toolsAnchor}
                open={Boolean(toolsAnchor)}
                onClose={() => setToolsAnchor(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                <Box
                  role="dialog"
                  aria-label="Mais ferramentas de edição"
                  sx={{
                    p: 1.5,
                    width: 240,
                    maxWidth: 'calc(100vw - 32px)',
                    boxSizing: 'border-box',
                  }}
                >
                  <Typography fontWeight={700} sx={{ mb: 1 }}>
                    Mais ferramentas
                  </Typography>
                  {toolbarControls}
                </Box>
              </Popover>
            </>
          ) : (
            toolbarControls
          )}
        </Paper>
      )}

      <Typography
        data-testid="ai-lesson-editor-text-count"
        variant="caption"
        component="p"
        aria-live="polite"
        sx={{ mx: 'auto', maxWidth: 840, mb: 1 }}
      >
        {counts.words} palavras · {counts.characters} caracteres
      </Typography>
      {/* Folha A4 LibreOffice / Word Document Paper */}
      <Paper
        elevation={4}
        sx={{
          width: compact ? '100%' : '210mm',
          maxWidth: '100%',
          minHeight: compact ? 600 : '297mm',
          mx: 'auto',
          p: compact ? 2 : '20mm',
          boxSizing: 'border-box',
          bgcolor: 'white',
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
          <Box
            component="img"
            src="/header_esquerdo.png"
            alt="Nova Igreja Batista"
            sx={{
              width: '42%',
              maxHeight: 72,
              objectFit: 'contain',
              objectPosition: 'left',
            }}
          />
          <Box
            component="img"
            src="/header_direito.png"
            alt="Clubinho Bíblico para Crianças"
            sx={{
              width: '42%',
              maxHeight: 72,
              objectFit: 'contain',
              objectPosition: 'right',
            }}
          />
        </Stack>
        <Box
          sx={{
            '& .tiptap': {
              outline: 'none',
              minHeight: compact ? 440 : '230mm',
              lineHeight: 1.7,
              fontFamily: '"Calibri", "Helvetica", "Arial", sans-serif',
              fontSize: '15px',
              overflowWrap: 'anywhere',
              color: '#000000',
            },
            '& .tiptap h1': {
              textAlign: 'center',
              color: '#000000',
              fontSize: '24px',
              fontWeight: 800,
              mt: 2,
              mb: 3,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            },
            '& .tiptap h2': {
              color: '#000000',
              fontSize: '17px',
              fontWeight: 700,
              textAlign: 'center',
              mt: 3.5,
              mb: 1.5,
              pb: 0.5,
              borderBottom: '2px solid #000000',
              textTransform: 'uppercase',
              letterSpacing: '0.3px',
            },
            '& .tiptap h3': {
              color: '#000000',
              fontSize: '15px',
              fontWeight: 600,
              textAlign: 'center',
              mt: 2.5,
              mb: 1,
            },
            '& .tiptap p': {
              mb: 1.5,
              textAlign: 'justify',
              lineHeight: 1.65,
            },
            '& .tiptap blockquote': {
              borderLeft: '4px solid #000000',
              bgcolor: '#F5F5F5',
              p: 1.5,
              pl: 2,
              my: 2,
              borderRadius: '0 6px 6px 0',
              color: '#000000',
              fontStyle: 'italic',
              fontSize: '14px',
            },
            '& .tiptap hr': {
              border: 'none',
              borderTop: '2px solid #DDDDDD',
              my: 3,
            },
            '& .tiptap table': {
              borderCollapse: 'collapse',
              tableLayout: 'fixed',
              width: '100%',
              my: 2,
            },
            '& .tiptap td, & .tiptap th': {
              border: '1px solid #CCCCCC',
              p: 1,
              verticalAlign: 'top',
              boxSizing: 'border-box',
            },
            '& .tiptap th': {
              bgcolor: '#F5F5F5',
              fontWeight: 'bold',
            },
            '& .tiptap ul, & .tiptap ol': {
              pl: 3,
              mb: 2,
            },
            '& .tiptap li': {
              mb: 0.5,
              lineHeight: 1.6,
            },
            '& .tiptap strong': {
              fontWeight: 700,
            },
          }}
        >
          <EditorContent editor={editor} />
        </Box>
      </Paper>
    </Box>
  );
  return fullscreen ? (
    <Dialog
      data-testid="ai-lesson-editor-fullscreen-dialog"
      fullScreen
      open
      onClose={() => setFullscreen(false)}
      aria-label="Editor em tela cheia"
    >
      {content}
    </Dialog>
  ) : (
    content
  );
};
