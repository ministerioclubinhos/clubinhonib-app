import { useEffect, useState } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { Link } from 'react-router-dom';

import { playWatchPath } from '../constants';
import type { PlayVideo } from '../types';

const ROTATE_MS = 7000;

/** Banner de destaque: gira entre os vídeos em destaque; pontos permitem escolher. */
export default function PlayHero({ videos }: { videos: PlayVideo[] }) {
  const [index, setIndex] = useState(0);
  const count = videos.length;

  useEffect(() => {
    if (count < 2) return undefined;
    const timer = setInterval(() => setIndex((current) => (current + 1) % count), ROTATE_MS);
    return () => clearInterval(timer);
  }, [count]);

  if (count === 0) return null;
  const video = videos[Math.min(index, count - 1)];

  return (
    <Box
      data-testid="play-hero"
      sx={{
        position: 'relative',
        borderRadius: { xs: 2, md: 3 },
        overflow: 'hidden',
        mb: 3,
        minHeight: { xs: 220, md: 340 },
        color: '#fff',
        background: 'linear-gradient(135deg, #1e1b4b 0%, #4f46e5 100%)',
      }}
    >
      {video.thumbnailUrl && (
        <Box
          component="img"
          src={video.thumbnailUrl}
          alt=""
          sx={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: 0.55,
          }}
        />
      )}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(15,12,50,0.92) 0%, rgba(15,12,50,0) 70%)',
        }}
      />
      <Stack
        spacing={1}
        justifyContent="flex-end"
        sx={{ position: 'relative', height: '100%', minHeight: 'inherit', p: { xs: 2, md: 4 } }}
      >
        <Typography
          component="h2"
          sx={{ fontWeight: 800, fontSize: { xs: 22, md: 34 }, lineHeight: 1.15 }}
        >
          {video.title}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            maxWidth: 640,
            opacity: 0.9,
            display: { xs: 'none', sm: '-webkit-box' },
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {video.description}
        </Typography>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ pt: 0.5 }}>
          <Button
            component={Link}
            to={playWatchPath(video.id)}
            variant="contained"
            startIcon={<PlayArrowIcon />}
            sx={{
              bgcolor: '#fff',
              color: '#1e1b4b',
              fontWeight: 800,
              '&:hover': { bgcolor: '#e0e7ff' },
            }}
          >
            Assistir
          </Button>
          {count > 1 && (
            <Stack direction="row" spacing={0.75} role="tablist" aria-label="Vídeos em destaque">
              {videos.map((item, position) => (
                <Box
                  key={item.id}
                  component="button"
                  type="button"
                  role="tab"
                  aria-selected={position === index}
                  aria-label={`Destaque ${position + 1}: ${item.title}`}
                  onClick={() => setIndex(position)}
                  sx={{
                    width: position === index ? 22 : 8,
                    height: 8,
                    p: 0,
                    border: 0,
                    borderRadius: 4,
                    cursor: 'pointer',
                    bgcolor: position === index ? '#fff' : 'rgba(255,255,255,0.5)',
                    transition: 'width .2s',
                  }}
                />
              ))}
            </Stack>
          )}
        </Stack>
      </Stack>
    </Box>
  );
}
