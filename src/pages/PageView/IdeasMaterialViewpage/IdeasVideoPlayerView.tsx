import { Box, Typography, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import { MediaItem, MediaUploadType, MediaPlatform } from 'store/slices/types';
import { getMediaPreviewUrl } from 'utils/getMediaPreviewUrl';
import DownloadButton from './DownloadButton';

interface Props {
  video: MediaItem;
}

export default function IdeasVideoPlayerView({ video }: Props) {
  const theme = useTheme();

  const getYouTubeEmbedUrl = (url: string): string | null => {
    if (url.includes('youtube.com')) {
      const id = url.split('v=')[1]?.split('&')[0];
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (url.includes('youtu.be')) {
      const id = url.split('youtu.be/')[1]?.split('?')[0];
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    return null;
  };

  const shouldRenderVideo = (): boolean => {
    if (video.isLocalFile || video.uploadType === MediaUploadType.UPLOAD) return true;
    if (
      video.uploadType === MediaUploadType.LINK &&
      (video.platformType === MediaPlatform.YOUTUBE ||
        video.platformType === MediaPlatform.GOOGLE_DRIVE)
    )
      return true;
    return false;
  };

  const shouldAllowDownload = (): boolean => {
    return (
      video.isLocalFile ||
      video.uploadType === MediaUploadType.UPLOAD ||
      video.platformType === MediaPlatform.GOOGLE_DRIVE ||
      video.platformType === MediaPlatform.DROPBOX ||
      video.platformType === MediaPlatform.ONEDRIVE
    );
  };

  const renderVideo = () => {
    if (!video.url) return <Typography color="error">Vídeo não disponível.</Typography>;

    if (!shouldRenderVideo())
      return <Typography color="error">Esse vídeo não pode ser renderizado na página.</Typography>;

    if (video.isLocalFile || video.uploadType === MediaUploadType.UPLOAD) {
      return (
        <video controls style={{ width: '100%', borderRadius: 12 }}>
          <source src={getMediaPreviewUrl(video)} />
          Seu navegador não suporta vídeo embutido.
        </video>
      );
    }

    if (video.uploadType === MediaUploadType.LINK) {
      switch (video.platformType) {
        case MediaPlatform.YOUTUBE: {
          const embedUrl = getYouTubeEmbedUrl(video.url);
          return embedUrl ? (
            <iframe
              src={embedUrl}
              title={video.title}
              allowFullScreen
              style={{ width: '100%', aspectRatio: '16/9', border: 'none', borderRadius: 12 }}
            />
          ) : (
            <Typography color="error">URL do YouTube inválida.</Typography>
          );
        }

        case MediaPlatform.GOOGLE_DRIVE: {
          const previewUrl = getMediaPreviewUrl(video);
          return previewUrl ? (
            <iframe
              src={previewUrl}
              title={video.title}
              allowFullScreen
              style={{ width: '100%', aspectRatio: '16/9', border: 'none', borderRadius: 12 }}
            />
          ) : (
            <Typography color="error">URL do Google Drive inválida.</Typography>
          );
        }

        default:
          return (
            <Typography color="error">
              Plataforma de vídeo não suportada para visualização.
            </Typography>
          );
      }
    }

    return <Typography color="error">Tipo de vídeo não suportado.</Typography>;
  };

  return (
    <Box sx={{ width: '100%', p: 1 }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {renderVideo()}
        <Typography variant="subtitle1" fontWeight="bold" mt={1} color={theme.palette.primary.main}>
          {video.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={1}>
          {video.description}
        </Typography>
        {shouldAllowDownload() && (
          <DownloadButton url={video.url} filename={video.originalName || video.title || 'video'} />
        )}
      </motion.div>
    </Box>
  );
}
