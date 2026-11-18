import { Box, Chip, IconButton, Paper, Stack, Tooltip, Typography } from '@mui/material';
import {
  AudiotrackOutlined,
  Delete,
  DescriptionOutlined,
  Edit,
  ImageOutlined,
  MovieOutlined,
  Visibility,
} from '@mui/icons-material';

import { MediaItem, MediaType } from '@/store/slices/types';

import { MEDIA_PLATFORM_LABELS } from './constants';
import { formatMediaSize, isFileMedia, mediaExtensionLabel, mediaThumbnailUrl } from './utils';

interface MediaItemCardProps {
  item: MediaItem;
  editing: boolean;
  onView: () => void;
  onEdit: () => void;
  onRemove: () => void;
}

const TYPE_ICON = {
  [MediaType.IMAGE]: ImageOutlined,
  [MediaType.VIDEO]: MovieOutlined,
  [MediaType.AUDIO]: AudiotrackOutlined,
  [MediaType.DOCUMENT]: DescriptionOutlined,
} as const;

/**
 * Cartão compacto de um material: miniatura, título, descrição curta e ações.
 * A prévia completa abre no visualizador; a lista não carrega players inline.
 */
export default function MediaItemCard({
  item,
  editing,
  onView,
  onEdit,
  onRemove,
}: MediaItemCardProps) {
  const Icon = TYPE_ICON[item.mediaType] ?? DescriptionOutlined;
  const thumbnail = mediaThumbnailUrl(item);
  const showThumb = thumbnail !== null;
  const origin = isFileMedia(item)
    ? [mediaExtensionLabel(item), formatMediaSize(item.size ?? item.file?.size)]
        .filter(Boolean)
        .join(' · ') || 'Arquivo'
    : (item.platformType && MEDIA_PLATFORM_LABELS[item.platformType]) || 'Link';

  return (
    <Paper
      data-testid="media-item-card"
      variant="outlined"
      sx={{
        borderRadius: 2,
        overflow: 'hidden',
        borderColor: editing ? 'primary.main' : 'divider',
      }}
    >
      <Stack direction="row" spacing={1.5} sx={{ p: 1.5 }} alignItems="flex-start">
        <Box
          component={showThumb ? 'button' : 'div'}
          type={showThumb ? 'button' : undefined}
          onClick={showThumb ? onView : undefined}
          aria-label={showThumb ? `Visualizar prévia de ${item.title}` : undefined}
          sx={{
            width: 72,
            height: 72,
            flexShrink: 0,
            borderRadius: 1.5,
            overflow: 'hidden',
            border: 0,
            p: 0,
            bgcolor: 'action.hover',
            color: 'text.secondary',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: showThumb ? 'zoom-in' : 'default',
          }}
        >
          {showThumb ? (
            <Box
              component="img"
              src={thumbnail ?? undefined}
              alt=""
              loading="lazy"
              sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <Icon sx={{ fontSize: 32 }} />
          )}
        </Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="subtitle2" fontWeight={700} sx={{ overflowWrap: 'anywhere' }}>
            {item.title}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              overflowWrap: 'anywhere',
            }}
          >
            {item.description}
          </Typography>
          <Chip size="small" variant="outlined" label={origin} sx={{ mt: 0.75 }} />
        </Box>
      </Stack>
      <Stack
        direction="row"
        justifyContent="flex-end"
        spacing={0.5}
        sx={{
          px: 1,
          pb: 0.5,
          '& .MuiIconButton-root': { width: 44, height: 44 },
        }}
      >
        <Tooltip title="Visualizar">
          <IconButton color="primary" aria-label={`Visualizar ${item.title}`} onClick={onView}>
            <Visibility fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Editar">
          <IconButton aria-label={`Editar ${item.title}`} onClick={onEdit}>
            <Edit fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Remover">
          <IconButton color="error" aria-label={`Remover ${item.title}`} onClick={onRemove}>
            <Delete fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>
    </Paper>
  );
}
