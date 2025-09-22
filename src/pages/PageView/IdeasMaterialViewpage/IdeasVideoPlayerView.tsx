import { Box, Typography, useTheme, useMediaQuery, Tooltip } from '@mui/material';
import { motion } from 'framer-motion';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import { MediaItem, MediaUploadType, MediaPlatform } from 'store/slices/types';
import { getMediaPreviewUrl } from 'utils/getMediaPreviewUrl';
import DownloadButton from './DownloadButton';

interface Props {
  video: MediaItem;
}

export default function IdeasVideoPlayerView({ video }: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
    if (!video.url) return (
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        height: 200,
        backgroundColor: 'grey.100',
        borderRadius: 2,
      }}>
        <Typography color="error" align="center">
          Vídeo não disponível
        </Typography>
      </Box>
    );

    if (!shouldRenderVideo()) {
      return (
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          height: 200,
          backgroundColor: 'grey.100',
          borderRadius: 2,
        }}>
          <Typography color="error" align="center">
            Vídeo não pode ser renderizado
          </Typography>
        </Box>
      );
    }

    if (video.isLocalFile || video.uploadType === MediaUploadType.UPLOAD) {
      return (
        <Box sx={{ 
          position: 'relative',
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }}>
          <video 
            controls 
            style={{ 
              width: '100%', 
              borderRadius: 8,
              aspectRatio: '16/9',
              objectFit: 'cover',
            }}
          >
            <source src={getMediaPreviewUrl(video)} />
            Seu navegador não suporta vídeo embutido.
          </video>
        </Box>
      );
    }

    if (video.uploadType === MediaUploadType.LINK) {
      switch (video.platformType) {
        case MediaPlatform.YOUTUBE: {
          const embedUrl = getYouTubeEmbedUrl(video.url);
          return embedUrl ? (
            <Box sx={{ 
              position: 'relative',
              borderRadius: 2,
              overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}>
              <iframe
                src={embedUrl}
                title={video.title}
                allowFullScreen
                style={{ 
                  width: '100%', 
                  aspectRatio: '16/9', 
                  border: 'none',
                  borderRadius: 8,
                }}
              />
            </Box>
          ) : (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              height: 200,
              backgroundColor: 'grey.100',
              borderRadius: 2,
            }}>
              <Typography color="error" align="center">
                URL do YouTube inválida
              </Typography>
            </Box>
          );
        }

        case MediaPlatform.GOOGLE_DRIVE: {
          const previewUrl = getMediaPreviewUrl(video);
          return previewUrl ? (
            <Box sx={{ 
              position: 'relative',
              borderRadius: 2,
              overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}>
              <iframe
                src={previewUrl}
                title={video.title}
                allowFullScreen
                style={{ 
                  width: '100%', 
                  aspectRatio: '16/9', 
                  border: 'none',
                  borderRadius: 8,
                }}
              />
            </Box>
          ) : (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              height: 200,
              backgroundColor: 'grey.100',
              borderRadius: 2,
            }}>
              <Typography color="error" align="center">
                URL do Google Drive inválida
              </Typography>
            </Box>
          );
        }

        default:
          return (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              height: 200,
              backgroundColor: 'grey.100',
              borderRadius: 2,
            }}>
              <Typography color="error" align="center">
                Plataforma não suportada
              </Typography>
            </Box>
          );
      }
    }

    return (
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        height: 200,
        backgroundColor: 'grey.100',
        borderRadius: 2,
      }}>
        <Typography color="error" align="center">
          Tipo de vídeo não suportado
        </Typography>
      </Box>
    );
  };

  return (
    <Box sx={{ 
      width: '100%', 
      p: { xs: 1.5, sm: 2, md: 3 },
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
      >
        {/* Header com ícone */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 }, mb: { xs: 1.5, sm: 2 } }}>
          <PlayCircleOutlineIcon sx={{ color: theme.palette.error.main, fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
          <Typography 
            variant="subtitle1" 
            fontWeight="bold" 
            color={theme.palette.error.main}
            sx={{ 
              fontSize: { xs: '0.85rem', sm: '0.9rem', md: '1rem' },
              lineHeight: 1.3,
            }}
          >
            {video.title}
          </Typography>
        </Box>

        {/* Vídeo */}
        <Box sx={{ mb: { xs: 1.5, sm: 2 }, flex: 1 }}>
          {renderVideo()}
        </Box>

        {/* Descrição */}
        {video.description && (
          <Typography 
            variant="body2" 
            color="text.secondary" 
            mb={{ xs: 1.5, sm: 2 }}
            sx={{ 
              fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.85rem' },
              lineHeight: 1.4,
            }}
          >
            {video.description}
          </Typography>
        )}

        {/* Botão de download */}
        {shouldAllowDownload() && (
          <Box sx={{ mt: 'auto' }}>
            <DownloadButton 
              url={video.url} 
              filename={video.originalName || video.title || 'video'} 
              size="small"
              fullWidth={isMobile}
            />
          </Box>
        )}
      </motion.div>
    </Box>
  );
}
