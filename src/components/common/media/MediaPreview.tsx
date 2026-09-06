import { Box, Typography } from '@mui/material';

import { MediaItem, MediaType, MediaUploadType } from '@/store/slices/types';

interface MediaPreviewProps {
  item: MediaItem;
  mediaType: MediaType;
}

/** Inline preview of a media item inside the admin editor list. */
export default function MediaPreview({
  item,
  mediaType,
}: MediaPreviewProps) {
  if (mediaType === MediaType.VIDEO) {
    return item.uploadType === MediaUploadType.LINK ? (
      <Box data-testid="media-media-preview" sx={{ aspectRatio: '16/9' }}>
        <iframe
          src={item.url}
          title={item.title}
          allowFullScreen
          style={{ width: '100%', height: '100%', border: 0 }}
        />
      </Box>
    ) : (
      <video data-testid="media-media-preview" controls style={{ width: '100%', marginTop: 8 }}>
        <source src={item.url} />
      </video>
    );
  }

  if (mediaType === MediaType.IMAGE) {
    return (
      <Box data-testid="media-media-preview"
        component="img"
        src={item.url}
        alt={item.title}
        sx={{ width: '100%', borderRadius: 2, mt: 1 }}
      />
    );
  }

  if (mediaType === MediaType.AUDIO) {
    return (
      <audio data-testid="media-media-preview" controls style={{ width: '100%', marginTop: 8 }}>
        <source src={item.url} />
        <Typography variant="body2">Seu navegador não suporta áudio.</Typography>
      </audio>
    );
  }

  return null;
}
