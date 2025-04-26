import { useState } from 'react';
import { Box, Typography, Button, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { MediaItem } from 'store/slices/types';
import DownloadButton from './DownloadButton';
import IdeasDocumentModal from './IdeasDocumentModal';
import { getMediaPreviewUrl } from 'utils/getMediaPreviewUrl';

interface Props {
  document: MediaItem;
}

export default function IdeasDocumentViewer({ document }: Props) {
  const [open, setOpen] = useState(false);
  const theme = useTheme();

  const previewUrl = getMediaPreviewUrl(document);
  const canPreview =
    !!previewUrl &&
    (document.isLocalFile ||
      document.uploadType === 'upload' ||
      document.platformType === 'googledrive');

  return (
    <Box sx={{ width: '100%', p: 1 }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Typography variant="subtitle1" fontWeight="bold" color={theme.palette.success.main}>
          {document.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>
          {document.description}
        </Typography>
        <Box display="flex" flexDirection="column" gap={1}>
          {canPreview && (
            <Button
              fullWidth
              variant="outlined"
              startIcon={<VisibilityIcon />}
              onClick={() => setOpen(true)}
              sx={{ borderRadius: 2 }}
            >
              Visualizar
            </Button>
          )}
          <DownloadButton
            url={document.url}
            filename={document.originalName || document.title || 'documento'}
          />
        </Box>

        <IdeasDocumentModal open={open} onClose={() => setOpen(false)} document={document} />
      </motion.div>
    </Box>
  );
}
