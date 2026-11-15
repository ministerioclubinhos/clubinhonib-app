import { Box, IconButton, Paper, Stack, Tooltip, Typography } from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';

import type { MediaItem } from '@/store/slices/types';

import { imageLabelOf, imageThumbnailUrl } from '../utils';

interface ImageThumbCardProps {
  media: MediaItem;
  mediaIndex: number;
  sectionIndex: number;
  onView: () => void;
  onEdit: () => void;
  onRemove: () => void;
}

/**
 * Foto da seção: miniatura quadrada que abre no visualizador, título e as
 * ações de editar e remover, com alvos de toque de 44 px.
 */
export default function ImageThumbCard({
  media,
  mediaIndex,
  sectionIndex,
  onView,
  onEdit,
  onRemove,
}: ImageThumbCardProps) {
  const label = imageLabelOf(media, mediaIndex);
  const where = `imagem ${mediaIndex + 1} da seção ${sectionIndex + 1}`;

  return (
    <Paper
      data-testid="image-pages-image-card"
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
        component="button"
        type="button"
        onClick={onView}
        aria-label={`Ampliar ${where}: ${label}`}
        sx={{
          p: 0,
          border: 0,
          display: 'block',
          cursor: 'zoom-in',
          bgcolor: 'action.hover',
          '&:focus-visible': {
            outline: '3px solid',
            outlineColor: 'primary.main',
            outlineOffset: -3,
          },
        }}
      >
        <Box
          component="img"
          src={imageThumbnailUrl(media)}
          alt={label}
          loading="lazy"
          sx={{ width: '100%', aspectRatio: '1 / 1', objectFit: 'cover', display: 'block' }}
        />
      </Box>
      <Stack
        direction="row"
        alignItems="center"
        sx={{ pl: 1, borderTop: 1, borderColor: 'divider', minHeight: 44 }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="caption" noWrap component="p" sx={{ fontWeight: 600 }}>
            {label}
          </Typography>
          {media.description && (
            <Typography variant="caption" color="text.secondary" noWrap component="p">
              {media.description}
            </Typography>
          )}
        </Box>
        <Tooltip title="Editar">
          <IconButton
            aria-label={`Editar ${where}`}
            onClick={onEdit}
            sx={{ width: 44, height: 44 }}
          >
            <Edit fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Remover">
          <IconButton
            color="error"
            aria-label={`Remover ${where}`}
            onClick={onRemove}
            sx={{ width: 44, height: 44 }}
          >
            <Delete fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>
    </Paper>
  );
}
