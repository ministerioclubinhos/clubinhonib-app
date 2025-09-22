import { Fragment, useState, useMemo } from "react";
import { 
  Card, 
  Typography, 
  Box, 
  Dialog, 
  IconButton,
  Paper,
  useTheme,
  useMediaQuery,
  Chip,
  Zoom,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import VideoFileIcon from "@mui/icons-material/VideoFile";
import { motion } from "framer-motion";
import VideoPlayer from "./VideoPlayer";
import { MediaItem, MediaUploadType } from "@/store/slices/types";
import { getPreferredThumb } from "@/utils/video";

interface Props { 
  video: MediaItem 
}

const VideoCard = ({ video }: Props) => {
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const thumb = useMemo(() => getPreferredThumb(video), [video]);

  const fileSize = video.size ? `${(video.size / 1024 / 1024).toFixed(1)} MB` : null;

  return (
    <Fragment>
      <motion.div 
        initial={{ opacity: 0, y: 16 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.4 }}
        whileHover={{ y: -2 }}
      >
        <Paper
          elevation={3}
          onClick={() => setOpen(true)}
          sx={{
            p: { xs: 2, md: 3 },
            borderRadius: { xs: 3, md: 4 },
            cursor: 'pointer',
            border: `2px solid ${theme.palette.primary.main}20`,
            background: 'linear-gradient(135deg, #ffffff 0%, #fff3e0 100%)',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            transition: 'all 0.3s ease',
            '&:hover': {
              elevation: 6,
              transform: 'translateY(-4px)',
              borderColor: theme.palette.primary.main,
            },
          }}
        >
          {/* Video Thumbnail */}
          <Box 
            sx={{ 
              position: 'relative', 
              borderRadius: { xs: 2, md: 3 }, 
              overflow: 'hidden',
              mb: 2,
              bgcolor: 'grey.100',
            }}
          >
            {video.uploadType === MediaUploadType.UPLOAD && video.url ? (
              <Box
                component="video"
                src={video.url}
                muted
                playsInline
                sx={{
                  width: '100%',
                  height: { xs: 160, md: 200 },
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            ) : thumb ? (
              <Box
                component="img"
                src={thumb}
                alt={video.title}
                sx={{
                  width: '100%',
                  height: { xs: 160, md: 200 },
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            ) : (
              <Box 
                sx={{ 
                  height: { xs: 160, md: 200 },
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'grey.100',
                }}
              >
                <VideoFileIcon sx={{ fontSize: '3rem', color: 'grey.400' }} />
              </Box>
            )}
            
            {/* Play Overlay */}
            <Box 
              sx={{ 
                position: 'absolute', 
                inset: 0, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                background: 'linear-gradient(180deg, rgba(0,0,0,.0) 0%, rgba(0,0,0,.35) 100%)',
                '&:hover': {
                  background: 'linear-gradient(180deg, rgba(0,0,0,.1) 0%, rgba(0,0,0,.45) 100%)',
                },
                transition: 'background 0.3s ease',
              }}
            >
              <Box
                sx={{
                  p: 2,
                  borderRadius: '50%',
                  bgcolor: 'rgba(255,255,255,0.9)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: 'white',
                    transform: 'scale(1.1)',
                  },
                }}
              >
                <PlayArrowIcon 
                  sx={{ 
                    fontSize: { xs: '2rem', md: '2.5rem' }, 
                    color: 'primary.main',
                    ml: 0.5, // Slight offset for play icon
                  }} 
                />
              </Box>
            </Box>
          </Box>

          {/* Content */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Header with title and size */}
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <VideoFileIcon sx={{ fontSize: '1rem', color: 'primary.main' }} />
              {fileSize && (
                <Chip
                  label={fileSize}
                  size="small"
                  sx={{
                    bgcolor: 'primary.light',
                    color: 'white',
                    fontSize: '0.75rem',
                  }}
                />
              )}
            </Box>

            <Typography 
              variant="h6" 
              fontWeight="bold"
              sx={{
                fontSize: { xs: '1rem', md: '1.1rem' },
                lineHeight: 1.3,
                mb: 1,
                color: 'primary.main',
              }}
            >
              {video.title}
            </Typography>
            
            {video.description && (
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{
                  fontSize: { xs: '0.85rem', md: '0.9rem' },
                  lineHeight: 1.5,
                  flex: 1,
                }}
              >
                {video.description}
              </Typography>
            )}
          </Box>
        </Paper>
      </motion.div>

      {/* Video Modal */}
      <Dialog 
        fullWidth 
        maxWidth="lg" 
        open={open} 
        onClose={() => setOpen(false)} 
        PaperProps={{ 
          sx: { 
            borderRadius: { xs: 3, md: 4 },
            bgcolor: 'transparent',
            boxShadow: 'none',
          } 
        }}
      >
        <Box sx={{ position: 'relative' }}>
          <IconButton 
            onClick={() => setOpen(false)} 
            aria-label="Fechar"
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              bgcolor: 'rgba(0,0,0,0.5)',
              color: 'white',
              zIndex: 1,
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.7)',
              },
            }}
          >
            <CloseIcon />
          </IconButton>
          
          <Box sx={{ px: { xs: 2, md: 3 }, pb: 3 }}>
            <Zoom in={open} timeout={300}>
              <Box>
                <VideoPlayer video={video} />
              </Box>
            </Zoom>
          </Box>
        </Box>
      </Dialog>
    </Fragment>
  );
};

export default VideoCard;