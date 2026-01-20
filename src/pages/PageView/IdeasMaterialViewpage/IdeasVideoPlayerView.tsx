import { Box, Typography, useTheme, useMediaQuery, Tooltip, IconButton, Dialog, DialogContent, Slide } from '@mui/material';
import { motion } from 'framer-motion';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import CloseIcon from '@mui/icons-material/Close';
import { MediaItem, MediaUploadType, MediaPlatform } from 'store/slices/types';
import { getMediaPreviewUrl } from 'utils/getMediaPreviewUrl';
import DownloadButton from './DownloadButton';
import React, { useState } from 'react';
import { TransitionProps } from '@mui/material/transitions';

interface Props {
  video: MediaItem;
}

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function IdeasVideoPlayerView({ video }: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [openModal, setOpenModal] = useState(false);

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

  const renderVideo = (isInModal: boolean = false) => {
    const height = isInModal ? '100%' : 200;
    const borderRadius = isInModal ? 0 : 2;

    if (!video.url) return (
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: height,
        minHeight: isInModal ? '50vh' : undefined,
        backgroundColor: 'grey.100',
        borderRadius: borderRadius,
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
          height: height,
          minHeight: isInModal ? '50vh' : undefined,
          backgroundColor: 'grey.100',
          borderRadius: borderRadius,
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
          borderRadius: borderRadius,
          overflow: 'hidden',
          boxShadow: isInModal ? 'none' : '0 4px 12px rgba(0,0,0,0.1)',
          height: isInModal ? '100%' : 'auto',
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <video
            controls
            style={{
              width: '100%',
              height: isInModal ? '100%' : 'auto',
              maxHeight: isInModal ? '85vh' : undefined,
              borderRadius: isInModal ? 0 : 8,
              aspectRatio: '16/9',
              objectFit: 'contain',
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
              borderRadius: borderRadius,
              overflow: 'hidden',
              boxShadow: isInModal ? 'none' : '0 4px 12px rgba(0,0,0,0.1)',
              height: isInModal ? '100%' : 'auto',
              width: '100%',
            }}>
              <iframe
                src={embedUrl}
                title={video.title}
                allowFullScreen
                style={{
                  width: '100%',
                  height: isInModal ? '80vh' : 'auto',
                  aspectRatio: '16/9',
                  border: 'none',
                  borderRadius: isInModal ? 0 : 8,
                }}
              />
            </Box>
          ) : (
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: height,
              backgroundColor: 'grey.100',
              borderRadius: borderRadius,
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
              borderRadius: borderRadius,
              overflow: 'hidden',
              boxShadow: isInModal ? 'none' : '0 4px 12px rgba(0,0,0,0.1)',
              height: isInModal ? '100%' : 'auto',
              width: '100%',
            }}>
              <iframe
                src={previewUrl}
                title={video.title}
                allowFullScreen
                style={{
                  width: '100%',
                  height: isInModal ? '80vh' : 'auto',
                  aspectRatio: '16/9',
                  border: 'none',
                  borderRadius: isInModal ? 0 : 8,
                }}
              />
            </Box>
          ) : (
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: height,
              backgroundColor: 'grey.100',
              borderRadius: borderRadius,
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
              height: height,
              backgroundColor: 'grey.100',
              borderRadius: borderRadius,
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
        height: height,
        backgroundColor: 'grey.100',
        borderRadius: borderRadius,
      }}>
        <Typography color="error" align="center">
          Tipo de vídeo não suportado
        </Typography>
      </Box>
    );
  };

  return (
    <>
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

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: { xs: 1.5, sm: 2 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 } }}>
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
            <Tooltip title="Expandir vídeo">
              <IconButton
                size="small"
                onClick={() => setOpenModal(true)}
                sx={{ color: theme.palette.text.secondary }}
              >
                <FullscreenIcon />
              </IconButton>
            </Tooltip>
          </Box>

          <Box sx={{ mb: { xs: 1.5, sm: 2 }, flex: 1 }}>
            {renderVideo()}
          </Box>

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

      {/* Expanded Video Modal */}
      <Dialog
        open={openModal}
        slots={{ transition: Transition }}
        keepMounted
        onClose={() => setOpenModal(false)}
        maxWidth="lg"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              bgcolor: 'black',
              color: 'white',
              borderRadius: { xs: 0, sm: 2 },
              overflow: 'hidden'
            }
          }
        }}
      >
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2,
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <Typography variant="h6" component="div">
            {video.title}
          </Typography>
          <IconButton onClick={() => setOpenModal(false)} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </Box>

        <DialogContent sx={{ p: 0, display: 'flex', justifyContent: 'center', bgcolor: 'black' }}>
          {renderVideo(true)}
        </DialogContent>
      </Dialog>
    </>
  );
}
