import { useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  IconButton,
  Paper,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import {
  CloudUploadOutlined,
  DeleteOutline,
  PhotoLibraryOutlined,
  VideocamOutlined,
} from '@mui/icons-material';
import { MediaType } from '@/store/slices/types';
import type { ClubinhoMediaEditorProps } from '../types';
import {
  CLUBINHO_CAPTION_MAX_LENGTH,
  CLUBINHO_IMAGE_ACCEPT,
  CLUBINHO_VIDEO_ACCEPT,
} from '../constants';
import { toClubinhoUploadMedia, validateClubinhoSelection } from '../media-utils';
import { ClubinhoMediaPreview } from './ClubinhoMediaPreview';

export function ClubinhoMediaEditor({
  initialCaption,
  initialDescription,
  initialMediaItems,
  onChange,
  captionPlaceholder = 'Ex.: Clubinho 90 — Um sábado de descobertas',
  descriptionPlaceholder = 'Conte o que aconteceu neste encontro e o que tornou esse momento especial.',
  disabled = false,
}: ClubinhoMediaEditorProps) {
  const [mode, setMode] = useState(
    initialMediaItems[0]?.mediaType === MediaType.VIDEO ? MediaType.VIDEO : MediaType.IMAGE
  );
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const video = mode === MediaType.VIDEO;
  const addFiles = (files: File[]) => {
    if (disabled) return;
    const message = validateClubinhoSelection({
      files,
      mediaType: mode,
      currentCount: initialMediaItems.length,
    });
    setError(message ?? '');
    if (!message && files.length)
      onChange({
        mediaItems: [
          ...initialMediaItems,
          ...files.map((file) => toClubinhoUploadMedia(file, mode)),
        ],
      });
  };
  return (
    <Box
      data-testid="teacher-area-image-section-image-section-editor"
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.25fr) minmax(0, 1fr)' },
        gap: 3,
        alignItems: 'start',
      }}
    >
      <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3, minWidth: 0 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2} gap={1}>
          <Typography component="h2" variant="h6" fontWeight={700}>
            1. Escolha o registro
          </Typography>
          <Chip size="small" label={video ? '1 vídeo' : 'Até 20 fotos'} />
        </Stack>
        <ToggleButtonGroup
          value={mode}
          exclusive
          fullWidth
          disabled={disabled}
          aria-label="Tipo de publicação"
          onChange={(_, value: MediaType | null) => {
            if (!value || value === mode) return;
            if (initialMediaItems.length) {
              setError('Remova os arquivos selecionados antes de trocar entre fotos e vídeo.');
              return;
            }
            setMode(value);
            setError('');
          }}
          sx={{
            mb: 2,
            '& .MuiToggleButton-root': { minHeight: 52, textTransform: 'none', gap: 1 },
          }}
        >
          <ToggleButton data-testid="clubinho-upload-photos-mode" value={MediaType.IMAGE}>
            <PhotoLibraryOutlined /> Fotos
          </ToggleButton>
          <ToggleButton data-testid="clubinho-upload-video-mode" value={MediaType.VIDEO}>
            <VideocamOutlined /> Vídeo
          </ToggleButton>
        </ToggleButtonGroup>
        {error && (
          <Alert data-testid="clubinho-upload-validation" severity="warning" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Box
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            addFiles(Array.from(event.dataTransfer.files));
          }}
          sx={{
            border: '2px dashed',
            borderColor: 'divider',
            borderRadius: 3,
            textAlign: 'center',
            p: { xs: 2, sm: 3 },
            bgcolor: 'action.hover',
          }}
        >
          <CloudUploadOutlined color="success" sx={{ fontSize: 40, mb: 1 }} />
          <Typography fontWeight={600}>
            {video ? 'Compartilhe o momento em movimento' : 'Cada foto conta uma história'}
          </Typography>
          <Typography color="text.secondary" variant="body2" sx={{ mt: 0.5, mb: 2 }}>
            {video
              ? 'Um vídeo MP4 ou WebM, até 100 MB.'
              : 'JPG, PNG, WebP ou GIF. Até 10 MB por foto.'}
          </Typography>
          <Button
            type="button"
            variant="outlined"
            color="success"
            disabled={disabled || (video && initialMediaItems.length > 0)}
            onClick={() => inputRef.current?.click()}
            sx={{ minHeight: 44 }}
          >
            {video ? 'Selecionar vídeo' : 'Selecionar fotos'}
          </Button>
          <input
            ref={inputRef}
            data-testid="clubinho-upload-input"
            type="file"
            hidden
            disabled={disabled}
            multiple={!video}
            accept={video ? CLUBINHO_VIDEO_ACCEPT : CLUBINHO_IMAGE_ACCEPT}
            onChange={(event) => {
              addFiles(Array.from(event.target.files ?? []));
              event.target.value = '';
            }}
          />
          <Typography variant="caption" display="block" color="text.secondary" mt={1}>
            Ou arraste os arquivos até aqui
          </Typography>
        </Box>
        {initialMediaItems.length > 0 && (
          <Box
            data-testid="clubinho-upload-previews"
            sx={{
              display: 'grid',
              gridTemplateColumns: video ? '1fr' : { xs: '1fr 1fr', sm: 'repeat(3, 1fr)' },
              gap: 1.5,
              mt: 2,
            }}
          >
            {initialMediaItems.map((media, index) => (
              <Box key={media.id ?? `${media.originalName}-${index}`} sx={{ minWidth: 0 }}>
                <ClubinhoMediaPreview media={media} />
                <Stack direction="row" alignItems="center" justifyContent="space-between" gap={0.5}>
                  <Typography variant="caption" noWrap sx={{ minWidth: 0, flex: 1 }}>
                    {media.originalName || media.title || `Foto ${index + 1}`}
                  </Typography>
                  <IconButton
                    data-testid="clubinho-upload-remove"
                    disabled={disabled}
                    aria-label={`Remover ${media.originalName || media.title || 'arquivo'}`}
                    onClick={() => {
                      onChange({
                        mediaItems: initialMediaItems.filter((_, position) => position !== index),
                      });
                      setError('');
                    }}
                    sx={{ minWidth: 44, minHeight: 44 }}
                  >
                    <DeleteOutline fontSize="small" />
                  </IconButton>
                </Stack>
              </Box>
            ))}
          </Box>
        )}
      </Paper>
      <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3, minWidth: 0 }}>
        <Stack spacing={2.5}>
          <Typography component="h2" variant="h6" fontWeight={700}>
            2. Conte essa história
          </Typography>
          <TextField
            required
            fullWidth
            label="Título da publicação"
            value={initialCaption}
            disabled={disabled}
            placeholder={captionPlaceholder}
            inputProps={{ maxLength: CLUBINHO_CAPTION_MAX_LENGTH }}
            onChange={(event) => onChange({ caption: event.target.value })}
            helperText="Inclua o número do Clubinho para facilitar a identificação."
          />
          <TextField
            required
            fullWidth
            multiline
            minRows={5}
            label="Descrição"
            value={initialDescription}
            disabled={disabled}
            placeholder={descriptionPlaceholder}
            onChange={(event) => onChange({ description: event.target.value })}
          />
          <Alert severity="info">
            Seu envio passa pela revisão da equipe antes de aparecer no feed. O nome de quem enviou
            acompanha a publicação.
          </Alert>
        </Stack>
      </Paper>
    </Box>
  );
}
