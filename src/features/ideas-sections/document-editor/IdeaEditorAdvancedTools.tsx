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
  IDEA_EDITOR_FONTS,
  IDEA_EDITOR_FONT_SIZES_PT,
  IDEA_EDITOR_LINE_HEIGHTS,
} from './editor.constants';
import { IdeaEditorDialog, type IdeaEditorAdvancedToolsProps } from './editor.types';
import { findEditorTextMatches, normalizeEditorLinkUrl, replaceEditorText } from './editor.utils';

export function IdeaEditorAdvancedTools({
  editor,
  fullscreen,
  onToggleFullscreen,
  onOpenTool,
}: IdeaEditorAdvancedToolsProps) {
  const [dialog, setDialog] = useState<IdeaEditorDialog | null>(null);
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
    setDialog(IdeaEditorDialog.LINK);
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
    <Box data-testid="idea-editor-advanced-tools" sx={{ display: 'contents' }}>
      <Tooltip title="Fonte, tamanho e espaçamento">
        <IconButton
          data-testid="idea-editor-format"
          aria-label="Fonte, tamanho e espaçamento"
          onClick={() => {
            onOpenTool?.();
            setDialog(IdeaEditorDialog.FORMAT);
          }}
        >
          <FormatSize />
        </IconButton>
      </Tooltip>
      <Tooltip title="Espaçamento entre linhas">
        <IconButton
          data-testid="idea-editor-line-spacing"
          aria-label="Espaçamento entre linhas"
          onClick={() => {
            onOpenTool?.();
            setDialog(IdeaEditorDialog.FORMAT);
          }}
        >
          <FormatLineSpacing />
        </IconButton>
      </Tooltip>
      <Tooltip title="Inserir ou editar link">
        <IconButton
          data-testid="idea-editor-link"
          aria-label="Inserir ou editar link"
          onClick={openLink}
        >
          <Link />
        </IconButton>
      </Tooltip>
      <Tooltip title="Localizar e substituir">
        <IconButton
          data-testid="idea-editor-find"
          aria-label="Localizar e substituir"
          onClick={() => {
            onOpenTool?.();
            setFeedback('');
            setDialog(IdeaEditorDialog.FIND);
          }}
        >
          <Search />
        </IconButton>
      </Tooltip>
      <Tooltip title={fullscreen ? 'Sair da tela cheia' : 'Editar em tela cheia'}>
        <IconButton
          data-testid="idea-editor-fullscreen"
          aria-label={fullscreen ? 'Sair da tela cheia' : 'Editar em tela cheia'}
          onClick={onToggleFullscreen}
        >
          {fullscreen ? <FullscreenExit /> : <Fullscreen />}
        </IconButton>
      </Tooltip>
      <Dialog
        data-testid="idea-editor-tool-dialog"
        open={dialog !== null}
        onClose={close}
        fullWidth
        maxWidth="xs"
        disableRestoreFocus
        slotProps={{ transition: { onExited: () => editor.commands.focus() } }}
      >
        <DialogTitle>
          {dialog === IdeaEditorDialog.FORMAT
            ? 'Fonte e espaçamento'
            : dialog === IdeaEditorDialog.LINK
              ? 'Link'
              : 'Localizar e substituir'}
        </DialogTitle>
        <DialogContent sx={{ '& .MuiButton-root': { minHeight: 44 } }}>
          {dialog === IdeaEditorDialog.FORMAT && (
            <Stack data-testid="idea-editor-format-options" spacing={2} sx={{ pt: 1 }}>
              <Typography variant="body2">
                Selecione o texto para aplicar a fonte e o tamanho. O espaçamento vale para os
                parágrafos selecionados.
              </Typography>
              <FormControl fullWidth>
                <InputLabel id="idea-editor-font-label">Fonte</InputLabel>
                <Select
                  labelId="idea-editor-font-label"
                  label="Fonte"
                  value={
                    typeof textStyle.fontFamily === 'string' &&
                    IDEA_EDITOR_FONTS.includes(textStyle.fontFamily)
                      ? textStyle.fontFamily
                      : ''
                  }
                  onChange={(event) => editor.chain().setFontFamily(event.target.value).run()}
                >
                  {IDEA_EDITOR_FONTS.map((font) => (
                    <MenuItem key={font} value={font}>
                      {font}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel id="idea-editor-size-label">Tamanho da letra</InputLabel>
                <Select
                  labelId="idea-editor-size-label"
                  label="Tamanho da letra"
                  value={
                    typeof textStyle.fontSize === 'string' &&
                    IDEA_EDITOR_FONT_SIZES_PT.some((size) => `${size}pt` === textStyle.fontSize)
                      ? textStyle.fontSize
                      : ''
                  }
                  onChange={(event) => editor.chain().setFontSize(event.target.value).run()}
                >
                  {IDEA_EDITOR_FONT_SIZES_PT.map((size) => (
                    <MenuItem key={size} value={`${size}pt`}>
                      {size} pt
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel id="idea-editor-spacing-label">Espaçamento entre linhas</InputLabel>
                <Select
                  labelId="idea-editor-spacing-label"
                  label="Espaçamento entre linhas"
                  value={
                    typeof paragraphStyle.lineHeight === 'string' &&
                    IDEA_EDITOR_LINE_HEIGHTS.includes(paragraphStyle.lineHeight)
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
                  {IDEA_EDITOR_LINE_HEIGHTS.map((height) => (
                    <MenuItem key={height} value={height}>
                      {height.replace('.', ',')}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          )}
          {dialog === IdeaEditorDialog.LINK && (
            <Stack data-testid="idea-editor-link-options" spacing={2} sx={{ pt: 1 }}>
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
              <Button data-testid="idea-editor-link-apply" variant="contained" onClick={applyLink}>
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
          {dialog === IdeaEditorDialog.FIND && (
            <Stack data-testid="idea-editor-find-options" spacing={2} sx={{ pt: 1 }}>
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
              <Typography data-testid="idea-editor-find-count" aria-live="polite">
                {matches.length} ocorrência(s) encontrada(s).
              </Typography>
              {feedback && (
                <Alert data-testid="idea-editor-replace-feedback" severity="success">
                  {feedback}
                </Alert>
              )}
              <Button disabled={!matches.length} onClick={findNext}>
                Localizar próximo
              </Button>
              <Button
                data-testid="idea-editor-replace-one"
                disabled={!matches.length}
                onClick={() => replace(false)}
              >
                Substituir uma
              </Button>
              <Button
                data-testid="idea-editor-replace-all"
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
