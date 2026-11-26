import { useEffect, useReducer, useState } from 'react';
import {
  Box,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Popover,
  Stack,
  Tooltip,
  Typography,
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
import { LessonEditorAdvancedTools } from '../components/LessonEditorAdvancedTools';
import { LessonEditorColorTools } from '../components/LessonEditorColorTools';
import { LessonEditorColorMode } from '../editor.types';
import type { MeditationToolbarProps } from './types';

export function MeditationToolbar({
  editor,
  fullscreen,
  onToggleFullscreen,
}: MeditationToolbarProps) {
  const theme = useTheme();
  const compact = useMediaQuery(theme.breakpoints.down('md'));
  const [toolsAnchor, setToolsAnchor] = useState<HTMLElement | null>(null);
  const [tableAnchor, setTableAnchor] = useState<HTMLElement | null>(null);
  const [, refresh] = useReducer((value: number) => value + 1, 0);
  useEffect(() => {
    if (!editor) return;
    editor.on('transaction', refresh);
    return () => {
      editor.off('transaction', refresh);
    };
  }, [editor]);
  const toggleFullscreen = () => {
    setToolsAnchor(null);
    onToggleFullscreen();
  };
  if (!editor)
    return (
      <Paper data-testid="meditation-editor-toolbar" variant="outlined" sx={{ p: 1 }}>
        <Typography variant="caption">Clique no texto para editar.</Typography>
      </Paper>
    );
  const toolbarControls = (
    <Stack
      onMouseDown={(event) => {
        if ((event.target as HTMLElement).closest('button')) event.preventDefault();
      }}
      data-testid="meditation-editor-toolbar-controls"
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
            data-testid="meditation-editor-undo"
            aria-label="Desfazer (Ctrl+Z)"
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
            data-testid="meditation-editor-redo"
            aria-label="Refazer (Ctrl+Y)"
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
          data-testid="meditation-editor-bold"
          aria-label="Negrito (Ctrl+B)"
          color={editor.isActive('bold') ? 'primary' : 'default'}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <FormatBold />
        </IconButton>
      </Tooltip>
      <Tooltip title="Itálico (Ctrl+I)">
        <IconButton
          data-testid="meditation-editor-italic"
          aria-label="Itálico (Ctrl+I)"
          color={editor.isActive('italic') ? 'primary' : 'default'}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <FormatItalic />
        </IconButton>
      </Tooltip>
      <Tooltip title="Sublinhado (Ctrl+U)">
        <IconButton
          data-testid="meditation-editor-underline"
          aria-label="Sublinhado (Ctrl+U)"
          color={editor.isActive('underline') ? 'primary' : 'default'}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <FormatUnderlined />
        </IconButton>
      </Tooltip>
      <Tooltip title="Tachado">
        <IconButton
          data-testid="meditation-editor-strike"
          aria-label="Tachado"
          color={editor.isActive('strike') ? 'primary' : 'default'}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <StrikethroughS />
        </IconButton>
      </Tooltip>
      <Tooltip title="Subscrito (<sub>)">
        <IconButton
          data-testid="meditation-editor-subscript"
          aria-label="Subscrito (<sub>)"
          color={editor.isActive('subscript') ? 'primary' : 'default'}
          onClick={() => editor.chain().focus().toggleSubscript().run()}
        >
          <SubscriptIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Sobrescrito (<sup>)">
        <IconButton
          data-testid="meditation-editor-superscript"
          aria-label="Sobrescrito (<sup>)"
          color={editor.isActive('superscript') ? 'primary' : 'default'}
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
          data-testid="meditation-editor-heading-1"
          aria-label="Título 1 (H1)"
          color={editor.isActive('heading', { level: 1 }) ? 'primary' : 'default'}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          <Title />
        </IconButton>
      </Tooltip>
      <Tooltip title="Subtítulo H2">
        <IconButton
          data-testid="meditation-editor-heading-2"
          aria-label="Subtítulo H2"
          color={editor.isActive('heading', { level: 2 }) ? 'primary' : 'default'}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Box component="span" sx={{ fontWeight: 800, fontSize: 13 }}>
            H2
          </Box>
        </IconButton>
      </Tooltip>
      <Tooltip title="Subtítulo H3">
        <IconButton
          data-testid="meditation-editor-heading-3"
          aria-label="Subtítulo H3"
          color={editor.isActive('heading', { level: 3 }) ? 'primary' : 'default'}
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
          data-testid="meditation-editor-align-left"
          aria-label="Alinhar à Esquerda"
          color={editor.isActive({ textAlign: 'left' }) ? 'primary' : 'default'}
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
        >
          <FormatAlignLeft />
        </IconButton>
      </Tooltip>
      <Tooltip title="Centralizar">
        <IconButton
          data-testid="meditation-editor-align-center"
          aria-label="Centralizar"
          color={editor.isActive({ textAlign: 'center' }) ? 'primary' : 'default'}
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
        >
          <FormatAlignCenter />
        </IconButton>
      </Tooltip>
      <Tooltip title="Alinhar à Direita">
        <IconButton
          data-testid="meditation-editor-align-right"
          aria-label="Alinhar à Direita"
          color={editor.isActive({ textAlign: 'right' }) ? 'primary' : 'default'}
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
        >
          <FormatAlignRight />
        </IconButton>
      </Tooltip>
      <Tooltip title="Justificar (Ambos os Lados)">
        <IconButton
          data-testid="meditation-editor-align-justify"
          aria-label="Justificar (Ambos os Lados)"
          color={editor.isActive({ textAlign: 'justify' }) ? 'primary' : 'default'}
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
        >
          <FormatAlignJustify />
        </IconButton>
      </Tooltip>

      <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

      {/* Listas e Blocos */}
      <Tooltip title="Lista com Marcadores">
        <IconButton
          data-testid="meditation-editor-bullet-list"
          aria-label="Lista com Marcadores"
          color={editor.isActive('bulletList') ? 'primary' : 'default'}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <FormatListBulleted />
        </IconButton>
      </Tooltip>
      <Tooltip title="Lista Numerada">
        <IconButton
          data-testid="meditation-editor-ordered-list"
          aria-label="Lista Numerada"
          color={editor.isActive('orderedList') ? 'primary' : 'default'}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <FormatListNumbered />
        </IconButton>
      </Tooltip>
      <Tooltip title="Bloco de Citação">
        <IconButton
          data-testid="meditation-editor-blockquote"
          aria-label="Bloco de Citação"
          color={editor.isActive('blockquote') ? 'primary' : 'default'}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <FormatQuote />
        </IconButton>
      </Tooltip>
      <Tooltip title="Linha Divisória Horizontal">
        <IconButton
          data-testid="meditation-editor-horizontal-rule"
          aria-label="Linha Divisória Horizontal"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          <HorizontalRule />
        </IconButton>
      </Tooltip>

      <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

      {/* Ferramentas de Tabela */}
      <Tooltip title="Inserir / Gerenciar Tabela">
        <IconButton
          data-testid="meditation-editor-table"
          aria-label="Inserir / Gerenciar Tabela"
          color={editor.isActive('table') ? 'primary' : 'default'}
          onClick={(e) => setTableAnchor(e.currentTarget)}
        >
          <TableChart />
        </IconButton>
      </Tooltip>
      <Menu
        data-testid="meditation-editor-table-menu"
        anchorEl={tableAnchor}
        open={Boolean(tableAnchor)}
        onClose={() => setTableAnchor(null)}
      >
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
        <IconButton
          data-testid="meditation-editor-clear"
          aria-label="Limpar Toda Formatação"
          onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
        >
          <FormatClear />
        </IconButton>
      </Tooltip>
    </Stack>
  );

  return (
    <Paper
      data-testid="meditation-editor-toolbar"
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
            data-testid="meditation-editor-mobile-tools"
            direction="row"
            spacing={0.5}
            sx={{ '& .MuiIconButton-root': { minWidth: 44, minHeight: 44 } }}
          >
            <IconButton
              data-testid="meditation-editor-mobile-undo"
              aria-label="Desfazer"
              disabled={!editor.can().undo()}
              onClick={() => editor.chain().focus().undo().run()}
            >
              <Undo />
            </IconButton>
            <IconButton
              data-testid="meditation-editor-mobile-bold"
              aria-label="Negrito"
              color={editor.isActive('bold') ? 'primary' : 'default'}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => editor.chain().focus().toggleBold().run()}
            >
              <FormatBold />
            </IconButton>
            <IconButton
              data-testid="meditation-editor-mobile-italic"
              aria-label="Itálico"
              color={editor.isActive('italic') ? 'primary' : 'default'}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => editor.chain().focus().toggleItalic().run()}
            >
              <FormatItalic />
            </IconButton>
            <IconButton
              data-testid="meditation-editor-more-tools"
              aria-label="Mais ferramentas"
              aria-haspopup="dialog"
              aria-expanded={Boolean(toolsAnchor)}
              onClick={(event) => setToolsAnchor(event.currentTarget)}
            >
              <KeyboardArrowDown sx={{ transform: toolsAnchor ? 'rotate(180deg)' : undefined }} />
            </IconButton>
          </Stack>
          <Popover
            data-testid="meditation-editor-tools-popover"
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
              sx={{ p: 1.5, width: 240, maxWidth: 'calc(100vw - 32px)', boxSizing: 'border-box' }}
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
  );
}
