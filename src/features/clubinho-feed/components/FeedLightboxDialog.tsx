import { MediaType } from '@/store/slices/types';
import { ClubinhoVideoPlayer } from '@/features/image-sections';
import { PhotoCommentsPanel } from '@/features/feed-photo-comments';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { TouchEvent } from 'react';
import { Box, ButtonBase, Dialog, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import BrokenImageOutlinedIcon from '@mui/icons-material/BrokenImageOutlined';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';

import {
  FEED_LIGHTBOX_SWIPE_THRESHOLD_PX,
  FEED_PALETTE,
  FEED_TEST_IDS,
  FEED_TOUCH_TARGET_PX,
} from '../constants';
import type { FeedLightboxDialogProps } from '../types';

export function FeedLightboxDialog({ activeState, onClose }: FeedLightboxDialogProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageFailed, setImageFailed] = useState(false);
  const touchStartXRef = useRef<number | null>(null);
  const activeThumbRef = useRef<HTMLButtonElement | null>(null);

  const open = Boolean(activeState);
  const section = activeState?.section ?? null;
  const mediaItems = section?.mediaItems ?? [];
  const mediaCount = mediaItems.length;

  useEffect(() => {
    if (!activeState) return;
    const bounded = Math.min(
      Math.max(activeState.initialIndex, 0),
      Math.max(activeState.section.mediaItems.length - 1, 0)
    );
    setCurrentIndex(bounded);
    setImageFailed(false);
  }, [activeState]);

  useEffect(() => {
    setImageFailed(false);
    activeThumbRef.current?.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    });
  }, [currentIndex]);

  const handlePrev = useCallback(() => {
    if (mediaCount <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + mediaCount) % mediaCount);
  }, [mediaCount]);

  const handleNext = useCallback(() => {
    if (mediaCount <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % mediaCount);
  }, [mediaCount]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.target instanceof HTMLElement &&
        event.target.closest('input, textarea, [contenteditable="true"], [role="tablist"], video')
      )
        return;
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        handlePrev();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, handlePrev, handleNext]);

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    if (event.touches.length !== 1) {
      touchStartXRef.current = null;
      return;
    }
    touchStartXRef.current = event.touches[0].clientX;
  };

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (touchStartXRef.current === null || event.changedTouches.length !== 1) return;
    const deltaX = event.changedTouches[0].clientX - touchStartXRef.current;
    touchStartXRef.current = null;

    if (Math.abs(deltaX) < FEED_LIGHTBOX_SWIPE_THRESHOLD_PX) return;
    if (deltaX > 0) {
      handlePrev();
    } else {
      handleNext();
    }
  };

  const currentMedia = mediaItems[currentIndex] ?? null;

  return (
    <Dialog
      data-testid={FEED_TEST_IDS.LIGHTBOX_DIALOG}
      open={open}
      onClose={onClose}
      fullScreen
      aria-labelledby="clubinho-feed-lightbox-title"
      PaperProps={{
        sx: {
          bgcolor: FEED_PALETTE.lightboxBackdrop,
          color: '#ffffff',
          backgroundImage: 'none',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        },
      }}
    >
      {section && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100dvh',
            width: '100%',
          }}
        >
          {/* Barra superior do cinema */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={2}
            sx={{
              px: { xs: 2, sm: 3 },
              py: 1.5,
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              bgcolor: 'rgba(5, 11, 8, 0.72)',
              backdropFilter: 'blur(12px)',
              flexShrink: 0,
            }}
          >
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.25 }}>
                <Typography
                  component="span"
                  sx={{
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: FEED_PALETTE.brandLeaf,
                  }}
                >
                  {section.authorName} · {section.clubBadge}
                </Typography>
                {mediaCount > 0 && (
                  <Typography
                    component="span"
                    sx={{
                      px: 1,
                      py: 0.15,
                      borderRadius: 99,
                      bgcolor: 'rgba(255, 255, 255, 0.14)',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: '#ffffff',
                    }}
                  >
                    {currentIndex + 1} / {mediaCount}
                  </Typography>
                )}
              </Stack>

              <Typography
                id="clubinho-feed-lightbox-title"
                component="h2"
                sx={{
                  fontSize: { xs: '0.98rem', sm: '1.15rem' },
                  fontWeight: 700,
                  color: '#ffffff',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {section.caption}
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} alignItems="center">
              {currentMedia?.originalUrl && (
                <Tooltip title="Abrir arquivo original em nova aba">
                  <IconButton
                    component="a"
                    href={currentMedia.originalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Abrir arquivo original em nova aba"
                    sx={{
                      width: FEED_TOUCH_TARGET_PX,
                      height: FEED_TOUCH_TARGET_PX,
                      color: '#ffffff',
                      bgcolor: 'rgba(255, 255, 255, 0.1)',
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.2)',
                      },
                    }}
                  >
                    <OpenInNewRoundedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}

              <Tooltip title="Fechar visualização (Esc)">
                <IconButton
                  data-testid={FEED_TEST_IDS.LIGHTBOX_CLOSE}
                  type="button"
                  onClick={onClose}
                  aria-label="Fechar visualização em tela cheia"
                  sx={{
                    width: FEED_TOUCH_TARGET_PX,
                    height: FEED_TOUCH_TARGET_PX,
                    color: '#ffffff',
                    bgcolor: 'rgba(255, 255, 255, 0.14)',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.26)',
                    },
                  }}
                >
                  <CloseRoundedIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>

          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              flex: 1,
              minHeight: 0,
              overflowY: { xs: 'auto', md: 'hidden' },
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                minWidth: 0,
                minHeight: 0,
                height: { xs: '45dvh', md: '100%' },
                flex: { xs: '0 0 auto', md: 1 },
              }}
            >
              {/* Palco central da fotografia */}
              <Box
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                sx={{
                  position: 'relative',
                  flex: 1,
                  minHeight: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  px: { xs: 1.5, sm: 7, md: 9 },
                  py: { xs: 1.5, sm: 2.5 },
                  userSelect: 'none',
                }}
              >
                {mediaCount > 1 && (
                  <IconButton
                    data-testid={FEED_TEST_IDS.LIGHTBOX_PREV}
                    type="button"
                    onClick={handlePrev}
                    aria-label="Foto anterior"
                    sx={{
                      position: 'absolute',
                      left: { xs: 8, sm: 18 },
                      top: '50%',
                      transform: 'translateY(-50%)',
                      zIndex: 4,
                      width: 48,
                      height: 48,
                      color: '#ffffff',
                      bgcolor: 'rgba(15, 31, 21, 0.72)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(8px)',
                      '&:hover': {
                        bgcolor: 'rgba(129, 215, 66, 0.35)',
                      },
                    }}
                  >
                    <ChevronLeftRoundedIcon sx={{ fontSize: 30 }} />
                  </IconButton>
                )}

                {currentMedia?.mediaType === MediaType.VIDEO ? (
                  <ClubinhoVideoPlayer
                    key={currentMedia.key}
                    src={currentMedia.originalUrl}
                    title={currentMedia.title}
                  />
                ) : currentMedia && !imageFailed ? (
                  <Box
                    key={currentMedia.key}
                    data-testid={FEED_TEST_IDS.LIGHTBOX_IMAGE}
                    component="img"
                    src={currentMedia.previewUrl}
                    alt={currentMedia.title}
                    onError={() => setImageFailed(true)}
                    sx={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain',
                      borderRadius: 2,
                      boxShadow: '0 24px 64px rgba(0, 0, 0, 0.65)',
                    }}
                  />
                ) : (
                  <Stack
                    alignItems="center"
                    spacing={1.5}
                    sx={{ color: 'rgba(255, 255, 255, 0.72)', p: 3, textAlign: 'center' }}
                  >
                    <BrokenImageOutlinedIcon sx={{ fontSize: 44 }} />
                    <Typography sx={{ color: '#ffffff', fontWeight: 600 }}>
                      Não foi possível exibir esta imagem
                    </Typography>
                  </Stack>
                )}

                {mediaCount > 1 && (
                  <IconButton
                    data-testid={FEED_TEST_IDS.LIGHTBOX_NEXT}
                    type="button"
                    onClick={handleNext}
                    aria-label="Próxima foto"
                    sx={{
                      position: 'absolute',
                      right: { xs: 8, sm: 18 },
                      top: '50%',
                      transform: 'translateY(-50%)',
                      zIndex: 4,
                      width: 48,
                      height: 48,
                      color: '#ffffff',
                      bgcolor: 'rgba(15, 31, 21, 0.72)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(8px)',
                      '&:hover': {
                        bgcolor: 'rgba(129, 215, 66, 0.35)',
                      },
                    }}
                  >
                    <ChevronRightRoundedIcon sx={{ fontSize: 30 }} />
                  </IconButton>
                )}
              </Box>

              {/* Doca inferior: relato + tira cinematográfica de miniaturas */}
              <Box
                sx={{
                  px: { xs: 2, sm: 3 },
                  pt: 1.5,
                  pb: 'calc(14px + env(safe-area-inset-bottom, 0px))',
                  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                  bgcolor: 'rgba(5, 11, 8, 0.84)',
                  backdropFilter: 'blur(12px)',
                  flexShrink: 0,
                }}
              >
                {section.description && (
                  <Typography
                    sx={{
                      maxWidth: 880,
                      mx: 'auto',
                      mb: mediaCount > 1 ? 1.5 : 0.25,
                      fontSize: { xs: '0.84rem', sm: '0.92rem' },
                      lineHeight: 1.5,
                      color: 'rgba(255, 255, 255, 0.86)',
                      textAlign: 'center',
                      maxHeight: { xs: 64, sm: 80 },
                      overflowY: 'auto',
                    }}
                  >
                    {section.description}
                  </Typography>
                )}

                {mediaCount > 1 && (
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: { xs: 'flex-start', sm: 'center' },
                      gap: 1,
                      overflowX: 'auto',
                      py: 0.5,
                      scrollbarWidth: 'thin',
                    }}
                  >
                    {mediaItems.map((media, idx) => {
                      const isActive = idx === currentIndex;
                      return (
                        <ButtonBase
                          key={media.key}
                          ref={isActive ? activeThumbRef : null}
                          data-testid={`${FEED_TEST_IDS.LIGHTBOX_THUMB_PREFIX}-${media.key}`}
                          type="button"
                          onClick={() => setCurrentIndex(idx)}
                          aria-label={`Selecionar foto ${idx + 1} de ${mediaCount}`}
                          aria-current={isActive ? 'true' : undefined}
                          sx={{
                            width: 56,
                            height: 56,
                            minWidth: FEED_TOUCH_TARGET_PX,
                            minHeight: FEED_TOUCH_TARGET_PX,
                            borderRadius: 2,
                            overflow: 'hidden',
                            flexShrink: 0,
                            p: 0,
                            bgcolor: '#17291e',
                            border: isActive
                              ? `2.5px solid ${FEED_PALETTE.brandLeaf}`
                              : '2px solid rgba(255, 255, 255, 0.18)',
                            opacity: isActive ? 1 : 0.62,
                            transform: isActive ? 'scale(1.05)' : 'scale(1)',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              bgcolor: '#17291e',
                              opacity: 1,
                            },
                          }}
                        >
                          <Box
                            component="img"
                            src={media.previewUrl}
                            alt=""
                            loading="lazy"
                            sx={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              display: 'block',
                            }}
                          />
                        </ButtonBase>
                      );
                    })}
                  </Box>
                )}
              </Box>
            </Box>
            {currentMedia?.mediaType !== MediaType.VIDEO && (
              <Box sx={{ width: { xs: '100%', md: 360 }, flexShrink: 0, minHeight: 0 }}>
                <PhotoCommentsPanel mediaId={currentMedia?.id} />
              </Box>
            )}
          </Box>
        </Box>
      )}
    </Dialog>
  );
}
