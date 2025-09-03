import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { DocumentItem } from '../types';

interface Props {
  open: boolean;
  onClose: () => void;
  document: DocumentItem | null;
}

const DocumentViewModal: React.FC<Props> = ({ open, onClose, document }) => {
  const url = document?.media?.url;
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xl" sx={{ '& .MuiDialog-paper': { width: '90%' } }}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pr: 2 }}>
        Visualizar Documento
        <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {url ? (
          <iframe src={url} style={{ width: '100%', height: '80vh', border: 'none' }} title="Visualização do Documento" />
        ) : (
          <Typography>Não há documento disponível para visualização.</Typography>
        )}
      </DialogContent>

      <DialogActions><Button onClick={onClose}>Fechar</Button></DialogActions>
    </Dialog>
  );
};

export default DocumentViewModal;
