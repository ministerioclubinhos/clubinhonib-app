import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface DocumentViewModalProps {
  open: boolean;
  onClose: () => void;
  document: {
    id: string;
    name: string;
    media?: {
      url: string;
    };
  } | null;
}

const DocumentViewModal: React.FC<DocumentViewModalProps> = ({ open, onClose, document }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xl"
      sx={{ '& .MuiDialog-paper': { width: '90%' } }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pr: 2,
        }}
      >
        Visualizar Documento
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {document?.media?.url ? (
          <iframe
            src={document.media.url}
            style={{ width: '100%', height: '80vh', border: 'none' }}
            title="Visualização do Documento"
          />
        ) : (
          <Typography>Não há documento disponível para visualização.</Typography>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Fechar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default DocumentViewModal;
