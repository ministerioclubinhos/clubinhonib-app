import { useEffect, useState } from 'react';
import { Box, ButtonBase, Skeleton, Typography } from '@mui/material';
import BrokenImageOutlinedIcon from '@mui/icons-material/BrokenImageOutlined';
import OpenInFullRoundedIcon from '@mui/icons-material/OpenInFullRounded';

import { FEED_PALETTE, FEED_TOUCH_TARGET_PX } from '../constants';
import type { FeedMediaFrameProps } from '../types';

export function FeedMediaFrame({
  src,
  alt,
  ariaLabel,
  testId,
  ambientBackdrop = false,
  aspectRatio,
  minHeight,
  maxHeight,
  badgeText,
  moreCountOverlay,
  onClick,
}: FeedMediaFrameProps) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setLoaded(false);
    setFailed(false);
  }, [src]);

  const showFallback = !src || failed;

  return (
    <ButtonBase
      data-testid={testId}
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      sx={{
        position: 'relative',
        display: 'block',
        width: '100%',
        height: '100%',
        minWidth: FEED_TOUCH_TARGET_PX,
        minHeight: minHeight ?? FEED_TOUCH_TARGET_PX,
        maxHeight,
        aspectRatio,
        p: 0,
        m: 0,
        border: 0,
        borderRadius: 2,
        overflow: 'hidden',
        textAlign: 'left',
        bgcolor: FEED_PALETTE.canvasSubtle,
        '&:hover': {
          bgcolor: FEED_PALETTE.canvasSubtle,
          '& .feed-media-zoom': {
            transform: 'scale(1.04)',
          },
          '& .feed-media-expand-pill': {
            opacity: 1,
            transform: 'translateY(0)',
          },
        },
        '&:focus-visible': {
          outline: `3px solid ${FEED_PALETTE.brandLeaf}`,
          outlineOffset: '2px',
        },
      }}
    >
      {!loaded && !showFallback && (
        <Skeleton
          variant="rectangular"
          animation="wave"
          sx={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            bgcolor: FEED_PALETTE.canvasSubtle,
          }}
        />
      )}

      {showFallback ? (
        <Box
          sx={{
            width: '100%',
            height: '100%',
            minHeight: minHeight ?? 180,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            px: 2,
            py: 3,
            color: FEED_PALETTE.inkMuted,
            bgcolor: FEED_PALETTE.canvasSubtle,
          }}
        >
          <BrokenImageOutlinedIcon sx={{ fontSize: 32, opacity: 0.7 }} />
          <Typography
            variant="caption"
            sx={{ fontWeight: 600, color: FEED_PALETTE.inkSecondary, textAlign: 'center' }}
          >
            Imagem indisponível
          </Typography>
        </Box>
      ) : ambientBackdrop ? (
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            minHeight: minHeight ?? { xs: 220, sm: 320, md: 360 },
            maxHeight: maxHeight ?? { xs: 360, sm: 420, md: 460 },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <Box
            component="img"
            src={src}
            alt=""
            aria-hidden="true"
            sx={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: 'blur(26px) saturate(1.25) brightness(0.55)',
              transform: 'scale(1.14)',
              opacity: loaded ? 0.95 : 0,
              transition: 'opacity 0.35s ease',
              pointerEvents: 'none',
            }}
          />
          <Box
            component="img"
            className="feed-media-zoom"
            src={src}
            alt={alt}
            loading="lazy"
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
            sx={{
              position: 'relative',
              zIndex: 1,
              width: '100%',
              maxHeight: maxHeight ?? { xs: 360, sm: 420, md: 460 },
              objectFit: 'contain',
              display: 'block',
              opacity: loaded ? 1 : 0,
              transition: 'transform 0.45s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.3s ease',
            }}
          />
        </Box>
      ) : (
        <Box
          component="img"
          className="feed-media-zoom"
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            opacity: loaded ? 1 : 0,
            transition: 'transform 0.45s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.3s ease',
          }}
        />
      )}

      {badgeText && (
        <Box
          sx={{
            position: 'absolute',
            top: 10,
            left: 10,
            zIndex: 2,
            px: 1.25,
            py: 0.4,
            borderRadius: 99,
            bgcolor: 'rgba(11, 36, 22, 0.72)',
            backdropFilter: 'blur(8px)',
            color: '#ffffff',
            fontSize: '0.72rem',
            fontWeight: 700,
            letterSpacing: '0.02em',
            pointerEvents: 'none',
          }}
        >
          {badgeText}
        </Box>
      )}

      {typeof moreCountOverlay === 'number' && moreCountOverlay > 0 ? (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: 3,
            bgcolor: 'rgba(11, 36, 22, 0.66)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            gap: 0.25,
            p: 1,
          }}
        >
          <Typography
            component="span"
            sx={{
              fontSize: { xs: '1.35rem', sm: '1.65rem' },
              fontWeight: 800,
              lineHeight: 1.1,
              color: '#ffffff',
            }}
          >
            +{moreCountOverlay}
          </Typography>
          <Typography
            component="span"
            sx={{
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'rgba(255, 255, 255, 0.9)',
            }}
          >
            ver álbum
          </Typography>
        </Box>
      ) : (
        !showFallback && (
          <Box
            className="feed-media-expand-pill"
            sx={{
              position: 'absolute',
              right: 10,
              bottom: 10,
              zIndex: 2,
              width: 32,
              height: 32,
              borderRadius: '50%',
              bgcolor: 'rgba(11, 36, 22, 0.65)',
              backdropFilter: 'blur(6px)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: { xs: 0.88, md: 0 },
              transform: { xs: 'none', md: 'translateY(4px)' },
              transition: 'opacity 0.22s ease, transform 0.22s ease',
              pointerEvents: 'none',
            }}
          >
            <OpenInFullRoundedIcon sx={{ fontSize: 16 }} />
          </Box>
        )
      )}
    </ButtonBase>
  );
}
