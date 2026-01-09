import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
} from '@mui/material';
import { DocumentItem } from '../types';
import { mediaTypeLabel, platformLabel, uploadTypeLabel } from '../utils';

interface Props {
  open: boolean;
  onClose: () => void;
  document: DocumentItem | null;
}

const DocumentPreviewModal: React.FC<Props> = ({ open, onClose, document }) => {
  const m = document?.media;
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{document?.name}</DialogTitle>
      <DialogContent dividers>
        <Typography gutterBottom>
          <strong>Descrição:</strong> {document?.description || 'N/A'}
        </Typography>
        <Typography gutterBottom>
          <strong>Título da Mídia:</strong> {m?.title || 'N/A'}
        </Typography>
        <Typography gutterBottom>
          <strong>Descrição da Mídia:</strong> {m?.description || 'N/A'}
        </Typography>
        <Typography gutterBottom>
          <strong>URL:</strong> {m?.url || 'N/A'}
        </Typography>
        <Typography gutterBottom>
          <strong>Plataforma:</strong> {platformLabel(m?.platformType)}
        </Typography>
        <Typography gutterBottom>
          <strong>Tipo de Upload:</strong> {uploadTypeLabel(m?.uploadType)}
        </Typography>
        <Typography gutterBottom>
          <strong>Tipo de Mídia:</strong> {mediaTypeLabel(m?.mediaType)}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fechar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default DocumentPreviewModal;
