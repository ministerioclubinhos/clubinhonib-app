import { 
  Box, 
  Typography, 
  Paper, 
  useTheme, 
  useMediaQuery,
  Chip,
  Stack,
  Alert,
} from '@mui/material';
import { motion } from 'framer-motion';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import DownloadButton from './DownloadButton';
import { MediaItem, MediaUploadType, MediaPlatform } from 'store/slices/types';

interface Props {
  video: MediaItem;
  compact?: boolean;
}

export default function WeekVideoPlayer({ video, compact = false }: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const getYouTubeEmbedUrl = (url: string): string | null => {
    if (url.includes('youtube.com')) {
      const id = url.split('v=')[1]?.split('&')[0];
      return id ? `https://www.youtube.com/embed/${id}?autoplay=0&mute=0` : null;
    }
    if (url.includes('youtu.be')) {
      const id = url.split('youtu.be/')[1]?.split('?')[0];
      return id ? `https://www.youtube.com/embed/${id}?autoplay=0&mute=0` : null;
    }
    return null;
  };

  const getGoogleDriveEmbedUrl = (url: string): string | null => {
  const match = url.match(/\/d\/(.*?)\//);
    return match ? `https://drive.google.com/file/d/${match[1]}/preview` : null;
  };

  const getDropboxRawUrl = (url: string): string => {
    const cleanUrl = url.split('?')[0];
    return cleanUrl.replace('www.dropbox.com', 'dl.dropboxusercontent.com') + '?raw=1';
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
    if (!video.url) {
      return (
        <Alert severity="error" sx={{ borderRadius: 3 }}>
          Vídeo não disponível.
        </Alert>
      );
    }

    if (!shouldRenderVideo()) {
      return (
        <Alert severity="warning" sx={{ borderRadius: 3 }}>
          Este vídeo não pode ser renderizado na página.
        </Alert>
      );
    }

    if (video.isLocalFile || video.uploadType === MediaUploadType.UPLOAD) {
      return (
        <Box
          component="video"
          controls
          sx={{
            width: '100%',
            aspectRatio: '16/9',
            objectFit: 'contain',
            bgcolor: '#000',
            borderRadius: compact ? 1.5 : 3,
            boxShadow: compact ? 'none' : '0 8px 32px rgba(0,0,0,0.1)',
          }}
        >
          <source src={video.url} />
          Seu navegador não suporta vídeo embutido.
        </Box>
      );
    }

    if (video.uploadType === MediaUploadType.LINK) {
      switch (video.platformType) {
        case MediaPlatform.YOUTUBE: {
          const embedUrl = getYouTubeEmbedUrl(video.url);
          return embedUrl ? (
            <Box
              component="iframe"
              src={embedUrl}
              title={video.title}
              allowFullScreen
              sx={{
                width: '100%',
                aspectRatio: '16/9',
                border: 'none',
                borderRadius: compact ? 1.5 : 3,
                boxShadow: compact ? 'none' : '0 8px 32px rgba(0,0,0,0.1)',
              }}
            />
          ) : (
            <Alert severity="error" sx={{ borderRadius: 3 }}>
              URL do YouTube inválida.
            </Alert>
          );
        }

        case MediaPlatform.GOOGLE_DRIVE: {
          const embedUrl = getGoogleDriveEmbedUrl(video.url);
          return embedUrl ? (
            <Box
              component="iframe"
              src={embedUrl}
              title={video.title}
              allowFullScreen
              sx={{
                width: '100%',
                aspectRatio: '16/9',
                border: 'none',
                borderRadius: compact ? 1.5 : 3,
                boxShadow: compact ? 'none' : '0 8px 32px rgba(0,0,0,0.1)',
              }}
            />
          ) : (
            <Alert severity="error" sx={{ borderRadius: 3 }}>
              URL do Google Drive inválida.
            </Alert>
          );
        }

        default:
          return (
            <Alert severity="warning" sx={{ borderRadius: 3 }}>
              Plataforma de vídeo não suportada para visualização.
            </Alert>
          );
      }
    }

    return (
      <Alert severity="error" sx={{ borderRadius: 3 }}>
        Tipo de vídeo não suportado.
      </Alert>
    );
  };

  const fileSize = video.size ? `${(video.size / 1024 / 1024).toFixed(1)} MB` : null;

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
          border: `${compact ? 1 : 2}px solid ${theme.palette.error.main}20`,
          background: compact ? '#FFFFFF' : 'linear-gradient(135deg, #ffffff 0%, #ffebee 100%)',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: compact ? 'none' : 'translateY(-2px)',
            borderColor: theme.palette.error.main,
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
              bgcolor: 'error.main',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <PlayCircleOutlineIcon sx={{ fontSize: compact ? '1.25rem' : { xs: '1.5rem', md: '2rem' } }} />
          </Box>
          
          <Box flex={1}>
            <Typography
              variant="h6"
              fontWeight="bold"
              color="error.main"
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
              {video.title}
            </Typography>
            
            {fileSize && !compact && (
              <Chip
                label={fileSize}
                size="small"
                sx={{
                  bgcolor: 'error.light',
                  color: 'white',
                  fontSize: '0.75rem',
                }}
              />
            )}
          </Box>
        </Box>

        <Box sx={{ mb: compact ? 1 : 3 }}>
          {renderVideo()}
        </Box>

        {video.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 3,
              lineHeight: compact ? 1.35 : 1.6,
              fontSize: compact ? '0.8rem' : { xs: '0.9rem', md: '1rem' },
              flex: 1,
              ...(compact && {
                mb: 1,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }),
            }}
          >
            {video.description}
          </Typography>
        )}

        {shouldAllowDownload() && (
          <Box sx={{ mt: 'auto' }}>
            <DownloadButton
              url={
                video.platformType === MediaPlatform.DROPBOX ? getDropboxRawUrl(video.url) : video.url
              }
              filename={video.originalName || video.title || 'video'}
              size={compact ? 'small' : isMobile ? 'medium' : 'large'}
              fullWidth
            />
          </Box>
        )}
      </Paper>
    </motion.div>
  );
}
