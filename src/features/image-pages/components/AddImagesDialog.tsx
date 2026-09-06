import { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid2,
  IconButton,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Delete, UploadFile } from '@mui/icons-material';

import {
  MediaItem,
  MediaPlatform,
  MediaType,
  MediaUploadType,
} from '@/store/slices/types';

interface AddImagesDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (images: MediaItem[]) => void;
}

const toDraft = (file: File): MediaItem => ({
  title: file.name.replace(/\.[^.]+$/, ''),
  description: '',
  mediaType: MediaType.IMAGE,
  uploadType: MediaUploadType.UPLOAD,
  platformType: MediaPlatform.ANY,
  isLocalFile: true,
  url: URL.createObjectURL(file),
  originalName: file.name,
  size: file.size,
  file,
});

/** Seleção de imagens que serão acrescentadas a uma seção. */
export default function AddImagesDialog({
  open,
  onClose,
  onConfirm,
}: AddImagesDialogProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [images, setImages] = useState<MediaItem[]>([]);

  const handleSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    setImages((previous) => [...previous, ...files.map(toDraft)]);
    // Permite escolher o mesmo arquivo de novo depois de removê-lo.
    event.target.value = '';
  };

  const close = () => {
    setImages([]);
    onClose();
  };

  return (
    <Dialog data-testid="image-pages-add-images-dialog"
      open={open}
      onClose={close}
      fullWidth
      maxWidth="md"
      fullScreen={isMobile}
    >
      <DialogTitle>Adicionar imagens</DialogTitle>

      <DialogContent dividers>
        <Button
          variant="outlined"
          component="label"
          startIcon={<UploadFile />}
          fullWidth={isMobile}
          sx={{ minHeight: 44, textTransform: 'none', mb: 2 }}
        >
          Escolher arquivos
          <input
            type="file"
            hidden
            multiple
            accept="image/*"
            onChange={handleSelect}
          />
        </Button>

        {images.length === 0 ? (
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
              Nenhuma imagem escolhida ainda.
            </Typography>
          </Paper>
        ) : (
          <Grid2 container spacing={2}>
            {images.map((image, index) => (
              <Grid2 size={{ xs: 12, sm: 6 }} key={`${image.originalName}-${index}`}>
                <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                  <Stack direction="row" spacing={1.5} alignItems="flex-start">
                    <Box
                      component="img"
                      src={image.url}
                      alt={image.title}
                      sx={{
                        width: 72,
                        height: 72,
                        objectFit: 'cover',
                        borderRadius: 1,
                        flexShrink: 0,
                      }}
                    />

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <TextField
                        label="Título"
                        fullWidth
                        size="small"
                        value={image.title}
                        onChange={(event) =>
                          setImages((previous) =>
                            previous.map((item, i) =>
                              i === index
                                ? { ...item, title: event.target.value }
                                : item,
                            ),
                          )
                        }
                        sx={{ mb: 1 }}
                      />
                      <TextField
                        label="Descrição"
                        fullWidth
                        size="small"
                        value={image.description}
                        onChange={(event) =>
                          setImages((previous) =>
                            previous.map((item, i) =>
                              i === index
                                ? { ...item, description: event.target.value }
                                : item,
                            ),
                          )
                        }
                      />
                    </Box>

                    <Tooltip title="Remover">
                      <IconButton
                        color="error"
                        aria-label={`Remover ${image.title}`}
                        onClick={() =>
                          setImages((previous) =>
                            previous.filter((_, i) => i !== index),
                          )
                        }
                        sx={{ width: 44, height: 44 }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Paper>
              </Grid2>
            ))}
          </Grid2>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button type="button" onClick={close} sx={{ minHeight: 44 }}>
          Cancelar
        </Button>
        <Button
          type="button"
          variant="contained"
          disabled={images.length === 0}
          onClick={() => {
            onConfirm(images);
            setImages([]);
            onClose();
          }}
          sx={{ minHeight: 44, textTransform: 'none' }}
        >
          Adicionar{images.length > 0 ? ` (${images.length})` : ''}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
