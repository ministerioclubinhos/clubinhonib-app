import { Typography, Box } from "@mui/material";
import { MediaItem, MediaUploadType, MediaPlatform } from "@/store/slices/types";
import { getYouTubeId } from "@/utils/video";

const VideoPlayer = ({ video }: { video: MediaItem }) => {
  if (video.uploadType === MediaUploadType.UPLOAD && video.url) {
    return (
      <Box sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <video controls playsInline style={{ width: '100%', display: 'block' }}>
          <source src={video.url} />
          Seu navegador não suporta vídeo.
        </video>
      </Box>
    );
  }

  if (video.uploadType === MediaUploadType.LINK && video.platformType && video.url) {
    let embedUrl = '';

    switch (video.platformType) {
      case MediaPlatform.YOUTUBE: {
        const id = getYouTubeId(video.url);
        embedUrl = id ? `https://www.youtube.com/embed/${id}` : '';
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

    return embedUrl ? (
      <Box sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <iframe
          src={embedUrl}
          title={video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          style={{ width: '100%', aspectRatio: '16/9', border: 0 }}
        />
      </Box>
    ) : (
      <Typography variant="body1" color="error" sx={{ p: 2, textAlign: 'center' }}>
        Plataforma não suportada ou URL inválida
      </Typography>
    );
  }

  return (
    <Typography variant="body1" color="error" sx={{ p: 2, textAlign: 'center' }}>
      Formato de vídeo não suportado ou dados incompletos
    </Typography>
  );
};

export default VideoPlayer;