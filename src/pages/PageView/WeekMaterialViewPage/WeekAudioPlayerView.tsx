import { Box, Typography, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import DownloadButton from './DownloadButton';
import { MediaItem, MediaPlatform, MediaUploadType } from 'store/slices/types';

interface Props {
  audio: MediaItem;
}

export default function WeekAudioPlayerView({ audio }: Props) {
  const theme = useTheme();

  const getDropboxRawUrl = (url: string): string =>
    url.replace('www.dropbox.com', 'dl.dropboxusercontent.com').replace(/\?dl=\d.*$/, '?raw=1');

  const getGoogleDrivePreviewUrl = (url: string): string | null => {
    const match = url.match(/\/d\/(.*?)\//);
    if (match && match[1]) {
      return `https://drive.google.com/file/d/${match[1]}/preview`;
    }
    return null;
  };

  const getFinalAudioUrl = (): string | null => {
    if (!audio.url) return null;
    if (audio.isLocalFile || audio.uploadType === MediaUploadType.UPLOAD) return audio.url;

    switch (audio.platformType) {
      case MediaPlatform.DROPBOX:
        return getDropboxRawUrl(audio.url);
      case MediaPlatform.GOOGLE_DRIVE:
        return null;
      default:
        return null;
    }
  };

  const finalUrl = getFinalAudioUrl();
  const googleDrivePreview =
    audio.platformType === MediaPlatform.GOOGLE_DRIVE ? getGoogleDrivePreviewUrl(audio.url) : null;

  const renderAudioPlayer = () => {
    if (googleDrivePreview) {
      return (
        <Box
          sx={{
            position: 'relative',
            overflow: 'hidden',
            width: '100%',
            pt: { xs: '25%', md: '10%' },
            borderRadius: 2,
          }}
        >
          <iframe
            src={googleDrivePreview}
            allow="autoplay"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              border: 'none',
            }}
            title={audio.title}
          />
        </Box>
      );
    }

    if (!finalUrl) {
      return <Typography color="error">Áudio não disponível para reprodução.</Typography>;
    }

    return (
      <audio controls style={{ width: '100%', borderRadius: 8 }}>
        <source src={finalUrl} />
        Seu navegador não suporta o elemento de áudio.
      </audio>
    );
  };

  return (
    <Box sx={{ width: '100%', p: 1 }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {renderAudioPlayer()}
        <Typography
          variant="subtitle1"
          fontWeight="bold"
          mt={1}
          color={theme.palette.secondary.main}
        >
          {audio.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={1}>
          {audio.description}
        </Typography>
        <DownloadButton url={audio.url} filename={audio.originalName || audio.title || 'audio'} />
      </motion.div>
    </Box>
  );
}
