import { useState } from 'react';
import {
  Box,
  Button,
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
import { AddPhotoAlternate, Delete } from '@mui/icons-material';

import { MediaItem } from '@/store/slices/types';

import { ImageSectionDraft } from '../types';

interface ImageSectionEditorProps {
  section: ImageSectionDraft;
  index: number;
  onChange: (section: ImageSectionDraft) => void;
  onRemove: () => void;
  onAddImages: () => void;
}

/** Uma seção da galeria: dados, visibilidade e suas imagens. */
export default function ImageSectionEditor({
  section,
  index,
  onChange,
  onRemove,
  onAddImages,
}: ImageSectionEditorProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [mediaToRemove, setMediaToRemove] = useState<number | null>(null);

  const updateMedia = (mediaItems: MediaItem[]) =>
    onChange({ ...section, mediaItems });

  return (
    <Paper data-testid="image-pages-image-section-editor" variant="outlined" sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 2 }}>
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
          Seção {index + 1}
        </Typography>

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

      <Grid2 container spacing={2}>
        <Grid2 size={{ xs: 12, md: 5 }}>
          <TextField
            label="Legenda da seção"
            fullWidth
            value={section.caption}
            onChange={(event) =>
              onChange({ ...section, caption: event.target.value })
            }
          />
        </Grid2>

        <Grid2 size={{ xs: 12, md: 7 }}>
          <TextField
            label="Descrição da seção"
            fullWidth
            value={section.description}
            onChange={(event) =>
              onChange({ ...section, description: event.target.value })
            }
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
                  onChange={(event) =>
                    onChange({ ...section, public: event.target.checked })
                  }
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
          {section.mediaItems.length}
        </Typography>
      </Box>

      {section.mediaItems.length === 0 ? (
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
        <Grid2 container spacing={2}>
          {section.mediaItems.map((media, mediaIndex) => (
            <Grid2
              size={{ xs: 6, sm: 4, md: 3 }}
              key={`${media.id ?? 'nova'}-${mediaIndex}`}
            >
              <Paper
                variant="outlined"
                sx={{
                  borderRadius: 2,
                  overflow: 'hidden',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Box
                  component="img"
                  src={media.url}
                  alt={media.title || `Imagem ${mediaIndex + 1}`}
                  sx={{
                    width: '100%',
                    aspectRatio: '1 / 1',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />

                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    px: 1,
                    py: 0.5,
                    borderTop: 1,
                    borderColor: 'divider',
                  }}
                >
                  <Typography
                    variant="caption"
                    noWrap
                    sx={{ flex: 1, minWidth: 0 }}
                  >
                    {media.title || media.originalName || 'Sem título'}
                  </Typography>

                  <Tooltip title="Remover imagem">
                    <IconButton
                      color="error"
                      aria-label={`Remover imagem ${mediaIndex + 1} da seção ${index + 1}`}
                      onClick={() => setMediaToRemove(mediaIndex)}
                      sx={{ width: 44, height: 44 }}
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

      <Dialog open={confirmRemove} onClose={() => setConfirmRemove(false)}>
        <DialogTitle>Remover seção</DialogTitle>
        <DialogContent>
          <DialogContentText>
            A seção e as {section.mediaItems.length} imagem(ns) dela saem da
            galeria ao salvar.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button type="button" onClick={() => setConfirmRemove(false)}>
            Cancelar
          </Button>
          <Button
            type="button"
            color="error"
            onClick={() => {
              setConfirmRemove(false);
              onRemove();
            }}
          >
            Remover
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={mediaToRemove !== null}
        onClose={() => setMediaToRemove(null)}
      >
        <DialogTitle>Remover imagem</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Deseja remover esta imagem da seção?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button type="button" onClick={() => setMediaToRemove(null)}>
            Cancelar
          </Button>
          <Button
            type="button"
            color="error"
            onClick={() => {
              if (mediaToRemove === null) return;
              updateMedia(
                section.mediaItems.filter((_, i) => i !== mediaToRemove),
              );
              setMediaToRemove(null);
            }}
          >
            Remover
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
