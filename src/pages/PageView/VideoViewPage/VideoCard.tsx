import { useState } from 'react';
import { Card, Typography, Box, Modal, Fade } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { motion } from 'framer-motion';
import VideoPlayer from './VideoPlayer';
import { MediaItem, MediaUploadType, MediaPlatform } from 'store/slices/types';

interface Props {
  video: MediaItem;
}

const VideoCard = ({ video }: Props) => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const videoId = video.url?.split('v=')[1]?.split('&')[0];
  const thumbnailUrl =
    video.platformType === MediaPlatform.YOUTUBE && videoId
      ? `https://img.youtube.com/vi/${videoId}/0.jpg`
      : undefined;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card
          sx={{
            p: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            borderRadius: 3,
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: '0 6px 25px rgba(0,0,0,0.15)',
            },
            cursor: 'pointer',
          }}
          onClick={handleOpen}
        >
          <Box sx={{ position: 'relative' }}>
            {video.uploadType === MediaUploadType.UPLOAD && video.url ? (
              <video src={video.url} style={{ width: '100%', borderRadius: 3 }} muted />
            ) : video.uploadType === MediaUploadType.LINK &&
              video.platformType === MediaPlatform.YOUTUBE &&
              thumbnailUrl ? (
              <img
                src={thumbnailUrl}
                alt={video.title}
                style={{ width: '100%', borderRadius: 3 }}
              />
            ) : (
              <Box sx={{ bgcolor: '#e0e0e0', height: 150, borderRadius: 3 }} />
            )}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'rgba(0,0,0,0.3)',
                borderRadius: 3,
              }}
            >
              <PlayArrowIcon sx={{ fontSize: 48, color: '#fff' }} />
            </Box>
          </Box>
          <Typography variant="h6" fontWeight="bold" sx={{ mt: 2 }}>
            {video.title}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {video.description}
          </Typography>
        </Card>
      </motion.div>

      <Modal open={open} onClose={handleClose} closeAfterTransition>
        <Fade in={open}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: { xs: '90%', sm: '70%', md: '50%' },
              bgcolor: 'background.paper',
              boxShadow: 24,
              p: 4,
              borderRadius: 3,
            }}
          >
            <VideoPlayer video={video} />
          </Box>
        </Fade>
      </Modal>
    </>
  );
};

export default VideoCard;
