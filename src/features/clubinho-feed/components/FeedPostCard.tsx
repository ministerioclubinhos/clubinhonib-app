import { useRef } from 'react';
import { ClubinhoVideoPlayer } from '@/features/image-sections';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import { Avatar, Box, Button, Chip, Paper, Stack, Tooltip, Typography } from '@mui/material';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CollectionsOutlinedIcon from '@mui/icons-material/CollectionsOutlined';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import IosShareRoundedIcon from '@mui/icons-material/IosShareRounded';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

import { FEED_PALETTE, FEED_TEST_IDS, FEED_TOUCH_TARGET_PX } from '../constants';
import type { FeedPostCardProps } from '../types';
import { formatCountLabel } from '../utils';
import { AdaptiveMediaCollage } from './AdaptiveMediaCollage';

export function FeedPostCard({
  section,
  isCelebrated,
  isCopied,
  onToggleCelebrate,
  onShare,
  onOpenLightbox,
}: FeedPostCardProps) {
  const mediaRef = useRef<HTMLDivElement>(null);
  const openMedia = (index: number) => {
    mediaRef.current?.querySelector('video')?.pause();
    onOpenLightbox(section, index);
  };
  return (
    <Paper
      data-testid={`${FEED_TEST_IDS.POST_CARD_PREFIX}-${section.id}`}
      id={section.anchorId}
      component="article"
      elevation={0}
      sx={{
        borderRadius: 3,
        bgcolor: FEED_PALETTE.canvasElevated,
        border: `1px solid ${FEED_PALETTE.borderSubtle}`,
        boxShadow: FEED_PALETTE.cardShadow,
        scrollMarginTop: '88px',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ p: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 2.5 } }}>
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
          <Avatar
            aria-hidden="true"
            sx={{
              width: 44,
              height: 44,
              bgcolor: FEED_PALETTE.brandSoft,
              color: FEED_PALETTE.brandLeafDark,
              fontSize: '0.9rem',
              fontWeight: 800,
            }}
          >
            {section.monogram}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              sx={{ fontSize: '0.88rem', fontWeight: 700, color: FEED_PALETTE.inkPrimary }}
            >
              {section.authorName}
            </Typography>
            <Typography sx={{ fontSize: '0.76rem', color: FEED_PALETTE.inkMuted }}>
              {section.clubBadge} · {section.formattedDate}
              {section.formattedTime && ` · ${section.formattedTime}`}
            </Typography>
          </Box>
          {!section.isPublic && (
            <Chip
              icon={<LockOutlinedIcon />}
              label="Equipe"
              size="small"
              sx={{ bgcolor: FEED_PALETTE.canvasSubtle, color: FEED_PALETTE.inkSecondary }}
            />
          )}
        </Stack>
        <Typography
          component="h2"
          sx={{
            color: FEED_PALETTE.inkPrimary,
            fontSize: { xs: '1.2rem', sm: '1.4rem' },
            fontWeight: 750,
            lineHeight: 1.35,
            letterSpacing: '-0.02em',
            overflowWrap: 'anywhere',
          }}
        >
          {section.caption}
        </Typography>
        {section.description && (
          <Typography
            sx={{
              color: FEED_PALETTE.inkSecondary,
              fontSize: '0.94rem',
              lineHeight: 1.7,
              whiteSpace: 'pre-line',
              overflowWrap: 'anywhere',
              mt: 1,
            }}
          >
            {section.description}
          </Typography>
        )}
      </Box>
      {section.mediaCount > 0 && (
        <Box ref={mediaRef} sx={{ px: { xs: 1, sm: 1.5 } }}>
          {section.isVideo ? (
            <ClubinhoVideoPlayer src={section.mediaItems[0].originalUrl} title={section.caption} />
          ) : (
            <AdaptiveMediaCollage
              sectionId={section.id}
              caption={section.caption}
              mediaItems={section.mediaItems}
              onSelectMedia={openMedia}
            />
          )}
          <Button
            data-testid={`clubinho-feed-post-photos-${section.id}`}
            type="button"
            onClick={() => openMedia(0)}
            startIcon={
              section.isVideo ? (
                <VideocamOutlinedIcon />
              ) : (
                <CollectionsOutlinedIcon sx={{ fontSize: 17 }} />
              )
            }
            sx={{
              minHeight: FEED_TOUCH_TARGET_PX,
              px: 1.5,
              textTransform: 'none',
              color: FEED_PALETTE.inkSecondary,
              fontSize: '0.78rem',
            }}
          >
            {section.isVideo
              ? 'Vídeo · Abrir visualização'
              : `${formatCountLabel(section.mediaCount, 'foto', 'fotos')} · Ver álbum completo`}
          </Button>
        </Box>
      )}
      <Stack
        direction="row"
        spacing={1}
        flexWrap="wrap"
        useFlexGap
        sx={{ mx: { xs: 2, sm: 3 }, py: 1, borderTop: `1px solid ${FEED_PALETTE.borderSubtle}` }}
      >
        <Button
          data-testid={`clubinho-feed-post-celebrate-${section.id}`}
          type="button"
          onClick={() => onToggleCelebrate(section.id)}
          disabled={section.isOwnPublication}
          aria-pressed={isCelebrated}
          aria-label={section.isOwnPublication ? 'Você não pode celebrar sua própria publicação' : isCelebrated ? 'Remover celebração' : 'Celebrar publicação'}
          startIcon={isCelebrated ? <FavoriteRoundedIcon /> : <FavoriteBorderRoundedIcon />}
          sx={{
            minHeight: FEED_TOUCH_TARGET_PX,
            px: 1.5,
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.82rem',
            color: isCelebrated ? FEED_PALETTE.coralHeart : FEED_PALETTE.inkSecondary,
            bgcolor: isCelebrated ? FEED_PALETTE.coralHeartSoft : 'transparent',
            ...(section.isOwnPublication ? { opacity: 0.48, cursor: 'not-allowed' } : {}),
          }}
        >
          {isCelebrated ? 'Celebrado' : 'Celebrar'}
        </Button>
        {section.mediaCount > 0 && (
          <Button
            data-testid={`clubinho-feed-post-comment-${section.id}`}
            type="button"
            onClick={() => openMedia(0)}
            startIcon={<ChatBubbleOutlineRoundedIcon />}
            sx={{
              minHeight: FEED_TOUCH_TARGET_PX,
              px: 1,
              textTransform: 'none',
              fontSize: '0.82rem',
              color: FEED_PALETTE.inkSecondary,
            }}
          >
            Comentar
          </Button>
        )}
        <Button
          data-testid={`clubinho-feed-post-share-${section.id}`}
          type="button"
          onClick={() => onShare(section)}
          startIcon={isCopied ? <CheckRoundedIcon /> : <IosShareRoundedIcon />}
          sx={{
            minHeight: FEED_TOUCH_TARGET_PX,
            px: 1.5,
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.82rem',
            color: isCopied ? FEED_PALETTE.brandLeafDark : FEED_PALETTE.inkSecondary,
          }}
        >
          {isCopied ? 'Link copiado!' : 'Compartilhar'}
        </Button>
      </Stack>
      {section.celebrationCount > 0 && (() => {
        const names = section.celebrators;
        const shown = names.slice(0, section.celebratedByMe ? 1 : 2).map((name) => name.trim().split(/\s+/)[0]);
        const others = Math.max(0, section.celebrationCount - shown.length - (section.celebratedByMe ? 1 : 0));
        const participants = [ ...(section.celebratedByMe ? ['Você'] : []), ...shown ];
        const summary = section.celebrationCount === 1 && section.celebratedByMe
          ? 'Você celebrou esta publicação'
          : `${participants.join(' e ')}${others > 0 ? ` e mais ${others} ${others === 1 ? 'pessoa' : 'professores'}` : ''} celebraram esta publicação`;
        return (
          <Tooltip
            placement="top-start"
            enterTouchDelay={0}
            enterNextDelay={0}
            slotProps={{
              tooltip: {
                sx: {
                  maxWidth: { xs: 'calc(100vw - 32px)', sm: 300 },
                  bgcolor: '#fff',
                  color: FEED_PALETTE.inkPrimary,
                  border: `1px solid ${FEED_PALETTE.borderSubtle}`,
                  boxShadow: '0 8px 24px rgba(20, 40, 28, 0.16)',
                  p: 1.25,
                },
              },
            }}
            title={
              <Box sx={{ maxHeight: { xs: 180, sm: 240 }, overflowY: 'auto', overscrollBehavior: 'contain', pr: 1, WebkitOverflowScrolling: 'touch' }}>
                <Typography sx={{ fontWeight: 700, mb: 0.5, color: FEED_PALETTE.inkPrimary }}>Quem celebrou</Typography>
                {names.map((name, index) => (
                  <Typography key={`${name}-${index}`} sx={{ fontSize: '0.82rem', py: 0.5, color: FEED_PALETTE.inkSecondary, overflowWrap: 'anywhere' }}>{name}</Typography>
                ))}
              </Box>
            }
          >
            <Typography tabIndex={0} role="button" aria-label={`${summary}. Toque para ver quem celebrou.`} sx={{ display: 'block', width: 'fit-content', maxWidth: '100%', minHeight: 40, px: { xs: 3.5, sm: 4.5 }, pb: 1.5, fontSize: '0.76rem', color: FEED_PALETTE.inkMuted, lineHeight: 1.4, cursor: 'pointer', '&:focus-visible': { outline: `2px solid ${FEED_PALETTE.brandLeafDark}`, outlineOffset: 2 } }}>
              <FavoriteRoundedIcon sx={{ fontSize: 13, color: FEED_PALETTE.coralHeart, verticalAlign: 'text-bottom', mr: 0.5 }} />{summary}
            </Typography>
          </Tooltip>
        );
      })()}
    </Paper>
  );
}
