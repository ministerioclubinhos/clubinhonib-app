import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  useMediaQuery,
  useTheme,
  Box,
  Button,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
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
      onClose(); // fecha o modal imediatamente
    }
  }, [open, media, isMobile, onClose]);

  if (!media || (isMobile && open)) return null;

  const previewUrl = getMediaPreviewUrl(media);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={false}
      maxWidth={false}
      PaperProps={{
        sx: {
          width: '90vw',
          height: '85vh',
          maxWidth: '90vw',
          borderRadius: 3,
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: '#81d742',
          color: 'white',
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
          pr: 2,
        }}
      >
        {title || media.title}
        <IconButton onClick={onClose} size="small" sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0, flexGrow: 1 }}>
        <iframe
          src={previewUrl}
          title={media.title}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
          }}
        />
      </DialogContent>

      <Box
        sx={{
          p: 2,
          display: 'flex',
          justifyContent: 'flex-end',
          borderTop: '1px solid #ccc',
        }}
      >
        <Button variant="contained" color="primary" onClick={onClose}>
          Fechar
        </Button>
      </Box>
    </Dialog>
  );
}
