import { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  useTheme, 
  useMediaQuery,
  Chip,
  Stack,
} from '@mui/material';
import { motion } from 'framer-motion';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DescriptionIcon from '@mui/icons-material/Description';
import DownloadButton from './DownloadButton';
import { MediaItem } from 'store/slices/types';
import { getMediaPreviewUrl } from 'utils/getMediaPreviewUrl';
import MediaDocumentPreviewModal from 'utils/MediaDocumentPreviewModal';

interface Props {
  document: MediaItem;
}

export default function WeekDocumentViewer({ document }: Props) {
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const previewUrl = getMediaPreviewUrl(document);
  const fileSize = document.size ? `${(document.size / 1024 / 1024).toFixed(1)} MB` : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.3 }}
    >
      <Paper
        elevation={3}
        sx={{
          p: { xs: 2, md: 4 },
          borderRadius: { xs: 3, md: 4 },
          border: `2px solid ${theme.palette.primary.main}20`,
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.3s ease',
          '&:hover': {
            elevation: 6,
            transform: 'translateY(-2px)',
            borderColor: theme.palette.primary.main,
          },
        }}
      >
        {/* Header */}
        <Box
          display="flex"
          alignItems="center"
          gap={2}
          mb={{ xs: 2, md: 3 }}
        >
          <Box
            sx={{
              p: 2,
              borderRadius: 3,
              bgcolor: 'primary.main',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <DescriptionIcon sx={{ fontSize: { xs: '1.5rem', md: '2rem' } }} />
          </Box>
          
          <Box flex={1}>
            <Typography
              variant="h6"
              fontWeight="bold"
              color="primary.main"
              sx={{
                fontSize: { xs: '1.1rem', md: '1.3rem' },
                mb: 0.5,
                lineHeight: 1.3,
              }}
            >
              {document.title}
            </Typography>
            
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
        </Box>

        {document.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: { xs: 2, md: 3 },
              lineHeight: 1.6,
              fontSize: { xs: '0.9rem', md: '1rem' },
              flex: 1,
            }}
          >
            {document.description}
          </Typography>
        )}

        <Stack
          spacing={{ xs: 1.5, md: 2 }}
          sx={{ mt: 'auto' }}
        >
          {previewUrl ? (
            <Button
              fullWidth
              variant="contained"
              startIcon={<VisibilityIcon />}
              onClick={() => setOpen(true)}
              sx={{
                py: { xs: 1, md: 2 },
                px: { xs: 1, md: 3 },
                fontSize: { xs: '0.8rem', md: '1rem' },
                fontWeight: 'bold',
                borderRadius: 3,
                textTransform: 'none',
                background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
                minHeight: { xs: 36, md: 48 },
                '&:hover': {
                  background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                  transform: 'translateY(-1px)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Visualizar Documento
            </Button>
          ) : (
            <Button
              fullWidth
              variant="outlined"
              disabled
              sx={{
                py: { xs: 1, md: 2 },
                px: { xs: 1, md: 3 },
                fontSize: { xs: '0.8rem', md: '1rem' },
                fontWeight: 'bold',
                borderRadius: 3,
                textTransform: 'none',
                borderColor: 'grey.400',
                color: 'grey.500',
                minHeight: { xs: 36, md: 48 },
              }}
            >
              Visualização não disponível
            </Button>
          )}
          
          <DownloadButton
            url={document.url}
            filename={document.originalName || document.title || 'documento'}
            size={isMobile ? 'medium' : 'large'}
            fullWidth
          />
        </Stack>

        <MediaDocumentPreviewModal 
          open={open} 
          onClose={() => setOpen(false)} 
          media={document} 
          title={document.title}
        />
      </Paper>
    </motion.div>
  );
}