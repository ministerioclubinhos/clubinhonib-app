import { useState } from 'react';
import { Box, Button } from '@mui/material';
import CollectionsOutlinedIcon from '@mui/icons-material/CollectionsOutlined';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';

import {
  FEED_COLLAGE_PREVIEW_LIMIT,
  FEED_PALETTE,
  FEED_TEST_IDS,
  FEED_TOUCH_TARGET_PX,
} from '../constants';
import {
  type AdaptiveMediaCollageProps,
  CollageLayoutKind,
} from '../types';
import { resolveCollageLayout } from '../utils';
import { FeedMediaFrame } from './FeedMediaFrame';

export function AdaptiveMediaCollage({
  sectionId,
  caption,
  mediaItems,
  onSelectMedia,
}: AdaptiveMediaCollageProps) {
  const [expandedAll, setExpandedAll] = useState(false);

  const total = mediaItems.length;
  const layout = resolveCollageLayout(total);
  const rootTestId = `${FEED_TEST_IDS.COLLAGE_PREFIX}-${sectionId}`;

  if (layout === CollageLayoutKind.EMPTY) {
    return <Box data-testid={rootTestId} sx={{ display: 'none' }} />;
  }

  const buildFrameLabel = (index: number) =>
    `Abrir foto ${index + 1} de ${total} da publicação ${caption}`;
  const buildFrameTestId = (index: number) =>
    `${FEED_TEST_IDS.MEDIA_FRAME_PREFIX}-${sectionId}-${index}`;

  if (layout === CollageLayoutKind.SINGLE) {
    const first = mediaItems[0];
    return (
      <Box data-testid={rootTestId}>
        <FeedMediaFrame
          src={first.previewUrl}
          alt={first.title}
          ariaLabel={buildFrameLabel(0)}
          testId={buildFrameTestId(0)}
          ambientBackdrop
          onClick={() => onSelectMedia(0)}
        />
      </Box>
    );
  }

  if (layout === CollageLayoutKind.DUAL) {
    return (
      <Box
        data-testid={rootTestId}
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr 1fr' },
          gap: { xs: 1, sm: 1.25 },
        }}
      >
        {mediaItems.slice(0, 2).map((item, idx) => (
          <FeedMediaFrame
            key={item.key}
            src={item.previewUrl}
            alt={item.title}
            ariaLabel={buildFrameLabel(idx)}
            testId={buildFrameTestId(idx)}
            aspectRatio="4 / 3.4"
            minHeight={{ xs: 165, sm: 250, md: 280 }}
            onClick={() => onSelectMedia(idx)}
          />
        ))}
      </Box>
    );
  }

  if (layout === CollageLayoutKind.TRIO) {
    return (
      <Box
        data-testid={rootTestId}
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr 1fr', sm: '1.35fr 1fr' },
          gridTemplateRows: { xs: '220px 140px', sm: '190px 190px', md: '210px 210px' },
          gap: { xs: 1, sm: 1.25 },
        }}
      >
        <Box
          sx={{
            gridColumn: { xs: '1 / span 2', sm: '1 / span 1' },
            gridRow: { xs: '1 / span 1', sm: '1 / span 2' },
            minHeight: 0,
          }}
        >
          <FeedMediaFrame
            src={mediaItems[0].previewUrl}
            alt={mediaItems[0].title}
            ariaLabel={buildFrameLabel(0)}
            testId={buildFrameTestId(0)}
            badgeText="Destaque"
            onClick={() => onSelectMedia(0)}
          />
        </Box>
        {mediaItems.slice(1, 3).map((item, offset) => {
          const idx = offset + 1;
          return (
            <Box key={item.key} sx={{ minHeight: 0 }}>
              <FeedMediaFrame
                src={item.previewUrl}
                alt={item.title}
                ariaLabel={buildFrameLabel(idx)}
                testId={buildFrameTestId(idx)}
                onClick={() => onSelectMedia(idx)}
              />
            </Box>
          );
        })}
      </Box>
    );
  }

  if (layout === CollageLayoutKind.QUAD) {
    return (
      <Box
        data-testid={rootTestId}
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: { xs: 1, sm: 1.25 },
        }}
      >
        {mediaItems.slice(0, 4).map((item, idx) => (
          <FeedMediaFrame
            key={item.key}
            src={item.previewUrl}
            alt={item.title}
            ariaLabel={buildFrameLabel(idx)}
            testId={buildFrameTestId(idx)}
            aspectRatio="16 / 11"
            minHeight={{ xs: 135, sm: 185, md: 205 }}
            onClick={() => onSelectMedia(idx)}
          />
        ))}
      </Box>
    );
  }

  // BENTO_FIVE_PLUS (5 ou mais fotos)
  const remainingCount = total - FEED_COLLAGE_PREVIEW_LIMIT;
  const extraItems = mediaItems.slice(FEED_COLLAGE_PREVIEW_LIMIT);

  return (
    <Box data-testid={rootTestId}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr 1fr', sm: '1.3fr 1fr 1fr' },
          gridTemplateRows: { xs: '220px 130px 130px', sm: '190px 190px', md: '210px 210px' },
          gap: { xs: 1, sm: 1.25 },
        }}
      >
        <Box
          sx={{
            gridColumn: { xs: '1 / span 2', sm: '1 / span 1' },
            gridRow: { xs: '1 / span 1', sm: '1 / span 2' },
            minHeight: 0,
          }}
        >
          <FeedMediaFrame
            src={mediaItems[0].previewUrl}
            alt={mediaItems[0].title}
            ariaLabel={buildFrameLabel(0)}
            testId={buildFrameTestId(0)}
            badgeText={`1 / ${total}`}
            onClick={() => onSelectMedia(0)}
          />
        </Box>

        {mediaItems.slice(1, FEED_COLLAGE_PREVIEW_LIMIT).map((item, offset) => {
          const idx = offset + 1;
          const isLastPreviewTile = idx === FEED_COLLAGE_PREVIEW_LIMIT - 1;
          const overlayCount = !expandedAll && isLastPreviewTile ? remainingCount : 0;

          return (
            <Box key={item.key} sx={{ minHeight: 0 }}>
              <FeedMediaFrame
                src={item.previewUrl}
                alt={item.title}
                ariaLabel={
                  overlayCount > 0
                    ? `Abrir foto ${idx + 1} e ver mais ${overlayCount} fotos de ${caption}`
                    : buildFrameLabel(idx)
                }
                testId={buildFrameTestId(idx)}
                moreCountOverlay={overlayCount}
                onClick={() => onSelectMedia(idx)}
              />
            </Box>
          );
        })}
      </Box>

      {remainingCount > 0 && (
        <Box sx={{ mt: 1.5 }}>
          {expandedAll && (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: 'repeat(3, 1fr)', sm: 'repeat(4, 1fr)' },
                gap: 1,
                mb: 1.5,
              }}
            >
              {extraItems.map((item, offset) => {
                const idx = FEED_COLLAGE_PREVIEW_LIMIT + offset;
                return (
                  <FeedMediaFrame
                    key={item.key}
                    src={item.previewUrl}
                    alt={item.title}
                    ariaLabel={buildFrameLabel(idx)}
                    testId={buildFrameTestId(idx)}
                    aspectRatio="1 / 1"
                    minHeight={{ xs: 92, sm: 120 }}
                    onClick={() => onSelectMedia(idx)}
                  />
                );
              })}
            </Box>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button
              type="button"
              size="small"
              variant="text"
              onClick={() => setExpandedAll((prev) => !prev)}
              startIcon={
                expandedAll ? <ExpandLessRoundedIcon /> : <CollectionsOutlinedIcon />
              }
              sx={{
                minHeight: FEED_TOUCH_TARGET_PX,
                px: 2,
                borderRadius: 99,
                textTransform: 'none',
                fontWeight: 700,
                color: FEED_PALETTE.brandForest,
                bgcolor: 'rgba(129, 215, 66, 0.12)',
                '&:hover': {
                  bgcolor: 'rgba(129, 215, 66, 0.22)',
                },
              }}
            >
              {expandedAll
                ? 'Recolher miniaturas extras'
                : `Expandir todas as ${total} fotos neste cartão`}
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
}
