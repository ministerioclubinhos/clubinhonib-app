import { useState } from 'react';
import { Box, Typography, Button, useTheme, useMediaQuery, IconButton, Tooltip } from '@mui/material';
import { motion } from 'framer-motion';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
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
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const previewUrl = getMediaPreviewUrl(document);
  const canPreview =
    !!previewUrl &&
    (document.isLocalFile ||
      document.uploadType === 'upload' ||
      document.platformType === 'googledrive');

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
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 }, mb: { xs: 1.5, sm: 2 } }}>
          <PictureAsPdfIcon sx={{ color: theme.palette.error.main, fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
          <Typography 
            variant="subtitle1" 
            fontWeight="bold" 
            color={theme.palette.error.main}
            sx={{ 
              fontSize: { xs: '0.85rem', sm: '0.9rem', md: '1rem' },
              lineHeight: 1.3,
            }}
          >
            {document.title}
          </Typography>
        </Box>

        {document.description && (
          <Typography 
            variant="body2" 
            color="text.secondary" 
            mb={{ xs: 1.5, sm: 2 }}
            sx={{ 
              fontSize: { xs: '0.75rem', sm: '0.8rem', md: '0.85rem' },
              lineHeight: 1.4,
              flex: 1,
            }}
          >
            {document.description}
          </Typography>
        )}

        <Box 
          sx={{ 
            display: 'flex', 
            gap: { xs: 0.5, sm: 1 },
            mt: 'auto',
            flexDirection: { xs: 'column', sm: 'row' },
          }}
        >
          {canPreview ? (
            <Button
              fullWidth={isMobile}
              variant="contained"
              size="small"
              startIcon={<VisibilityIcon />}
              onClick={() => setOpen(true)}
              sx={{ 
                borderRadius: { xs: 1.5, sm: 2 },
                fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8rem' },
                py: { xs: 0.4, sm: 0.5, md: 0.75 },
                minHeight: { xs: 28, sm: 32, md: 36 },
              }}
            >
              Visualizar
            </Button>
          ) : (
            <Tooltip title="Visualização não disponível">
              <Button
                fullWidth={isMobile}
                variant="outlined"
                size="small"
                startIcon={<VisibilityIcon />}
                disabled
                sx={{ 
                  borderRadius: 2,
                  fontSize: { xs: '0.75rem', md: '0.8rem' },
                  py: { xs: 0.5, md: 0.75 },
                  minHeight: { xs: 32, md: 36 },
                }}
              >
                Visualizar
              </Button>
            </Tooltip>
          )}
          
          <DownloadButton
            url={document.url}
            filename={document.originalName || document.title || 'documento'}
            size="small"
            fullWidth={isMobile}
          />
        </Box>

        <IdeasDocumentModal open={open} onClose={() => setOpen(false)} document={document} />
      </motion.div>
    </Box>
  );
}
