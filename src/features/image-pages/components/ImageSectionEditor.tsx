import { useId, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  Grid2,
  IconButton,
  Paper,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { AddPhotoAlternate, Delete, ExpandMore } from '@mui/icons-material';

import { MediaViewerDialog } from '@/components/common/media';
import type { MediaItem } from '@/store/slices/types';

import { IMAGE_TITLE_MAX_LENGTH } from '../constants';
import type { ImageSectionEditorProps } from '../types';
import { sectionLabelOf } from '../utils';
import EditImageDialog from './EditImageDialog';
import ImageThumbCard from './ImageThumbCard';

/** Uma seção da galeria: dados, visibilidade e suas imagens. */
export default function ImageSectionEditor({
  section,
  index,
  onChange,
  onRemove,
  onAddImages,
  expanded,
  onExpandedChange,
  captionError = false,
  apiErrors,
}: ImageSectionEditorProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const panelId = useId();
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [mediaToRemove, setMediaToRemove] = useState<number | null>(null);
  const [mediaToEdit, setMediaToEdit] = useState<number | null>(null);
  const [viewing, setViewing] = useState<MediaItem | null>(null);

  const hasApiErrors = Boolean(apiErrors?.length);
  const open = expanded || captionError || hasApiErrors;
  const count = section.mediaItems.length;
  const updateMedia = (mediaItems: MediaItem[]) => onChange({ ...section, mediaItems });

  return (
    <Paper
      data-testid="image-pages-image-section-editor"
      variant="outlined"
      sx={{ p: { xs: 1.5, md: open ? 2.5 : 1 }, borderRadius: 3, overflow: 'hidden' }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          mb: open ? 2 : 0,
        }}
      >
        <Button
          data-testid="image-section-toggle"
          type="button"
          color="inherit"
          onClick={() => onExpandedChange(!expanded)}
          aria-expanded={open}
          aria-controls={panelId}
          startIcon={<ExpandMore sx={{ transform: open ? 'rotate(180deg)' : undefined }} />}
          sx={{
            minHeight: 44,
            minWidth: 0,
            flex: 1,
            justifyContent: 'flex-start',
            textAlign: 'left',
            textTransform: 'none',
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography
              component="h3"
              variant="subtitle1"
              fontWeight={700}
              sx={{ overflowWrap: 'anywhere' }}
            >
              {sectionLabelOf(section, index)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {section.public ? 'Pública' : 'Restrita'} · {count}{' '}
              {count === 1 ? 'imagem' : 'imagens'}
            </Typography>
          </Box>
        </Button>
        {captionError && <Chip size="small" color="error" label="Revise a legenda" />}
        {hasApiErrors && <Chip size="small" color="error" label="Recusada ao salvar" />}
        <Tooltip title="Remover seção">
          <IconButton
            color="error"
            aria-label={`Remover seção ${index + 1}`}
            onClick={() => setConfirmRemove(true)}
            sx={{ width: 44, height: 44 }}
          >
            <Delete fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <Collapse in={open}>
        <Box id={panelId}>
          {hasApiErrors && (
            <Alert data-testid="image-section-api-errors" severity="error" sx={{ mb: 2 }}>
              <Stack component="ul" sx={{ m: 0, pl: 2 }}>
                {apiErrors?.map((message) => (
                  <li key={message}>{message}</li>
                ))}
              </Stack>
            </Alert>
          )}

          <Grid2 container spacing={2}>
            <Grid2 size={{ xs: 12, md: 5 }}>
              <TextField
                label="Legenda da seção"
                fullWidth
                value={section.caption}
                onChange={(event) => onChange({ ...section, caption: event.target.value })}
                error={captionError}
                inputProps={{ maxLength: IMAGE_TITLE_MAX_LENGTH }}
                helperText={captionError ? 'Use até 255 caracteres.' : ''}
              />
            </Grid2>
            <Grid2 size={{ xs: 12, md: 7 }}>
              <TextField
                label="Descrição da seção"
                fullWidth
                value={section.description}
                onChange={(event) => onChange({ ...section, description: event.target.value })}
              />
            </Grid2>
            <Grid2 size={12}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.5}
                alignItems={{ xs: 'stretch', sm: 'center' }}
                justifyContent="space-between"
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={section.public}
                      onChange={(event) => onChange({ ...section, public: event.target.checked })}
                    />
                  }
                  label={section.public ? 'Seção pública' : 'Seção restrita'}
                />
                <Button
                  type="button"
                  variant="outlined"
                  startIcon={<AddPhotoAlternate />}
                  onClick={onAddImages}
                  fullWidth={isMobile}
                  sx={{ minHeight: 44, textTransform: 'none' }}
                >
                  Adicionar imagens
                </Button>
              </Stack>
            </Grid2>
          </Grid2>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mt: 3,
              mb: 1.5,
            }}
          >
            <Typography variant="body2" fontWeight={700}>
              Imagens
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {count}
            </Typography>
          </Box>

          {count === 0 ? (
            <Paper
              variant="outlined"
              sx={{
                p: { xs: 2.5, md: 3 },
                borderRadius: 2,
                textAlign: 'center',
                borderStyle: 'dashed',
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Nenhuma imagem nesta seção ainda.
              </Typography>
            </Paper>
          ) : (
            <Grid2 container spacing={{ xs: 1.5, md: 2 }}>
              {section.mediaItems.map((media, mediaIndex) => (
                <Grid2 size={{ xs: 6, sm: 4, md: 3 }} key={`${media.id ?? 'nova'}-${mediaIndex}`}>
                  <ImageThumbCard
                    media={media}
                    mediaIndex={mediaIndex}
                    sectionIndex={index}
                    onView={() => setViewing(media)}
                    onEdit={() => setMediaToEdit(mediaIndex)}
                    onRemove={() => setMediaToRemove(mediaIndex)}
                  />
                </Grid2>
              ))}
            </Grid2>
          )}
        </Box>
      </Collapse>

      <MediaViewerDialog media={viewing} onClose={() => setViewing(null)} />

      <EditImageDialog
        media={mediaToEdit === null ? null : (section.mediaItems[mediaToEdit] ?? null)}
        onClose={() => setMediaToEdit(null)}
        onSave={(next) => {
          if (mediaToEdit === null) return;
          updateMedia(section.mediaItems.map((item, i) => (i === mediaToEdit ? next : item)));
          setMediaToEdit(null);
        }}
      />

      <Dialog open={confirmRemove} onClose={() => setConfirmRemove(false)}>
        <DialogTitle>Remover seção</DialogTitle>
        <DialogContent>
          <DialogContentText>
            A seção e as {count} imagem(ns) dela saem da galeria ao salvar.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button type="button" onClick={() => setConfirmRemove(false)} sx={{ minHeight: 44 }}>
            Cancelar
          </Button>
          <Button
            type="button"
            color="error"
            onClick={() => {
              setConfirmRemove(false);
              onRemove();
            }}
            sx={{ minHeight: 44 }}
          >
            Remover
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={mediaToRemove !== null} onClose={() => setMediaToRemove(null)}>
        <DialogTitle>Remover imagem</DialogTitle>
        <DialogContent>
          <DialogContentText>Deseja remover esta imagem da seção?</DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button type="button" onClick={() => setMediaToRemove(null)} sx={{ minHeight: 44 }}>
            Cancelar
          </Button>
          <Button
            type="button"
            color="error"
            onClick={() => {
              if (mediaToRemove === null) return;
              updateMedia(section.mediaItems.filter((_, i) => i !== mediaToRemove));
              setMediaToRemove(null);
            }}
            sx={{ minHeight: 44 }}
          >
            Remover
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
