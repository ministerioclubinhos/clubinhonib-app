import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
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
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  if (!media) return null;

  const previewUrl = getMediaPreviewUrl(media);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      maxWidth={false}
      PaperProps={{
        sx: {
          width: '90vw',
          height: '85vh',
          maxWidth: '90vw',
          borderRadius: 3,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: theme.palette.primary.main,
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
      <DialogContent sx={{ p: 0 }}>
        <iframe
          src={previewUrl}
          title={media.title}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            borderBottomLeftRadius: 12,
            borderBottomRightRadius: 12,
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
