import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box } from '@mui/material';

interface Props {
  mediaUrl: string | null;
  onClose: () => void;
}

export default function MediaPreviewDialog({ mediaUrl, onClose }: Props) {
  return (
    <Dialog open={!!mediaUrl} onClose={onClose} fullWidth maxWidth="xl">
      <DialogTitle>Meditação da Semana</DialogTitle>
      <DialogContent>
        <Box sx={{ width: '70vw', height: '70vh', mx: 'auto' }}>
          <iframe
            src={mediaUrl || ''}
            width="100%"
            height="100%"
            allow="autoplay"
            title="Documento"
            style={{ border: 'none' }}
          />
        </Box>
      </DialogContent>
      <DialogActions><Button onClick={onClose}>Fechar</Button></DialogActions>
    </Dialog>
  );
}
