import { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TextAlign } from '@tiptap/extension-text-align';
import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';
import { Highlight } from '@tiptap/extension-highlight';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import {
  Box,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Paper,
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
  FormatColorFill,
  FormatColorText,
  FormatItalic,
  FormatListBulleted,
  FormatListNumbered,
  FormatQuote,
  FormatUnderlined,
  HorizontalRule,
  Redo,
  StrikethroughS,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  TableChart,
  Title,
  Undo,
} from '@mui/icons-material';
import { TiptapDocument } from '@/services/aiLessonsService';

type Props = {
  initialJson: TiptapDocument;
  onChange: (json: TiptapDocument) => void;
};

export const LibreOfficeDocEditor = ({ initialJson, onChange }: Props) => {
  const theme = useTheme();
  const compact = useMediaQuery(theme.breakpoints.down('md'));

  const [colorAnchor, setColorAnchor] = useState<null | HTMLElement>(null);
  const [tableAnchor, setTableAnchor] = useState<null | HTMLElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Subscript,
      Superscript,
      Highlight.configure({ multicolor: true }),
      TextStyle,
      Color,
      TextAlign.configure({
        types: ['heading', 'paragraph', 'blockquote'],
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: initialJson,
    onUpdate: ({ editor: value }) => onChange(value.getJSON() as TiptapDocument),
  });

  useEffect(() => {
    if (editor && JSON.stringify(editor.getJSON()) !== JSON.stringify(initialJson)) {
      editor.commands.setContent(initialJson);
    }
  }, [editor, initialJson]);

  if (!editor) return null;

  return (
    <Box
      data-testid="ai-lesson-document-editor"
      sx={{ bgcolor: 'grey.100', p: { xs: 1, md: 3 }, overflowX: 'auto' }}
    >
      {/* Toolbar Word-like Rich Text */}
      <Paper variant="outlined" sx={{ p: 1, mb: 2, mx: 'auto', maxWidth: 840 }}>
        <Stack direction="row" spacing={0.5} flexWrap="wrap" alignItems="center">
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
              onClick={() => editor.chain().focus().toggleBold().run()}
            >
              <FormatBold />
            </IconButton>
          </Tooltip>
          <Tooltip title="Itálico (Ctrl+I)">
            <IconButton
              color={editor.isActive('italic') ? 'primary' : 'default'}
              onClick={() => editor.chain().focus().toggleItalic().run()}
            >
              <FormatItalic />
            </IconButton>
          </Tooltip>
          <Tooltip title="Sublinhado (Ctrl+U)">
            <IconButton
              color={editor.isActive('underline') ? 'primary' : 'default'}
              onClick={() => editor.chain().focus().toggleUnderline().run()}
            >
              <FormatUnderlined />
            </IconButton>
          </Tooltip>
          <Tooltip title="Tachado">
            <IconButton
              color={editor.isActive('strike') ? 'primary' : 'default'}
              onClick={() => editor.chain().focus().toggleStrike().run()}
            >
              <StrikethroughS />
            </IconButton>
          </Tooltip>
          <Tooltip title="Subscrito (<sub>)">
            <IconButton
              color={editor.isActive('subscript') ? 'primary' : 'default'}
              onClick={() => editor.chain().focus().toggleSubscript().run()}
            >
              <SubscriptIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Sobrescrito (<sup>)">
            <IconButton
              color={editor.isActive('superscript') ? 'primary' : 'default'}
              onClick={() => editor.chain().focus().toggleSuperscript().run()}
            >
              <SuperscriptIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Destaque / Marcador Amarelo">
            <IconButton
              color={editor.isActive('highlight') ? 'primary' : 'default'}
              onClick={() => editor.chain().focus().toggleHighlight({ color: '#FFF200' }).run()}
            >
              <FormatColorFill />
            </IconButton>
          </Tooltip>
          <Tooltip title="Cor da Fonte">
            <IconButton onClick={(e) => setColorAnchor(e.currentTarget)}>
              <FormatColorText />
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={colorAnchor}
            open={Boolean(colorAnchor)}
            onClose={() => setColorAnchor(null)}
          >
            <MenuItem
              onClick={() => {
                editor.chain().focus().setColor('#000000').run();
                setColorAnchor(null);
              }}
            >
              Preto (#000000)
            </MenuItem>
            <MenuItem
              onClick={() => {
                editor.chain().focus().setColor('#132A85').run();
                setColorAnchor(null);
              }}
            >
              Azul NIB (#132A85)
            </MenuItem>
            <MenuItem
              onClick={() => {
                editor.chain().focus().setColor('#087C61').run();
                setColorAnchor(null);
              }}
            >
              Verde NIB (#087C61)
            </MenuItem>
            <MenuItem
              onClick={() => {
                editor.chain().focus().setColor('#C53030').run();
                setColorAnchor(null);
              }}
            >
              Vermelho (#C53030)
            </MenuItem>
            <MenuItem
              onClick={() => {
                editor.chain().focus().setColor('#666666').run();
                setColorAnchor(null);
              }}
            >
              Cinza (#666666)
            </MenuItem>
          </Menu>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

          {/* Cabeçalhos */}
          <Tooltip title="Título 1 (H1)">
            <IconButton
              color={editor.isActive('heading', { level: 1 }) ? 'primary' : 'default'}
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            >
              <Title />
            </IconButton>
          </Tooltip>
          <Tooltip title="Subtítulo H2">
            <IconButton
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
              color={editor.isActive({ textAlign: 'left' }) ? 'primary' : 'default'}
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
            >
              <FormatAlignLeft />
            </IconButton>
          </Tooltip>
          <Tooltip title="Centralizar">
            <IconButton
              color={editor.isActive({ textAlign: 'center' }) ? 'primary' : 'default'}
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
            >
              <FormatAlignCenter />
            </IconButton>
          </Tooltip>
          <Tooltip title="Alinhar à Direita">
            <IconButton
              color={editor.isActive({ textAlign: 'right' }) ? 'primary' : 'default'}
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
            >
              <FormatAlignRight />
            </IconButton>
          </Tooltip>
          <Tooltip title="Justificar (Ambos os Lados)">
            <IconButton
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
              color={editor.isActive('bulletList') ? 'primary' : 'default'}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
            >
              <FormatListBulleted />
            </IconButton>
          </Tooltip>
          <Tooltip title="Lista Numerada">
            <IconButton
              color={editor.isActive('orderedList') ? 'primary' : 'default'}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
            >
              <FormatListNumbered />
            </IconButton>
          </Tooltip>
          <Tooltip title="Bloco de Citação">
            <IconButton
              color={editor.isActive('blockquote') ? 'primary' : 'default'}
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
              onClick={(e) => setTableAnchor(e.currentTarget)}
            >
              <TableChart />
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={tableAnchor}
            open={Boolean(tableAnchor)}
            onClose={() => setTableAnchor(null)}
          >
            <MenuItem
              onClick={() => {
                editor
                  .chain()
                  .focus()
                  .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                  .run();
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
              onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
            >
              <FormatClear />
            </IconButton>
          </Tooltip>
        </Stack>
      </Paper>

      {/* Folha A4 LibreOffice / Word Document Paper */}
      <Paper
        elevation={4}
        sx={{
          width: compact ? '100%' : '210mm',
          minHeight: compact ? 600 : '297mm',
          mx: 'auto',
          p: compact ? 2 : '20mm',
          boxSizing: 'border-box',
          bgcolor: 'white',
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 3 }}
        >
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
              color: '#000000',
              fontWeight: 700,
            },
          }}
        >
          <EditorContent editor={editor} />
        </Box>
      </Paper>
    </Box>
  );
};
