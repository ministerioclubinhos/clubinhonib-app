import { Box, Typography, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import DownloadButton from './DownloadButton';
import { MediaItem, MediaUploadType, MediaPlatform } from 'store/slices/types';

interface Props {
  image: MediaItem;
}

const getGoogleDriveThumbnailUrl = (url: string): string | null => {
  const match = url.match(/\/d\/(.*?)\//);
  return match ? `https://drive.google.com/thumbnail?id=${match[1]}` : null;
};

export default function WeekImageGallery({ image }: Props) {
  const theme = useTheme();

  const canVisualize =
    image.isLocalFile ||
    image.uploadType === MediaUploadType.UPLOAD ||
    image.platformType === MediaPlatform.GOOGLE_DRIVE;

  const getImageUrl = (): string | null => {
    if (image.isLocalFile || image.uploadType === MediaUploadType.UPLOAD) {
      return image.url;
    }
    if (image.platformType === MediaPlatform.GOOGLE_DRIVE) {
      return getGoogleDriveThumbnailUrl(image.url);
    }
    return null;
  };

  const finalUrl = getImageUrl();

  return (
    <Box sx={{ width: '100%', p: 1 }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {canVisualize && finalUrl ? (
          <img
            src={finalUrl}
            alt={image.title || 'Imagem'}
            style={{
              width: '100%',
              borderRadius: 12,
              maxHeight: 250,
              objectFit: 'cover',
              marginBottom: 8,
            }}
          />
        ) : (
          <Typography color="error" mb={2}>
            Visualização não disponível para esta imagem.
          </Typography>
        )}
        <Typography variant="subtitle1" fontWeight="bold" color={theme.palette.warning.main}>
          {image.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={1}>
          {image.description}
        </Typography>
        <DownloadButton url={image.url} filename={image.originalName || image.title || 'imagem'} />
      </motion.div>
    </Box>
  );
}
