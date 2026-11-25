import { Box, IconButton, LinearProgress, Stack, Typography } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import { Link } from 'react-router-dom';

import { playWatchPath } from '../constants';
import type { PlayVideo } from '../types';
import { formatDuration, formatViews, progressPercent, timeAgo } from '../utils';

interface PlayVideoCardProps {
  video: PlayVideo;
  /** `compact`: miniatura ao lado do texto (lista de relacionados). */
  variant?: 'grid' | 'compact';
  onToggleFavorite?: (video: PlayVideo) => void;
  /** Destaca o vídeo que está tocando agora. */
  active?: boolean;
}

function Thumbnail({ video }: { video: PlayVideo }) {
  const percent = progressPercent(video);
  const duration = formatDuration(video.durationSeconds);

  return (
    <Box
      sx={{
        position: 'relative',
        aspectRatio: '16 / 9',
        borderRadius: 2,
        overflow: 'hidden',
        bgcolor: '#1e1b4b',
        background: 'linear-gradient(135deg, #312e81 0%, #4f46e5 100%)',
        flexShrink: 0,
      }}
    >
      {video.thumbnailUrl ? (
        <Box
          component="img"
          src={video.thumbnailUrl}
          alt=""
          loading="lazy"
          sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      ) : (
        <Stack alignItems="center" justifyContent="center" sx={{ height: '100%' }}>
          <PlayCircleOutlineIcon sx={{ fontSize: 44, color: 'rgba(255,255,255,0.85)' }} />
        </Stack>
      )}
      {duration && (
        <Typography
          component="span"
          variant="caption"
          sx={{
            position: 'absolute',
            right: 6,
            bottom: percent > 0 ? 10 : 6,
            px: 0.75,
            py: 0.25,
            borderRadius: 1,
            bgcolor: 'rgba(0,0,0,0.8)',
            color: '#fff',
            fontWeight: 700,
          }}
        >
          {duration}
        </Typography>
      )}
      {video.featured && (
        <Typography
          component="span"
          variant="caption"
          sx={{
            position: 'absolute',
            left: 6,
            top: 6,
            px: 0.75,
            py: 0.25,
            borderRadius: 1,
            bgcolor: '#f59e0b',
            color: '#1f1300',
            fontWeight: 800,
          }}
        >
          Destaque
        </Typography>
      )}
      {percent > 0 && (
        <LinearProgress
          variant="determinate"
          value={percent}
          aria-label="Quanto você já assistiu"
          sx={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: 4,
            bgcolor: 'rgba(255,255,255,0.35)',
            '& .MuiLinearProgress-bar': { bgcolor: '#ef4444' },
          }}
        />
      )}
    </Box>
  );
}

/** Cartão de vídeo no estilo plataforma: miniatura, duração, progresso, título e meta. */
export default function PlayVideoCard({
  video,
  variant = 'grid',
  onToggleFavorite,
  active = false,
}: PlayVideoCardProps) {
  const compact = variant === 'compact';
  const meta = [video.galleryTitle, formatViews(video.viewCount), timeAgo(video.createdAt)]
    .filter(Boolean)
    .join(' • ');

  return (
    <Box
      data-testid="play-video-card"
      sx={{
        position: 'relative',
        display: 'flex',
        flexDirection: compact ? 'row' : 'column',
        gap: compact ? 1.25 : 1,
        p: compact ? 0.75 : 0,
        borderRadius: 2,
        bgcolor: active ? 'action.selected' : 'transparent',
        '&:hover .play-card-title': { color: 'primary.main' },
      }}
    >
      <Box
        component={Link}
        to={playWatchPath(video.id)}
        aria-label={`Assistir ${video.title}`}
        sx={{ display: 'block', width: compact ? { xs: 140, sm: 168 } : '100%', flexShrink: 0 }}
      >
        <Thumbnail video={video} />
      </Box>
      <Box sx={{ minWidth: 0, flex: 1, pr: onToggleFavorite ? 4 : 0 }}>
        <Typography
          component={Link}
          to={playWatchPath(video.id)}
          className="play-card-title"
          variant={compact ? 'body2' : 'subtitle1'}
          sx={{
            fontWeight: 700,
            lineHeight: 1.25,
            color: 'text.primary',
            textDecoration: 'none',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {video.title}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
          {meta}
        </Typography>
        {video.categoryName && (
          <Typography variant="caption" sx={{ color: '#4f46e5', fontWeight: 600 }}>
            {video.categoryName}
          </Typography>
        )}
      </Box>
      {onToggleFavorite && (
        <IconButton
          size="small"
          aria-label={video.favorite ? 'Remover de Assistir depois' : 'Assistir depois'}
          aria-pressed={video.favorite}
          onClick={() => onToggleFavorite(video)}
          sx={{
            position: 'absolute',
            right: 0,
            bottom: compact ? 4 : 'auto',
            top: compact ? 'auto' : 'calc(56.25% + 4px)',
          }}
        >
          {video.favorite ? (
            <FavoriteIcon fontSize="small" color="error" />
          ) : (
            <FavoriteBorderIcon fontSize="small" />
          )}
        </IconButton>
      )}
    </Box>
  );
}
