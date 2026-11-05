import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import { Avatar, Box, Button, ButtonBase, Divider, Paper, Stack, Typography } from '@mui/material';
import AddAPhotoRoundedIcon from '@mui/icons-material/AddAPhotoRounded';
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded';
import NewspaperRoundedIcon from '@mui/icons-material/NewspaperRounded';

import { FEED_PALETTE, FEED_TEST_IDS, FEED_TOUCH_TARGET_PX } from '../constants';
import type { FeedTimelineRailProps } from '../types';

export function FeedTimelineRail({
  sections,
  activeSectionId,
  canUploadPhotos,
  onJumpToSection,
  onNavigateUpload,
  onScrollTop,
}: FeedTimelineRailProps) {
  return (
    <Box
      data-testid={FEED_TEST_IDS.TIMELINE_RAIL}
      component="aside"
      aria-label="Publicações recentes"
      sx={{ display: { xs: 'none', md: 'block' }, position: 'sticky', top: 88, alignSelf: 'start' }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          borderRadius: 3,
          border: `1px solid ${FEED_PALETTE.borderSubtle}`,
          bgcolor: FEED_PALETTE.canvasElevated,
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <NewspaperRoundedIcon sx={{ color: FEED_PALETTE.brandLeafDark, fontSize: 20 }} />
          <Typography
            component="h2"
            sx={{ fontSize: '0.95rem', fontWeight: 700, color: FEED_PALETTE.inkPrimary }}
          >
            Últimas publicações
          </Typography>
        </Stack>
        <Stack spacing={0.5} sx={{ maxHeight: 460, overflowY: 'auto', scrollbarWidth: 'thin' }}>
          {sections.map((section) => (
            <ButtonBase
              key={section.id}
              data-testid={`clubinho-feed-recent-post-${section.id}`}
              type="button"
              onClick={() => onJumpToSection(section)}
              aria-label={`Ir para publicação: ${section.caption}`}
              aria-current={activeSectionId === section.id ? 'location' : undefined}
              sx={{
                p: 1,
                minHeight: FEED_TOUCH_TARGET_PX,
                width: '100%',
                gap: 1.25,
                borderRadius: 2,
                textAlign: 'left',
                justifyContent: 'flex-start',
                alignItems: 'center',
                bgcolor: activeSectionId === section.id ? FEED_PALETTE.brandSoft : 'transparent',
                '&:hover': { bgcolor: FEED_PALETTE.canvasSubtle },
                '&:focus-visible': { outline: `2px solid ${FEED_PALETTE.link}`, outlineOffset: -2 },
              }}
            >
              <Avatar
                variant="rounded"
                src={!section.isVideo ? section.coverUrl || undefined : undefined}
                alt=""
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: 1.5,
                  bgcolor: FEED_PALETTE.canvasSubtle,
                  color: FEED_PALETTE.inkMuted,
                  fontSize: '0.85rem',
                }}
              >
                {section.isVideo ? <VideocamOutlinedIcon /> : section.monogram}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  sx={{
                    color: FEED_PALETTE.inkPrimary,
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    lineHeight: 1.45,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    overflowWrap: 'anywhere',
                  }}
                >
                  {section.caption}
                </Typography>
                <Typography sx={{ fontSize: '0.7rem', color: FEED_PALETTE.inkMuted, mt: 0.5 }}>
                  {section.relativeDate}
                </Typography>
              </Box>
            </ButtonBase>
          ))}
        </Stack>
        <Divider sx={{ my: 2, borderColor: FEED_PALETTE.borderSubtle }} />
        <Typography sx={{ color: FEED_PALETTE.inkSecondary, fontSize: '0.8rem', lineHeight: 1.7 }}>
          Cada encontro, uma nova história. Acompanhe o que acontece nos Clubinhos NIB.
        </Typography>
        {canUploadPhotos && (
          <Button
            data-testid="clubinho-feed-sidebar-upload"
            type="button"
            fullWidth
            onClick={onNavigateUpload}
            startIcon={<AddAPhotoRoundedIcon />}
            sx={{
              minHeight: FEED_TOUCH_TARGET_PX,
              mt: 2,
              textTransform: 'none',
              fontWeight: 700,
              color: FEED_PALETTE.brandLeafDark,
              bgcolor: FEED_PALETTE.brandSoft,
              borderRadius: 2,
            }}
          >
            Enviar fotos ou vídeo do Clubinho
          </Button>
        )}
      </Paper>
      <Button
        data-testid="clubinho-feed-back-to-top"
        type="button"
        fullWidth
        onClick={onScrollTop}
        startIcon={<KeyboardArrowUpRoundedIcon />}
        sx={{
          mt: 1,
          minHeight: FEED_TOUCH_TARGET_PX,
          textTransform: 'none',
          color: FEED_PALETTE.inkMuted,
          fontSize: '0.8rem',
        }}
      >
        Voltar ao topo
      </Button>
    </Box>
  );
}
