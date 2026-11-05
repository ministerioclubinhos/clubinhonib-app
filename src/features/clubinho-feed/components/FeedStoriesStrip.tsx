import { Box, ButtonBase, Stack, Typography } from '@mui/material';
import AutoStoriesOutlinedIcon from '@mui/icons-material/AutoStoriesOutlined';

import {
  FEED_MAX_STORY_HIGHLIGHTS,
  FEED_PALETTE,
  FEED_TEST_IDS,
} from '../constants';
import type { FeedStoriesStripProps } from '../types';

export function FeedStoriesStrip({
  sections,
  viewedStoryIds,
  onSelectStory,
}: FeedStoriesStripProps) {
  const storyItems = sections
    .filter((section) => Boolean(section.coverUrl))
    .slice(0, FEED_MAX_STORY_HIGHLIGHTS);

  if (storyItems.length === 0) {
    return <Box data-testid={FEED_TEST_IDS.STORIES_STRIP} sx={{ display: 'none' }} />;
  }

  return (
    <Box
      data-testid={FEED_TEST_IDS.STORIES_STRIP}
      component="section"
      aria-label="Destaques rápidos dos Clubinhos"
      sx={{
        py: { xs: 2, sm: 2.5 },
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 1.25 }}
      >
        <Stack direction="row" alignItems="center" spacing={0.85}>
          <AutoStoriesOutlinedIcon sx={{ fontSize: 18, color: FEED_PALETTE.brandLeafDark }} />
          <Typography
            component="h2"
            sx={{
              fontSize: '0.82rem',
              fontWeight: 800,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: FEED_PALETTE.inkSecondary,
            }}
          >
            Momentos em destaque
          </Typography>
        </Stack>
        <Typography variant="caption" sx={{ color: FEED_PALETTE.inkMuted, fontWeight: 500 }}>
          Toque para abrir em tela cheia
        </Typography>
      </Stack>

      <Box
        sx={{
          display: 'flex',
          gap: { xs: 1.5, sm: 2 },
          overflowX: 'auto',
          pb: 0.75,
          pt: 0.25,
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': { height: 5 },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: 'rgba(19, 60, 36, 0.18)',
            borderRadius: 99,
          },
        }}
      >
        {storyItems.map((item) => {
          const isViewed = viewedStoryIds.has(item.id);
          return (
            <ButtonBase
              key={item.id}
              data-testid={`${FEED_TEST_IDS.STORY_ITEM_PREFIX}-${item.id}`}
              type="button"
              onClick={() => onSelectStory(item)}
              aria-label={`Ver destaque de ${item.caption} (${item.mediaCount} fotos)`}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: { xs: 84, sm: 92 },
                flexShrink: 0,
                p: 0.5,
                borderRadius: 3.5,
                bgcolor: 'transparent',
                transition: 'transform 0.2s ease',
                '&:hover': {
                  bgcolor: 'rgba(129, 215, 66, 0.08)',
                  transform: 'translateY(-2px)',
                },
                '&:focus-visible': {
                  outline: `3px solid ${FEED_PALETTE.brandLeaf}`,
                  outlineOffset: '2px',
                },
              }}
            >
              <Box
                sx={{
                  position: 'relative',
                  p: '3px',
                  borderRadius: '22px',
                  background: isViewed
                    ? FEED_PALETTE.storyRingViewed
                    : FEED_PALETTE.storyRingActive,
                  mb: 0.75,
                  boxShadow: isViewed
                    ? 'none'
                    : '0 8px 18px rgba(245, 158, 11, 0.22)',
                }}
              >
                <Box
                  sx={{
                    width: { xs: 66, sm: 72 },
                    height: { xs: 66, sm: 72 },
                    borderRadius: '19px',
                    overflow: 'hidden',
                    border: '2.5px solid #ffffff',
                    bgcolor: '#e4ece0',
                  }}
                >
                  <Box
                    component="img"
                    src={item.coverUrl}
                    alt=""
                    loading="lazy"
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                </Box>

                <Box
                  sx={{
                    position: 'absolute',
                    bottom: -4,
                    right: -4,
                    px: 0.8,
                    minWidth: 22,
                    height: 20,
                    borderRadius: 99,
                    bgcolor: FEED_PALETTE.brandForest,
                    color: '#ffffff',
                    border: '2px solid #ffffff',
                    fontSize: '0.66rem',
                    fontWeight: 800,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {item.mediaCount}
                </Box>
              </Box>

              <Typography
                sx={{
                  width: '100%',
                  fontSize: '0.73rem',
                  fontWeight: isViewed ? 600 : 700,
                  color: isViewed ? FEED_PALETTE.inkMuted : FEED_PALETTE.inkPrimary,
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  lineHeight: 1.25,
                }}
              >
                {item.clubBadge === 'Comunidade NIB' ? item.caption : item.clubBadge}
              </Typography>
              <Typography
                sx={{
                  width: '100%',
                  fontSize: '0.66rem',
                  color: FEED_PALETTE.inkMuted,
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {item.relativeDate}
              </Typography>
            </ButtonBase>
          );
        })}
      </Box>
    </Box>
  );
}
