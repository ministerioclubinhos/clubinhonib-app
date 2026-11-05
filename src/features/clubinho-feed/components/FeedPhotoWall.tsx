import { Box, Paper, Typography } from '@mui/material';
import PhotoLibraryOutlinedIcon from '@mui/icons-material/PhotoLibraryOutlined';

import { FEED_PALETTE, FEED_TEST_IDS } from '../constants';
import type { FeedPhotoWallProps } from '../types';
import { FeedMediaFrame } from './FeedMediaFrame';

export function FeedPhotoWall({ photos, onSelectPhoto }: FeedPhotoWallProps) {
  if (photos.length === 0) {
    return (
      <Paper
        data-testid={FEED_TEST_IDS.PHOTO_WALL}
        elevation={0}
        sx={{
          p: { xs: 4, sm: 6 },
          textAlign: 'center',
          borderRadius: 4,
          bgcolor: FEED_PALETTE.canvasElevated,
          border: `1px dashed ${FEED_PALETTE.borderStrong}`,
        }}
      >
        <PhotoLibraryOutlinedIcon
          sx={{ fontSize: 40, color: FEED_PALETTE.inkMuted, mb: 1 }}
        />
        <Typography sx={{ fontWeight: 700, color: FEED_PALETTE.inkPrimary, mb: 0.5 }}>
          Nenhuma fotografia disponível nesta seleção
        </Typography>
        <Typography variant="body2" sx={{ color: FEED_PALETTE.inkMuted }}>
          As fotos das publicações aparecerão reunidas aqui para navegação rápida.
        </Typography>
      </Paper>
    );
  }

  return (
    <Box
      data-testid={FEED_TEST_IDS.PHOTO_WALL}
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: 'repeat(2, 1fr)',
          sm: 'repeat(3, 1fr)',
          md: 'repeat(4, 1fr)',
        },
        gap: { xs: 1.25, sm: 1.75, md: 2 },
      }}
    >
      {photos.map((photo) => (
        <Box
          key={photo.key}
          sx={{
            position: 'relative',
            borderRadius: 3.5,
            overflow: 'hidden',
            bgcolor: FEED_PALETTE.canvasElevated,
            border: `1px solid ${FEED_PALETTE.borderSubtle}`,
            boxShadow: '0 8px 22px -10px rgba(11, 36, 22, 0.12)',
          }}
        >
          <FeedMediaFrame
            src={photo.previewUrl}
            alt={photo.altText}
            ariaLabel={`Abrir foto ${photo.mediaIndex + 1} de ${photo.sectionCaption}`}
            testId={`${FEED_TEST_IDS.PHOTO_WALL_ITEM_PREFIX}-${photo.key}`}
            aspectRatio="1 / 1.05"
            minHeight={{ xs: 150, sm: 200, md: 230 }}
            badgeText={photo.clubBadge}
            onClick={() => onSelectPhoto(photo)}
          />
          <Box
            sx={{
              px: 1.5,
              py: 1.1,
              bgcolor: '#ffffff',
              borderTop: `1px solid ${FEED_PALETTE.borderSubtle}`,
            }}
          >
            <Typography
              sx={{
                fontSize: '0.8rem',
                fontWeight: 700,
                color: FEED_PALETTE.inkPrimary,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {photo.sectionCaption}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                color: FEED_PALETTE.inkMuted,
                fontSize: '0.7rem',
              }}
            >
              {photo.formattedDate} · Foto {photo.mediaIndex + 1}/{photo.totalInSection}
            </Typography>
          </Box>
        </Box>
      ))}
    </Box>
  );
}
