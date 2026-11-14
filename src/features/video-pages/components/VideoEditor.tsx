import { Fragment, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
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
import { Add, Close, Delete, Edit, UploadFile } from '@mui/icons-material';

import { FORM_VALIDATION_MESSAGES } from '@/constants/errorMessages';
import {
  MediaItem,
  MediaPlatform,
  MediaType,
  MediaUploadType,
} from '@/store/slices/types';
import { validateMediaURL } from '@/utils/validateMediaURL';

import { VideoDraft } from '../types';

interface VideoEditorProps {
  videos: VideoDraft[];
  onChange: (videos: VideoDraft[]) => void;
  /** Informa ao formulário que há um vídeo em edição ou começado. */
  onDraftChange?: (hasDraft: boolean) => void;
}

interface EditorErrors {
  title: boolean;
  description: boolean;
  source: boolean;
}

const NO_ERRORS: EditorErrors = {
  title: false,
  description: false,
  source: false,
};

const PLATFORM_LABELS: Record<MediaPlatform, string> = {
  [MediaPlatform.YOUTUBE]: 'YouTube',
  [MediaPlatform.GOOGLE_DRIVE]: 'Google Drive',
  [MediaPlatform.ONEDRIVE]: 'OneDrive',
  [MediaPlatform.DROPBOX]: 'Dropbox',
  [MediaPlatform.ANY]: 'Outro',
};

const PLATFORM_OPTIONS = [
  MediaPlatform.YOUTUBE,
  MediaPlatform.GOOGLE_DRIVE,
  MediaPlatform.ONEDRIVE,
  MediaPlatform.DROPBOX,
];

const buildEmptyVideo = (): MediaItem => ({
  title: '',
  description: '',
  mediaType: MediaType.VIDEO,
  uploadType: MediaUploadType.LINK,
  platformType: MediaPlatform.YOUTUBE,
  url: '',
  isLocalFile: false,
});

/** Editor da lista de vídeos da galeria. */
export default function VideoEditor({
  videos,
  onChange,
  onDraftChange,
}: VideoEditorProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [draft, setDraft] = useState<VideoDraft>(buildEmptyVideo);
  const [fileName, setFileName] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [errors, setErrors] = useState<EditorErrors>(NO_ERRORS);

  const isLink = draft.uploadType === MediaUploadType.LINK;
  const isEditing = editingIndex !== null;

  const hasStartedDraft =
    Boolean(draft.title) || Boolean(draft.description) || Boolean(draft.url);
  const hasDraft = isEditing || hasStartedDraft;

  useEffect(() => {
    onDraftChange?.(hasDraft);
  }, [hasDraft, onDraftChange]);

  const resetDraft = () => {
    setEditingIndex(null);
    setDraft(buildEmptyVideo());
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

  const handleSave = () => {
    // Um upload já salvo continua válido sem arquivo novo: o objeto no S3 é
    // preservado pela API.
    const hasStoredFile = Boolean(draft.id) || Boolean(draft.file);
    const isValidUrl =
      !isLink || validateMediaURL(draft.url, draft.platformType);

    const nextErrors: EditorErrors = {
      title: !draft.title,
      description: !draft.description,
      source: isLink ? !draft.url || !isValidUrl : !hasStoredFile,
    };
    setErrors(nextErrors);

    if (nextErrors.title || nextErrors.description || nextErrors.source) return;

    const updated = [...videos];
    if (editingIndex !== null) {
      updated[editingIndex] = draft;
    } else {
      updated.push(draft);
    }

    onChange(updated);
    resetDraft();
  };

  const handleEdit = (index: number) => {
    const video = videos[index];

    setDraft({
      ...video,
      // Vídeo de link salvo sem plataforma reprovaria em validateMediaURL.
      platformType:
        video.uploadType === MediaUploadType.LINK && !video.platformType
          ? MediaPlatform.YOUTUBE
          : video.platformType,
    });
    setFileName(video.file?.name ?? video.originalName ?? '');
    setEditingIndex(index);
    setErrors(NO_ERRORS);
  };

  const confirmRemove = () => {
    if (deleteIndex === null) return;

    onChange(videos.filter((_, index) => index !== deleteIndex));
    if (editingIndex === deleteIndex) {
      resetDraft();
    } else if (editingIndex !== null && deleteIndex < editingIndex) {
      // A remoção desloca a lista: sem reposicionar, salvar gravaria por cima
      // do vídeo vizinho.
      setEditingIndex(editingIndex - 1);
    }
    setDeleteIndex(null);
  };

  return (
    <Box data-testid="video-pages-video-editor">
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
            {isEditing ? 'Editando vídeo' : 'Adicionar vídeo'}
          </Typography>

          {isEditing && (
            <Tooltip title="Cancelar edição">
              <IconButton
                size="small"
                aria-label="Cancelar edição"
                onClick={resetDraft}
              >
                <Close fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        <Grid2 container spacing={2}>
          <Grid2 size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Título do vídeo"
              fullWidth
              required
              value={draft.title}
              onChange={(event) =>
                setDraft((previous) => ({
                  ...previous,
                  title: event.target.value,
                }))
              }
              error={errors.title}
              helperText={
                errors.title ? FORM_VALIDATION_MESSAGES.REQUIRED_FIELD : ''
              }
            />
          </Grid2>

          <Grid2 size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Descrição do vídeo"
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
              helperText={
                errors.description ? FORM_VALIDATION_MESSAGES.REQUIRED_FIELD : ''
              }
            />
          </Grid2>

          <Grid2 size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth>
              <InputLabel id="video-upload-type">Tipo</InputLabel>
              <Select
                labelId="video-upload-type"
                label="Tipo"
                value={draft.uploadType}
                onChange={(event) => {
                  const uploadType = event.target.value as MediaUploadType;
                  setFileName('');
                  setDraft((previous) => ({
                    ...previous,
                    uploadType,
                    platformType:
                      uploadType === MediaUploadType.LINK
                        ? MediaPlatform.YOUTUBE
                        : undefined,
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
                  <InputLabel id="video-platform">Plataforma</InputLabel>
                  <Select
                    labelId="video-platform"
                    label="Plataforma"
                    value={draft.platformType ?? ''}
                    onChange={(event) =>
                      setDraft((previous) => ({
                        ...previous,
                        platformType: event.target.value as MediaPlatform,
                      }))
                    }
                  >
                    {PLATFORM_OPTIONS.map((platform) => (
                      <MenuItem key={platform} value={platform}>
                        {PLATFORM_LABELS[platform]}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid2>

              <Grid2 size={12}>
                <TextField
                  label="URL do vídeo"
                  fullWidth
                  required
                  value={draft.url}
                  onChange={(event) =>
                    setDraft((previous) => ({
                      ...previous,
                      url: event.target.value,
                    }))
                  }
                  error={errors.source}
                  helperText={
                    errors.source ? FORM_VALIDATION_MESSAGES.INVALID_URL : ''
                  }
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
                  Enviar vídeo
                  <input
                    type="file"
                    hidden
                    accept="video/*"
                    onChange={handleUpload}
                  />
                </Button>

                <Box>
                  <Typography
                    variant="body2"
                    color={errors.source ? 'error' : 'text.secondary'}
                    sx={{ wordBreak: 'break-all' }}
                  >
                    {fileName || 'Nenhum arquivo selecionado'}
                  </Typography>
                  {!draft.file && draft.id && (
                    <Typography variant="caption" color="text.secondary">
                      Arquivo atual; escolha outro apenas se quiser substituí-lo.
                    </Typography>
                  )}
                </Box>
              </Stack>
            </Grid2>
          )}

          <Grid2 size={12}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1.5}
              justifyContent="flex-end"
            >
              {isEditing && (
                <Button
                  type="button"
                  variant="text"
                  onClick={resetDraft}
                  fullWidth={isMobile}
                  sx={{ minHeight: 44, textTransform: 'none' }}
                >
                  Cancelar
                </Button>
              )}
              <Button
                type="button"
                variant="contained"
                startIcon={isEditing ? undefined : <Add />}
                onClick={handleSave}
                fullWidth={isMobile}
                sx={{ minHeight: 44, textTransform: 'none' }}
              >
                {isEditing ? 'Salvar alterações' : 'Adicionar vídeo'}
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
          Vídeos adicionados
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {videos.length}
        </Typography>
      </Box>

      {videos.length === 0 ? (
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
            Nenhum vídeo adicionado ainda.
          </Typography>
        </Paper>
      ) : (
        <Grid2 container spacing={2}>
          {videos.map((video, index) => (
            <Grid2
              size={{ xs: 12, sm: 6, md: 4 }}
              key={`${video.id ?? 'novo'}-${index}`}
            >
              <Paper
                variant="outlined"
                sx={{
                  height: '100%',
                  borderRadius: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  borderColor:
                    editingIndex === index ? 'primary.main' : 'divider',
                }}
              >
                <Box sx={{ p: 2, flexGrow: 1 }}>
                  <Typography variant="subtitle2" fontWeight={700}>
                    {video.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    {video.description}
                  </Typography>

                  {video.uploadType === MediaUploadType.LINK ? (
                    <Box sx={{ aspectRatio: '16/9' }}>
                      <iframe
                        src={video.url}
                        title={video.title}
                        allowFullScreen
                        style={{ width: '100%', height: '100%', border: 0 }}
                      />
                    </Box>
                  ) : (
                    <video controls style={{ width: '100%', marginTop: 8 }}>
                      <source src={video.url} />
                    </video>
                  )}
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: 0.5,
                    px: 1,
                    py: 0.5,
                    borderTop: 1,
                    borderColor: 'divider',
                    '& .MuiIconButton-root': { width: 44, height: 44 },
                  }}
                >
                  <Tooltip title="Editar">
                    <IconButton
                      aria-label={`Editar ${video.title}`}
                      onClick={() => handleEdit(index)}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Remover">
                    <IconButton
                      color="error"
                      aria-label={`Remover ${video.title}`}
                      onClick={() => setDeleteIndex(index)}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Paper>
            </Grid2>
          ))}
        </Grid2>
      )}

      <Dialog open={deleteIndex !== null} onClose={() => setDeleteIndex(null)}>
        <DialogTitle>Remover vídeo</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Deseja remover este vídeo da galeria?
          </DialogContentText>
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
