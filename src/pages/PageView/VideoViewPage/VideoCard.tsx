import { Fragment, useState, useMemo } from "react";
import { Card, Typography, Box, Dialog, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { motion } from "framer-motion";
import VideoPlayer from "./VideoPlayer";
import { MediaItem, MediaUploadType } from "@/store/slices/types";
import { getPreferredThumb } from "@/utils/video";

interface Props { video: MediaItem }

const VideoCard = ({ video }: Props) => {
  const [open, setOpen] = useState(false);
  const thumb = useMemo(() => getPreferredThumb(video), [video]);

  return (
    <Fragment>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Card onClick={() => setOpen(true)} sx={{ p: 2, borderRadius: 3, cursor: 'pointer', boxShadow: (t) => t.shadows[4], transition: 'transform .25s, box-shadow .25s', '&:hover': { transform: 'translateY(-4px)', boxShadow: (t) => t.shadows[8] } }}>
          <Box sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden' }}>
            {video.uploadType === MediaUploadType.UPLOAD && video.url ? (
              <video src={video.url} muted playsInline style={{ width: '100%', display: 'block' }} />
            ) : thumb ? (
              <img src={thumb} alt={video.title} style={{ width: '100%', display: 'block' }} />
            ) : (
              <Box sx={{ bgcolor: 'action.hover', height: 180 }} />
            )}
            <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(180deg, rgba(0,0,0,.0) 0%, rgba(0,0,0,.35) 100%)' }}>
              <PlayArrowIcon sx={{ fontSize: 48, color: '#fff' }} />
            </Box>
          </Box>
          <Typography variant="h6" fontWeight={700} sx={{ mt: 1.5, lineHeight: 1.3 }}>{video.title}</Typography>
          {video.description && (
            <Typography variant="body2" color="text.secondary">{video.description}</Typography>
          )}
        </Card>
      </motion.div>

      <Dialog fullWidth maxWidth="md" open={open} onClose={() => setOpen(false)} PaperProps={{ sx: { borderRadius: 3 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
          <IconButton onClick={() => setOpen(false)} aria-label="Fechar">
            <CloseIcon />
          </IconButton>
        </Box>
        <Box sx={{ px: { xs: 2, md: 3 }, pb: 3 }}>
          <VideoPlayer video={video} />
        </Box>
      </Dialog>
    </Fragment>
  );
};

export default VideoCard;