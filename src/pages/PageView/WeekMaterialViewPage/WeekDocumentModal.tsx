import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { MediaItem, MediaPlatform, MediaUploadType } from 'store/slices/types';

interface Props {
  open: boolean;
  onClose: () => void;
  document: MediaItem | null;
}

export default function WeekDocumentModal({ open, onClose, document }: Props) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  if (!document) return null;

  const getDropboxRawUrl = (url: string): string =>
    url.replace('www.dropbox.com', 'dl.dropboxusercontent.com').replace(/\?dl=\d.*$/, '?raw=1');

  const getFinalUrl = (): string => {
    if (document.uploadType === MediaUploadType.UPLOAD || document.isLocalFile) return document.url;
    if (document.platformType === MediaPlatform.DROPBOX) return getDropboxRawUrl(document.url);
    return document.url;
  };

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
        {document.title}
        <IconButton onClick={onClose} size="small" sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        <iframe
          src={getFinalUrl()}
          title={document.title}
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
