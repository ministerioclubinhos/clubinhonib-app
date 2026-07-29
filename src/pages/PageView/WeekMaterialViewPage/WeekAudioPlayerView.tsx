import { 
  Box, 
  Typography, 
  Paper, 
  useTheme, 
  useMediaQuery,
  Chip,
  Alert,
} from '@mui/material';
import { motion } from 'framer-motion';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import DownloadButton from './DownloadButton';
import { MediaItem, MediaPlatform, MediaUploadType } from 'store/slices/types';

interface Props {
  audio: MediaItem;
  compact?: boolean;
}

export default function WeekAudioPlayerView({ audio, compact = false }: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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
            pt: compact ? { xs: '18%', md: '12%' } : { xs: '25%', md: '15%' },
            borderRadius: compact ? 1.5 : 3,
            bgcolor: 'grey.50',
            border: '2px solid',
            borderColor: 'grey.200',
          }}
        >
          <Box
            component="iframe"
            src={googleDrivePreview}
            allow="autoplay"
            sx={{
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
      return (
        <Alert severity="warning" sx={{ borderRadius: 3 }}>
          Áudio não disponível para reprodução.
        </Alert>
      );
    }

    return (
      <Box
        component="audio"
        controls
        sx={{
          width: '100%',
          borderRadius: 3,
          '&::-webkit-media-controls-panel': {
            bgcolor: 'primary.main',
          },
        }}
      >
        <source src={finalUrl} />
        Seu navegador não suporta o elemento de áudio.
      </Box>
    );
  };

  const fileSize = audio.size ? `${(audio.size / 1024 / 1024).toFixed(1)} MB` : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={compact ? undefined : { y: -2 }}
      transition={{ duration: 0.3 }}
      style={{ height: '100%' }}
    >
      <Paper
        elevation={compact ? 0 : 3}
        sx={{
          p: compact ? { xs: 1, md: 1.2 } : { xs: 3, md: 4 },
          borderRadius: compact ? 2 : { xs: 3, md: 4 },
          border: `${compact ? 1 : 2}px solid ${theme.palette.secondary.main}20`,
          background: compact ? '#FFFFFF' : 'linear-gradient(135deg, #ffffff 0%, #f3e5f5 100%)',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: compact ? 'none' : 'translateY(-2px)',
            borderColor: theme.palette.secondary.main,
          },
        }}
      >
        
        <Box
          display="flex"
          alignItems="center"
          gap={compact ? 1 : 2}
          mb={compact ? 1 : 3}
        >
          <Box
            sx={{
              width: compact ? 34 : 'auto',
              height: compact ? 34 : 'auto',
              p: compact ? 0 : 2,
              borderRadius: compact ? 1.5 : 3,
              bgcolor: 'secondary.main',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MusicNoteIcon sx={{ fontSize: compact ? '1.25rem' : { xs: '1.5rem', md: '2rem' } }} />
          </Box>
          
          <Box flex={1}>
            <Typography
              variant="h6"
              fontWeight="bold"
              color="secondary.main"
              sx={{
                fontSize: compact ? { xs: '0.9rem', md: '1rem' } : { xs: '1.1rem', md: '1.3rem' },
                mb: compact ? 0 : 0.5,
                lineHeight: compact ? 1.2 : 1.3,
                display: '-webkit-box',
                WebkitLineClamp: compact ? 2 : 'unset',
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                overflowWrap: 'anywhere',
              }}
            >
              {audio.title}
            </Typography>
            
            {fileSize && !compact && (
              <Chip
                label={fileSize}
                size="small"
                sx={{
                  bgcolor: 'secondary.light',
                  color: 'white',
                  fontSize: '0.75rem',
                }}
              />
            )}
          </Box>
        </Box>

        <Box sx={{ mb: compact ? 1 : 3 }}>
          {renderAudioPlayer()}
        </Box>

        {audio.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: compact ? 1 : 3,
              lineHeight: compact ? 1.35 : 1.6,
              fontSize: compact ? '0.8rem' : { xs: '0.9rem', md: '1rem' },
              flex: 1,
              ...(compact && {
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }),
            }}
          >
            {audio.description}
          </Typography>
        )}

        <Box sx={{ mt: 'auto' }}>
          <DownloadButton
            url={audio.url}
            filename={audio.originalName || audio.title || 'audio'}
            size={compact ? 'small' : isMobile ? 'medium' : 'large'}
            fullWidth
          />
        </Box>
      </Paper>
    </motion.div>
  );
}
