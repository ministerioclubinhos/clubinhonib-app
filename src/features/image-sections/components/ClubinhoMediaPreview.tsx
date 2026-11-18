import { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { MediaType } from '@/store/slices/types';
import type { ClubinhoMediaPreviewProps } from '../types';
import { ClubinhoVideoPlayer } from './ClubinhoVideoPlayer';

export function ClubinhoMediaPreview({ media }: ClubinhoMediaPreviewProps) {
  const [localUrl, setLocalUrl] = useState('');
  useEffect(() => {
    if (!media.file) {
      setLocalUrl('');
      return;
    }
    const url = URL.createObjectURL(media.file);
    setLocalUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [media.file]);
  const src = media.file ? localUrl : media.url;
  return (
    <Box data-testid="clubinho-media-preview" sx={{ width: '100%' }}>
      {src &&
        (media.mediaType === MediaType.VIDEO ? (
          <ClubinhoVideoPlayer src={src} title={media.title || 'Vídeo do Clubinho'} />
        ) : (
          <Box
            component="img"
            src={src}
            alt={media.title || 'Foto do Clubinho'}
            sx={{
              width: '100%',
              aspectRatio: '4 / 3',
              objectFit: 'cover',
              display: 'block',
              borderRadius: 2,
            }}
          />
        ))}
    </Box>
  );
}
