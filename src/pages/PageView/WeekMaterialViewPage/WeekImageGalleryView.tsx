import { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  useTheme, 
  useMediaQuery,
  Chip,
  Stack,
  Dialog,
  DialogContent,
  IconButton,
  Zoom,
} from '@mui/material';
import { motion } from 'framer-motion';
import ImageIcon from '@mui/icons-material/Image';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import CloseIcon from '@mui/icons-material/Close';
import DownloadButton from './DownloadButton';
import { MediaItem, MediaUploadType, MediaPlatform } from 'store/slices/types';

interface Props {
  image: MediaItem;
}

const getGoogleDriveThumbnailUrl = (url: string): string | null => {
  const match = url.match(/\/d\/(.*?)\//);
  return match ? `https://drive.google.com/thumbnail?id=${match[1]}` : null;
};

export default function WeekImageGallery({ image }: Props) {
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const canVisualize =
    image.isLocalFile ||
    image.uploadType === MediaUploadType.UPLOAD ||
    image.platformType === MediaPlatform.GOOGLE_DRIVE;

  const getImageUrl = (): string | null => {
    if (image.isLocalFile || image.uploadType === MediaUploadType.UPLOAD) {
      return image.url;
    }
    if (image.platformType === MediaPlatform.GOOGLE_DRIVE) {
      return getGoogleDriveThumbnailUrl(image.url);
    }
    return null;
  };

  const finalUrl = getImageUrl();
  const fileSize = image.size ? `${(image.size / 1024 / 1024).toFixed(1)} MB` : null;

  const handleImageClick = () => {
    if (canVisualize && finalUrl) {
      setOpen(true);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2 }}
        transition={{ duration: 0.3 }}
      >
        <Paper
          elevation={3}
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: { xs: 3, md: 4 },
            border: `2px solid ${theme.palette.success.main}20`,
            background: 'linear-gradient(135deg, #ffffff 0%, #f1f8e9 100%)',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            transition: 'all 0.3s ease',
            '&:hover': {
              elevation: 6,
              transform: 'translateY(-2px)',
              borderColor: theme.palette.success.main,
            },
          }}
        >
          {/* Header */}
          <Box
            display="flex"
            alignItems="center"
            gap={2}
            mb={3}
          >
            <Box
              sx={{
                p: 2,
                borderRadius: 3,
                bgcolor: 'success.main',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ImageIcon sx={{ fontSize: { xs: '1.5rem', md: '2rem' } }} />
            </Box>
            
            <Box flex={1}>
              <Typography
                variant="h6"
                fontWeight="bold"
                color="success.main"
                sx={{
                  fontSize: { xs: '1.1rem', md: '1.3rem' },
                  mb: 0.5,
                  lineHeight: 1.3,
                }}
              >
                {image.title}
              </Typography>
              
              {fileSize && (
                <Chip
                  label={fileSize}
                  size="small"
                  sx={{
                    bgcolor: 'success.light',
                    color: 'white',
                    fontSize: '0.75rem',
                  }}
                />
              )}
            </Box>
          </Box>

          {/* Image */}
          <Box
            sx={{
              mb: 3,
              borderRadius: 3,
              overflow: 'hidden',
              position: 'relative',
              cursor: canVisualize && finalUrl ? 'pointer' : 'default',
              '&:hover': canVisualize && finalUrl ? {
                '& .zoom-overlay': {
                  opacity: 1,
                },
              } : {},
            }}
            onClick={handleImageClick}
          >
            {canVisualize && finalUrl ? (
              <>
                <Box
                  component="img"
                  src={finalUrl}
                  alt={image.title || 'Imagem'}
                  sx={{
                    width: '100%',
                    height: { xs: 200, md: 250 },
                    objectFit: 'cover',
                    display: 'block',
                    transition: 'transform 0.3s ease',
                  }}
                />
                <Box
                  className="zoom-overlay"
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    bgcolor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: 0,
                    transition: 'opacity 0.3s ease',
                  }}
                >
                  <ZoomInIcon sx={{ color: 'white', fontSize: '2rem' }} />
                </Box>
              </>
            ) : (
              <Box
                sx={{
                  width: '100%',
                  height: { xs: 200, md: 250 },
                  bgcolor: 'grey.100',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 3,
                  border: '2px dashed',
                  borderColor: 'grey.300',
                }}
              >
                <Typography color="text.secondary" textAlign="center">
                  📷<br />
                  Visualização não disponível
                </Typography>
              </Box>
            )}
          </Box>

          {/* Description */}
          {image.description && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 3,
                lineHeight: 1.6,
                fontSize: { xs: '0.9rem', md: '1rem' },
                flex: 1,
              }}
            >
              {image.description}
            </Typography>
          )}

          {/* Download Button */}
          <Box sx={{ mt: 'auto' }}>
            <DownloadButton
              url={image.url}
              filename={image.originalName || image.title || 'imagem'}
              size={isMobile ? 'medium' : 'large'}
              fullWidth
            />
          </Box>
        </Paper>
      </motion.div>

      {/* Full Screen Image Dialog */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'transparent',
            boxShadow: 'none',
          },
        }}
      >
        <DialogContent
          sx={{
            p: 0,
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '80vh',
          }}
        >
          <IconButton
            onClick={() => setOpen(false)}
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
          
          {finalUrl && (
            <Zoom in={open} timeout={300}>
              <Box
                component="img"
                src={finalUrl}
                alt={image.title || 'Imagem'}
                sx={{
                  maxWidth: '100%',
                  maxHeight: '90vh',
                  objectFit: 'contain',
                  borderRadius: 2,
                }}
              />
            </Zoom>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}