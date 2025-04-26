import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
} from '@mui/material';

interface DocumentPreviewModalProps {
  open: boolean;
  onClose: () => void;
  document: any | null;
}

const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({ open, onClose, document }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{document?.name}</DialogTitle>
      <DialogContent dividers>
        <Typography gutterBottom>
          <strong>Descrição:</strong> {document?.description || 'N/A'}
        </Typography>
        <Typography gutterBottom>
          <strong>Título da Mídia:</strong> {document?.media?.title || 'N/A'}
        </Typography>
        <Typography gutterBottom>
          <strong>Descrição da Mídia:</strong> {document?.media?.description || 'N/A'}
        </Typography>
        <Typography gutterBottom>
          <strong>URL:</strong> {document?.media?.url || 'N/A'}
        </Typography>
        <Typography gutterBottom>
          <strong>Plataforma:</strong> {document?.media?.platform || 'N/A'}
        </Typography>
        <Typography gutterBottom>
          <strong>Tipo:</strong> {document?.media?.type || 'N/A'}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fechar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default DocumentPreviewModal;
