import { Fragment, useEffect, useId, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid2,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Add, Close, UploadFile } from '@mui/icons-material';

import { FORM_VALIDATION_MESSAGES } from '@/constants/errorMessages';
import { MediaItem, MediaPlatform, MediaUploadType } from '@/store/slices/types';
import { validateMediaURL } from '@/utils/validateMediaURL';

import { MEDIA_PLATFORM_LABELS } from './constants';
import { MediaEditorConfig, MediaEditorErrors } from './types';
import MediaItemCard from './MediaItemCard';
import MediaViewerDialog from './MediaViewerDialog';

interface MediaEditorProps {
  config: MediaEditorConfig;
  items: MediaItem[];
  onChange: (items: MediaItem[]) => void;
  /**
   * Informa ao formulário que há um item em edição ou um rascunho começado,
   * para que ele possa avisar antes de descartá-lo ao trocar de aba.
   */
  onDraftChange?: (hasDraft: boolean) => void;
}

const NO_ERRORS: MediaEditorErrors = {
  title: false,
  description: false,
  url: false,
};

const buildEmptyItem = (config: MediaEditorConfig): MediaItem => ({
  title: '',
  description: '',
  mediaType: config.mediaType,
  uploadType: MediaUploadType.LINK,
  url: '',
  platformType: config.defaultPlatform,
});

/**
 * Editor único usado por todas as abas de mídia do formulário: o tipo de mídia
 * muda apenas rótulos, arquivos aceitos, plataformas e a pré-visualização.
 */
export default function MediaEditor({ config, items, onChange, onDraftChange }: MediaEditorProps) {
  const inputId = useId();
  const [draft, setDraft] = useState<MediaItem>(() => buildEmptyItem(config));
  const [fileName, setFileName] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [viewing, setViewing] = useState<MediaItem | null>(null);
  const [errors, setErrors] = useState<MediaEditorErrors>(NO_ERRORS);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const isLink = draft.uploadType === MediaUploadType.LINK;
  const isEditing = editingIndex !== null;
  const lowerLabel = config.label.toLowerCase();

  const hasStartedDraft = Boolean(draft.title) || Boolean(draft.description) || Boolean(draft.url);
  const hasDraft = isEditing || hasStartedDraft;

  useEffect(() => {
    onDraftChange?.(hasDraft);
  }, [hasDraft, onDraftChange]);

  const resetDraft = () => {
    setEditingIndex(null);
    setDraft(buildEmptyItem(config));
    setFileName('');
    setErrors(NO_ERRORS);
  };

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setDraft((previous) => ({
      ...previous,
      url: URL.createObjectURL(file),
      file,
    }));
  };

  const handleAddOrUpdate = () => {
    const isValidUrl = !isLink || validateMediaURL(draft.url, draft.platformType);
    const nextErrors: MediaEditorErrors = {
      title: !draft.title.trim(),
      description: !draft.description.trim(),
      url: !draft.url || !isValidUrl,
    };
    setErrors(nextErrors);

    if (nextErrors.title || nextErrors.description || nextErrors.url) return;

    const updated = [...items];
    if (editingIndex !== null) {
      updated[editingIndex] = draft;
    } else {
      updated.push(draft);
    }

    onChange(updated);
    resetDraft();
  };

  const handleEdit = (index: number) => {
    const item = items[index];

    setDraft({
      ...item,
      // Item de link salvo sem plataforma reprovaria em validateMediaURL, que
      // exige a plataforma para validar a URL.
      platformType:
        item.uploadType === MediaUploadType.LINK && !item.platformType
          ? config.defaultPlatform
          : item.platformType,
    });
    setFileName(items[index].file?.name ?? items[index].originalName ?? '');
    setEditingIndex(index);
    setErrors(NO_ERRORS);
  };

  const confirmRemove = () => {
    if (deleteIndex === null) return;

    onChange(items.filter((_, index) => index !== deleteIndex));

    if (editingIndex === deleteIndex) {
      resetDraft();
    } else if (editingIndex !== null && deleteIndex < editingIndex) {
      // A remoção desloca a lista: sem reposicionar, "Salvar Alterações"
      // gravaria o rascunho por cima do item vizinho.
      setEditingIndex(editingIndex - 1);
    }

    setDeleteIndex(null);
  };

  return (
    <Box data-testid="media-media-editor">
      <Paper
        variant="outlined"
        sx={{
          p: { xs: 2, md: 2.5 },
          borderRadius: 2,
          borderStyle: isEditing ? 'solid' : 'dashed',
          borderColor: isEditing ? 'primary.main' : 'divider',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
            mb: 2,
          }}
        >
          <Typography variant="subtitle2" fontWeight={700}>
            {isEditing ? `Editando ${lowerLabel}` : `Adicionar ${lowerLabel}`}
          </Typography>

          {isEditing && (
            <Tooltip title="Cancelar edição">
              <IconButton size="small" aria-label="Cancelar edição" onClick={resetDraft}>
                <Close fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        <Grid2 container spacing={2}>
          <Grid2 size={{ xs: 12, sm: 6 }}>
            <TextField
              label={`Título do ${config.label}`}
              fullWidth
              required
              value={draft.title}
              onChange={(event) =>
                setDraft((previous) => ({ ...previous, title: event.target.value }))
              }
              error={errors.title}
              helperText={errors.title ? FORM_VALIDATION_MESSAGES.REQUIRED_FIELD : ''}
            />
          </Grid2>

          <Grid2 size={{ xs: 12, sm: 6 }}>
            <TextField
              label={`Descrição do ${config.label}`}
              fullWidth
              required
              value={draft.description}
              onChange={(event) =>
                setDraft((previous) => ({
                  ...previous,
                  description: event.target.value,
                }))
              }
              error={errors.description}
              helperText={errors.description ? FORM_VALIDATION_MESSAGES.REQUIRED_FIELD : ''}
            />
          </Grid2>

          <Grid2 size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth>
              <InputLabel id={`${inputId}-upload-type`}>Tipo</InputLabel>
              <Select
                labelId={`${inputId}-upload-type`}
                label="Tipo"
                value={draft.uploadType}
                onChange={(event) => {
                  const uploadType = event.target.value as MediaUploadType;
                  setFileName('');
                  setDraft((previous) => ({
                    ...previous,
                    uploadType,
                    isLocalFile: uploadType === MediaUploadType.UPLOAD,
                    platformType:
                      uploadType === MediaUploadType.LINK ? config.defaultPlatform : undefined,
                    url: '',
                    file: undefined,
                  }));
                }}
              >
                <MenuItem value={MediaUploadType.LINK}>Link</MenuItem>
                <MenuItem value={MediaUploadType.UPLOAD}>Upload</MenuItem>
              </Select>
            </FormControl>
          </Grid2>

          {isLink && (
            <Fragment>
              <Grid2 size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel id={`${inputId}-platform`}>Plataforma</InputLabel>
                  <Select
                    labelId={`${inputId}-platform`}
                    label="Plataforma"
                    value={draft.platformType ?? ''}
                    onChange={(event) =>
                      setDraft((previous) => ({
                        ...previous,
                        platformType: event.target.value as MediaPlatform,
                      }))
                    }
                  >
                    {config.platforms.map((platform) => (
                      <MenuItem key={platform} value={platform}>
                        {MEDIA_PLATFORM_LABELS[platform]}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid2>

              <Grid2 size={12}>
                <TextField
                  label={config.urlLabel}
                  fullWidth
                  required
                  value={draft.url}
                  onChange={(event) =>
                    setDraft((previous) => ({ ...previous, url: event.target.value }))
                  }
                  error={errors.url}
                  helperText={errors.url ? FORM_VALIDATION_MESSAGES.INVALID_URL : ''}
                />
              </Grid2>
            </Fragment>
          )}

          {!isLink && (
            <Grid2 size={12}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.5}
                alignItems={{ xs: 'flex-start', sm: 'center' }}
              >
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<UploadFile />}
                  fullWidth={isMobile}
                  sx={{ minHeight: 44, textTransform: 'none', flexShrink: 0 }}
                >
                  {config.uploadLabel}
                  <input type="file" hidden accept={config.accept} onChange={handleUpload} />
                </Button>

                <Typography
                  variant="body2"
                  color={errors.url && !fileName ? 'error' : 'text.secondary'}
                  sx={{ wordBreak: 'break-all' }}
                >
                  {fileName || 'Nenhum arquivo selecionado'}
                </Typography>
              </Stack>
            </Grid2>
          )}

          <Grid2 size={12}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="flex-end">
              {hasDraft && (
                <Button
                  type="button"
                  variant="text"
                  onClick={resetDraft}
                  fullWidth={isMobile}
                  sx={{ minHeight: 44, textTransform: 'none' }}
                >
                  {isEditing ? 'Cancelar' : 'Descartar rascunho'}
                </Button>
              )}
              <Button
                variant="contained"
                type="button"
                startIcon={isEditing ? undefined : <Add />}
                onClick={handleAddOrUpdate}
                fullWidth={isMobile}
                sx={{ minHeight: 44, textTransform: 'none' }}
              >
                {isEditing ? 'Salvar Alterações' : config.addLabel}
              </Button>
            </Stack>
          </Grid2>
        </Grid2>
      </Paper>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mt: { xs: 3, md: 4 },
          mb: 1.5,
        }}
      >
        <Typography variant="subtitle2" fontWeight={700}>
          Adicionados
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {items.length}
        </Typography>
      </Box>

      {items.length === 0 ? (
        <Paper
          variant="outlined"
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: 2,
            textAlign: 'center',
            borderStyle: 'dashed',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Nenhum item deste tipo foi adicionado ainda.
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={1.5}>
          {items.map((item, index) => (
            <MediaItemCard
              key={`${item.id ?? 'novo'}-${index}`}
              item={item}
              editing={editingIndex === index}
              onView={() => setViewing(item)}
              onEdit={() => handleEdit(index)}
              onRemove={() => setDeleteIndex(index)}
            />
          ))}
        </Stack>
      )}

      <MediaViewerDialog media={viewing} onClose={() => setViewing(null)} />

      <Dialog open={deleteIndex !== null} onClose={() => setDeleteIndex(null)}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography>Deseja realmente remover {config.confirmLabel}?</Typography>
        </DialogContent>
        <DialogActions>
          <Button type="button" onClick={() => setDeleteIndex(null)}>
            Cancelar
          </Button>
          <Button type="button" color="error" onClick={confirmRemove}>
            Remover
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
