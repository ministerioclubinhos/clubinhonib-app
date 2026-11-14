import { useEffect, useState } from 'react';
import { Alert, Box, Link } from '@mui/material';
import type { ClubinhoVideoPlayerProps } from '../types';

export function ClubinhoVideoPlayer({ src, title }: ClubinhoVideoPlayerProps) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  return (
    <Box data-testid="clubinho-video-player" sx={{ width: '100%', minWidth: 0 }}>
      {failed ? (
        <Alert data-testid="clubinho-video-error" severity="warning">
          Não foi possível reproduzir este vídeo.{' '}
          <Link href={src} target="_blank" rel="noopener noreferrer">
            Abrir arquivo
          </Link>
        </Alert>
      ) : (
        <Box
          component="video"
          key={src}
          src={src}
          controls
          playsInline
          preload="metadata"
          aria-label={title}
          onError={() => setFailed(true)}
          data-testid="clubinho-video"
          sx={{
            display: 'block',
            width: '100%',
            maxHeight: '65dvh',
            aspectRatio: '16 / 9',
            objectFit: 'contain',
            bgcolor: 'common.black',
            borderRadius: 2,
          }}
        />
      )}
    </Box>
  );
}
