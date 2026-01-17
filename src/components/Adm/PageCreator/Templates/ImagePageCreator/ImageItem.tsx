import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { Box, IconButton, Alert } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { MediaItem, MediaPlatform, MediaUploadType } from 'store/slices/types';

interface ImageItemProps {
  mediaItems: MediaItem[];
  onRemoveMedia: (index: number) => void;
}

const getGoogleDriveThumbnailUrl = (url: string): string | null => {
const match = url.match(/\/d\/(.*?)\//);
  return match ? `https://drive.google.com/thumbnail?id=${match[1]}` : null;
};

const getPreviewUrl = (media: MediaItem): string => {
  if (media.uploadType === MediaUploadType.UPLOAD && media.file) {
    return URL.createObjectURL(media.file);
  }

  const url = media.url;

  switch (media.platformType) {
    case MediaPlatform.GOOGLE_DRIVE:
      return getGoogleDriveThumbnailUrl(url) || url;

    case MediaPlatform.DROPBOX:
      return url.replace('www.dropbox.com', 'dl.dropboxusercontent.com').replace('?dl=0', '?raw=1');

    case MediaPlatform.ONEDRIVE:
      return url.includes('&download=1') ? url.replace('&download=1', '&raw=1') : `${url}&raw=1`;

    default:
      return url;
  }
};

export default function ImageItem({ mediaItems, onRemoveMedia }: ImageItemProps) {
  if (mediaItems.length === 0) {
    return (
      <Alert severity="warning" sx={{ mb: 2 }}>
        Nenhuma mídia adicionada nesta seção.
      </Alert>
    );
  }

  return (
    <Swiper
      modules={[Navigation, Pagination, Autoplay]}
      navigation
      pagination={{ clickable: true }}
      autoplay={{ delay: 3000 }}
      loop
      style={{ borderRadius: 8, overflow: 'hidden' }}
    >
      {mediaItems.map((media, index) => (
        <SwiperSlide key={index}>
          <Box sx={{ position: 'relative' }}>
            <img
              src={getPreviewUrl(media)}
              alt={media.title || `Mídia ${index + 1}`}
              style={{ width: '100%', height: 300, objectFit: 'cover' }}
            />
            <IconButton
              onClick={() => onRemoveMedia(index)}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                backgroundColor: 'rgba(255,255,255,0.7)',
              }}
            >
              <CloseIcon color="error" />
            </IconButton>
          </Box>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
