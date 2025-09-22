import { 
  Typography, 
  Box, 
  Alert,
  Paper,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { MediaItem, MediaUploadType, MediaPlatform } from "@/store/slices/types";
import { getYouTubeId } from "@/utils/video";

const VideoPlayer = ({ video }: { video: MediaItem }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const renderUploadVideo = () => (
    <Paper
      elevation={6}
      sx={{
        borderRadius: { xs: 3, md: 4 },
        overflow: 'hidden',
        bgcolor: 'black',
      }}
    >
      <Box
        component="video"
        controls
        playsInline
        sx={{
          width: '100%',
          aspectRatio: '16/9',
          display: 'block',
          '&::-webkit-media-controls-panel': {
            bgcolor: 'rgba(0,0,0,0.8)',
          },
        }}
      >
        <source src={video.url} />
        Seu navegador não suporta vídeo.
      </Box>
    </Paper>
  );

  const renderEmbeddedVideo = () => {
    let embedUrl = '';

    switch (video.platformType) {
      case MediaPlatform.YOUTUBE: {
        const id = getYouTubeId(video.url);
        embedUrl = id ? `https://www.youtube.com/embed/${id}?autoplay=0&mute=0&rel=0&modestbranding=1` : '';
        break;
      }
      case MediaPlatform.GOOGLE_DRIVE: {
        const fileId = video.url.match(/\/d\/([\w-]+)/)?.[1];
        embedUrl = fileId ? `https://drive.google.com/file/d/${fileId}/preview` : '';
        break;
      }
      case MediaPlatform.ONEDRIVE:
      case MediaPlatform.DROPBOX:
      case MediaPlatform.ANY: {
        embedUrl = video.url;
        break;
      }
      default:
        embedUrl = '';
    }

    if (!embedUrl) {
      return (
        <Alert 
          severity="error" 
          sx={{ 
            borderRadius: { xs: 3, md: 4 },
            fontSize: { xs: '0.9rem', md: '1rem' },
          }}
        >
          Plataforma não suportada ou URL inválida
        </Alert>
      );
    }

    return (
      <Paper
        elevation={6}
        sx={{
          borderRadius: { xs: 3, md: 4 },
          overflow: 'hidden',
          bgcolor: 'black',
        }}
      >
        <Box
          component="iframe"
          src={embedUrl}
          title={video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          sx={{
            width: '100%',
            aspectRatio: '16/9',
            border: 0,
            display: 'block',
          }}
        />
      </Paper>
    );
  };

  // Main render logic
  if (video.uploadType === MediaUploadType.UPLOAD && video.url) {
    return renderUploadVideo();
  }

  if (video.uploadType === MediaUploadType.LINK && video.platformType && video.url) {
    return renderEmbeddedVideo();
  }

  return (
    <Alert 
      severity="warning" 
      sx={{ 
        borderRadius: { xs: 3, md: 4 },
        fontSize: { xs: '0.9rem', md: '1rem' },
      }}
    >
      Formato de vídeo não suportado ou dados incompletos
    </Alert>
  );
};

export default VideoPlayer;