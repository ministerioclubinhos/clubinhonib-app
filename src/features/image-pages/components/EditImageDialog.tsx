import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  useMediaQuery,
  useTheme,
} from '@mui/material';

import type { MediaItem } from '@/store/slices/types';

import { imageThumbnailUrl } from '../utils';

interface EditImageDialogProps {
  media: MediaItem | null;
  onClose: () => void;
  onSave: (media: MediaItem) => void;
}

/** Edita o título e a descrição de uma foto já adicionada à seção. */
export default function EditImageDialog({ media, onClose, onSave }: EditImageDialogProps) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    setTitle(media?.title ?? '');
    setDescription(media?.description ?? '');
  }, [media]);

  return (
    <Dialog
      data-testid="image-pages-edit-image-dialog"
      open={Boolean(media)}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      fullScreen={fullScreen}
    >
      <DialogTitle>Editar imagem</DialogTitle>
      <DialogContent dividers>
        {media && (
          <Stack spacing={2}>
            <Box
              component="img"
              src={imageThumbnailUrl(media)}
              alt={title || 'Imagem'}
              sx={{
                width: '100%',
                maxHeight: 240,
                objectFit: 'contain',
                bgcolor: 'action.hover',
                borderRadius: 1,
              }}
            />
            <TextField
              label="Título da imagem"
              fullWidth
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <TextField
              label="Descrição da imagem"
              fullWidth
              multiline
              minRows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Stack>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button type="button" onClick={onClose} sx={{ minHeight: 44 }}>
          Cancelar
        </Button>
        <Button
          type="button"
          variant="contained"
          onClick={() => media && onSave({ ...media, title: title.trim(), description })}
          sx={{ minHeight: 44, textTransform: 'none' }}
        >
          Salvar alterações
        </Button>
      </DialogActions>
    </Dialog>
  );
}
