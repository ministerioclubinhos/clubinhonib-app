import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  FormatLineSpacing,
  FormatSize,
  Fullscreen,
  FullscreenExit,
  Link,
  Search,
} from '@mui/icons-material';
import {
  LESSON_EDITOR_FONTS,
  LESSON_EDITOR_FONT_SIZES_PT,
  LESSON_EDITOR_LINE_HEIGHTS,
} from '../editor.constants';
import { LessonEditorDialog, type LessonEditorAdvancedToolsProps } from '../editor.types';
import { findEditorTextMatches, normalizeEditorLinkUrl, replaceEditorText } from '../editor.utils';

export function LessonEditorAdvancedTools({
  editor,
  fullscreen,
  onToggleFullscreen,
  onOpenTool,
}: LessonEditorAdvancedToolsProps) {
  const [dialog, setDialog] = useState<LessonEditorDialog | null>(null);
  const [url, setUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [hasLinkSelection, setHasLinkSelection] = useState(false);
  const [query, setQuery] = useState('');
  const [replacement, setReplacement] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [urlError, setUrlError] = useState(false);
  const matches = findEditorTextMatches(editor.state.doc, query, caseSensitive);
  const textStyle = editor.getAttributes('textStyle');
  const paragraphStyle = editor.getAttributes(editor.isActive('heading') ? 'heading' : 'paragraph');
  const close = () => setDialog(null);
  const openLink = () => {
    onOpenTool?.();
    const href: unknown = editor.getAttributes('link').href;
    setUrl(typeof href === 'string' ? href : '');
    setLinkText('');
    setHasLinkSelection(!editor.state.selection.empty || editor.isActive('link'));
    setUrlError(false);
    setDialog(LessonEditorDialog.LINK);
  };
  const applyLink = () => {
    const href = normalizeEditorLinkUrl(url);
    if (!href) {
      setUrlError(true);
      return;
    }
    if (hasLinkSelection) editor.chain().extendMarkRange('link').setLink({ href }).run();
    else
      editor
        .chain()
        .insertContent({
          type: 'text',
          text: linkText.trim() || href,
          marks: [
            ...(editor.state.storedMarks ?? editor.state.selection.$from.marks())
              .filter((mark) => mark.type.name !== 'link')
              .map((mark) => mark.toJSON()),
            { type: 'link', attrs: { href } },
          ],
        })
        .run();
    close();
  };
  const findNext = () => {
    const match = matches.find((item) => item.from >= editor.state.selection.to) ?? matches[0];
    if (match) {
      editor.chain().setTextSelection(match).scrollIntoView().run();
      close();
    }
  };
  const replace = (all: boolean) => {
    const count = replaceEditorText(editor, query, replacement, all, caseSensitive);
    setFeedback(`${count} ocorrência(s) substituída(s).`);
  };
  return (
    <Box data-testid="ai-lesson-editor-advanced-tools" sx={{ display: 'contents' }}>
      <Tooltip title="Fonte, tamanho e espaçamento">
        <IconButton
          data-testid="ai-lesson-editor-format"
          aria-label="Fonte, tamanho e espaçamento"
          onClick={() => {
            onOpenTool?.();
            setDialog(LessonEditorDialog.FORMAT);
          }}
        >
          <FormatSize />
        </IconButton>
      </Tooltip>
      <Tooltip title="Espaçamento entre linhas">
        <IconButton
          data-testid="ai-lesson-editor-line-spacing"
          aria-label="Espaçamento entre linhas"
          onClick={() => {
            onOpenTool?.();
            setDialog(LessonEditorDialog.FORMAT);
          }}
        >
          <FormatLineSpacing />
        </IconButton>
      </Tooltip>
      <Tooltip title="Inserir ou editar link">
        <IconButton
          data-testid="ai-lesson-editor-link"
          aria-label="Inserir ou editar link"
          onClick={openLink}
        >
          <Link />
        </IconButton>
      </Tooltip>
      <Tooltip title="Localizar e substituir">
        <IconButton
          data-testid="ai-lesson-editor-find"
          aria-label="Localizar e substituir"
          onClick={() => {
            onOpenTool?.();
            setFeedback('');
            setDialog(LessonEditorDialog.FIND);
          }}
        >
          <Search />
        </IconButton>
      </Tooltip>
      <Tooltip title={fullscreen ? 'Sair da tela cheia' : 'Editar em tela cheia'}>
        <IconButton
          data-testid="ai-lesson-editor-fullscreen"
          aria-label={fullscreen ? 'Sair da tela cheia' : 'Editar em tela cheia'}
          onClick={onToggleFullscreen}
        >
          {fullscreen ? <FullscreenExit /> : <Fullscreen />}
        </IconButton>
      </Tooltip>
      <Dialog
        data-testid="ai-lesson-editor-tool-dialog"
        open={dialog !== null}
        onClose={close}
        fullWidth
        maxWidth="xs"
        disableRestoreFocus
        slotProps={{ transition: { onExited: () => editor.commands.focus() } }}
      >
        <DialogTitle>
          {dialog === LessonEditorDialog.FORMAT
            ? 'Fonte e espaçamento'
            : dialog === LessonEditorDialog.LINK
              ? 'Link'
              : 'Localizar e substituir'}
        </DialogTitle>
        <DialogContent sx={{ '& .MuiButton-root': { minHeight: 44 } }}>
          {dialog === LessonEditorDialog.FORMAT && (
            <Stack data-testid="ai-lesson-editor-format-options" spacing={2} sx={{ pt: 1 }}>
              <Typography variant="body2">
                Selecione o texto para aplicar a fonte e o tamanho. O espaçamento vale para os
                parágrafos selecionados.
              </Typography>
              <FormControl fullWidth>
                <InputLabel id="lesson-editor-font-label">Fonte</InputLabel>
                <Select
                  labelId="lesson-editor-font-label"
                  label="Fonte"
                  value={
                    typeof textStyle.fontFamily === 'string' &&
                    LESSON_EDITOR_FONTS.includes(textStyle.fontFamily)
                      ? textStyle.fontFamily
                      : ''
                  }
                  onChange={(event) => editor.chain().setFontFamily(event.target.value).run()}
                >
                  {LESSON_EDITOR_FONTS.map((font) => (
                    <MenuItem key={font} value={font}>
                      {font}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel id="lesson-editor-size-label">Tamanho da letra</InputLabel>
                <Select
                  labelId="lesson-editor-size-label"
                  label="Tamanho da letra"
                  value={
                    typeof textStyle.fontSize === 'string' &&
                    LESSON_EDITOR_FONT_SIZES_PT.some((size) => `${size}pt` === textStyle.fontSize)
                      ? textStyle.fontSize
                      : ''
                  }
                  onChange={(event) => editor.chain().setFontSize(event.target.value).run()}
                >
                  {LESSON_EDITOR_FONT_SIZES_PT.map((size) => (
                    <MenuItem key={size} value={`${size}pt`}>
                      {size} pt
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel id="lesson-editor-spacing-label">Espaçamento entre linhas</InputLabel>
                <Select
                  labelId="lesson-editor-spacing-label"
                  label="Espaçamento entre linhas"
                  value={
                    typeof paragraphStyle.lineHeight === 'string' &&
                    LESSON_EDITOR_LINE_HEIGHTS.includes(paragraphStyle.lineHeight)
                      ? paragraphStyle.lineHeight
                      : ''
                  }
                  onChange={(event) =>
                    editor
                      .chain()
                      .updateAttributes('paragraph', { lineHeight: event.target.value })
                      .updateAttributes('heading', { lineHeight: event.target.value })
                      .run()
                  }
                >
                  {LESSON_EDITOR_LINE_HEIGHTS.map((height) => (
                    <MenuItem key={height} value={height}>
                      {height.replace('.', ',')}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          )}
          {dialog === LessonEditorDialog.LINK && (
            <Stack data-testid="ai-lesson-editor-link-options" spacing={2} sx={{ pt: 1 }}>
              <TextField
                label="Endereço do link"
                value={url}
                onChange={(event) => {
                  setUrl(event.target.value);
                  setUrlError(false);
                }}
                error={urlError}
                helperText={
                  urlError
                    ? 'Informe um endereço válido (https, http, e-mail ou telefone).'
                    : 'Exemplo: https://exemplo.com'
                }
                fullWidth
              />
              {!hasLinkSelection && (
                <TextField
                  label="Texto do link"
                  value={linkText}
                  onChange={(event) => setLinkText(event.target.value)}
                  helperText="Se vazio, será exibido o endereço."
                  fullWidth
                />
              )}
              <Button
                data-testid="ai-lesson-editor-link-apply"
                variant="contained"
                onClick={applyLink}
              >
                Aplicar link
              </Button>
              <Button
                disabled={!editor.isActive('link')}
                onClick={() => {
                  editor.chain().extendMarkRange('link').unsetLink().run();
                  close();
                }}
              >
                Remover link
              </Button>
            </Stack>
          )}
          {dialog === LessonEditorDialog.FIND && (
            <Stack data-testid="ai-lesson-editor-find-options" spacing={2} sx={{ pt: 1 }}>
              <TextField
                label="Localizar"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setFeedback('');
                }}
                fullWidth
              />
              <TextField
                label="Substituir por"
                value={replacement}
                onChange={(event) => setReplacement(event.target.value)}
                fullWidth
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={caseSensitive}
                    onChange={(event) => setCaseSensitive(event.target.checked)}
                  />
                }
                label="Diferenciar maiúsculas e minúsculas"
              />
              <Typography data-testid="ai-lesson-editor-find-count" aria-live="polite">
                {matches.length} ocorrência(s) encontrada(s).
              </Typography>
              {feedback && (
                <Alert data-testid="ai-lesson-editor-replace-feedback" severity="success">
                  {feedback}
                </Alert>
              )}
              <Button disabled={!matches.length} onClick={findNext}>
                Localizar próximo
              </Button>
              <Button
                data-testid="ai-lesson-editor-replace-one"
                disabled={!matches.length}
                onClick={() => replace(false)}
              >
                Substituir uma
              </Button>
              <Button
                data-testid="ai-lesson-editor-replace-all"
                disabled={!matches.length}
                variant="contained"
                onClick={() => replace(true)}
              >
                Substituir todas
              </Button>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button sx={{ minHeight: 44 }} onClick={close}>
            Concluído
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
