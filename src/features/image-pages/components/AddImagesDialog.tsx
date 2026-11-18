import { DragEvent, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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

import { MediaItem, MediaPlatform, MediaType, MediaUploadType } from '@/store/slices/types';

import { IMAGE_ACCEPT } from '../constants';

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

const isImageFile = (file: File): boolean => file.type.startsWith('image/');

/** Seleção de imagens que serão acrescentadas a uma seção. */
export default function AddImagesDialog({ open, onClose, onConfirm }: AddImagesDialogProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [images, setImages] = useState<MediaItem[]>([]);
  const [rejected, setRejected] = useState<string[]>([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  // As URLs locais só devem ser liberadas quando a imagem é descartada, e não
  // quando é confirmada: a seção continua usando-as como miniatura.
  const discardable = useRef(new Set<string>());

  const release = (items: MediaItem[]) =>
    items.forEach((item) => {
      if (!discardable.current.has(item.url)) return;
      URL.revokeObjectURL(item.url);
      discardable.current.delete(item.url);
    });

  useEffect(() => {
    const pending = discardable.current;
    return () => pending.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  const addFiles = (files: File[]) => {
    const accepted = files.filter(isImageFile);
    setRejected(files.filter((file) => !isImageFile(file)).map((file) => file.name));
    if (!accepted.length) return;
    const drafts = accepted.map(toDraft);
    drafts.forEach((draft) => discardable.current.add(draft.url));
    setImages((previous) => [...previous, ...drafts]);
  };

  const handleSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(Array.from(event.target.files ?? []));
    // Permite escolher o mesmo arquivo de novo depois de removê-lo.
    event.target.value = '';
  };

  const handleDrop = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    setDragging(false);
    addFiles(Array.from(event.dataTransfer.files));
  };

  const close = () => {
    release(images);
    setImages([]);
    setRejected([]);
    onClose();
  };

  const update = (index: number, patch: Partial<MediaItem>) =>
    setImages((previous) =>
      previous.map((item, i) => (i === index ? { ...item, ...patch } : item))
    );

  return (
    <Dialog
      data-testid="image-pages-add-images-dialog"
      open={open}
      onClose={close}
      fullWidth
      maxWidth="md"
      fullScreen={isMobile}
    >
      <DialogTitle>Adicionar imagens</DialogTitle>

      <DialogContent dividers>
        <Paper
          variant="outlined"
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          sx={{
            p: { xs: 2, md: 3 },
            mb: 2,
            borderRadius: 2,
            borderStyle: 'dashed',
            textAlign: 'center',
            borderColor: dragging ? 'primary.main' : 'divider',
            bgcolor: dragging ? 'action.hover' : undefined,
          }}
        >
          <Button
            variant="outlined"
            component="label"
            startIcon={<UploadFile />}
            fullWidth={isMobile}
            sx={{ minHeight: 44, textTransform: 'none' }}
          >
            Escolher arquivos
            <input
              ref={inputRef}
              type="file"
              hidden
              multiple
              accept={IMAGE_ACCEPT}
              onChange={handleSelect}
            />
          </Button>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {isMobile ? 'Escolha da galeria ou da câmera.' : 'Ou arraste as fotos para cá.'}
          </Typography>
        </Paper>

        {rejected.length > 0 && (
          <Alert data-testid="image-pages-add-images-rejected" severity="warning" sx={{ mb: 2 }}>
            Só imagens são aceitas. Ignorado: {rejected.join(', ')}.
          </Alert>
        )}

        {images.length === 0 ? (
          <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
            Nenhuma imagem escolhida ainda.
          </Typography>
        ) : (
          <Stack spacing={1.5}>
            {images.map((image, index) => (
              <Paper
                key={`${image.originalName}-${index}`}
                variant="outlined"
                sx={{ p: 1.5, borderRadius: 2 }}
              >
                <Stack direction="row" spacing={1.5} alignItems="flex-start">
                  <Box
                    component="img"
                    src={image.url}
                    alt={image.title}
                    sx={{
                      width: { xs: 64, sm: 88 },
                      height: { xs: 64, sm: 88 },
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
                      onChange={(event) => update(index, { title: event.target.value })}
                      sx={{ mb: 1 }}
                    />
                    <TextField
                      label="Descrição"
                      fullWidth
                      size="small"
                      value={image.description}
                      onChange={(event) => update(index, { description: event.target.value })}
                    />
                  </Box>
                  <Tooltip title="Remover">
                    <IconButton
                      color="error"
                      aria-label={`Remover ${image.title}`}
                      onClick={() => {
                        release([image]);
                        setImages((previous) => previous.filter((_, i) => i !== index));
                      }}
                      sx={{ width: 44, height: 44 }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Paper>
            ))}
          </Stack>
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
            // Mantém as URLs: agora pertencem à seção.
            images.forEach((image) => discardable.current.delete(image.url));
            setImages([]);
            setRejected([]);
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
