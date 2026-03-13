import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  useMediaQuery,
  useTheme,
  Box,
  Button,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import { useEffect } from 'react';
import { MediaItem } from 'store/slices/types';
import { getMediaPreviewUrl } from './getMediaPreviewUrl';

interface Props {
  open: boolean;
  onClose: () => void;
  media: MediaItem | null;
  title?: string;
}

export default function MediaDocumentPreviewModal({ open, onClose, media, title }: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    if (open && media && isMobile) {
      const url = getMediaPreviewUrl(media);
      window.open(url, '_blank');
      onClose();
    }
  }, [open, media, isMobile, onClose]);

  if (!media || (isMobile && open)) return null;

  const previewUrl = getMediaPreviewUrl(media);
  const displayTitle = title || media.title || 'Visualizar documento';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xl"
      PaperProps={{
        sx: {
          width: '95%',
          maxHeight: '95vh',
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: 24,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 3,
          py: 2,
          bgcolor: '#81d742',
          color: 'white',
          fontWeight: 700,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <DescriptionOutlinedIcon />
          {displayTitle}
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0, bgcolor: 'grey.100', minHeight: 480 }}>
        {previewUrl ? (
          <Box
            component="iframe"
            src={previewUrl}
            title={displayTitle}
            sx={{
              width: '100%',
              height: '78vh',
              border: 'none',
              display: 'block',
            }}
          />
        ) : (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 400,
              color: 'text.secondary',
              px: 3,
            }}
          >
            <DescriptionOutlinedIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Nenhum documento disponível
            </Typography>
            <Typography variant="body2">
              Não há URL ou arquivo vinculado para visualização.
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button onClick={onClose} variant="contained" sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, bgcolor: '#81d742', '&:hover': { bgcolor: '#6bb83a' } }}>
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
