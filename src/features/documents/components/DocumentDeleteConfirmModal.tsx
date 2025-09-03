import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Button } from '@mui/material';
import { DocumentItem } from '../types';

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  document: Pick<DocumentItem, 'id' | 'name'> | null;
}

const DocumentDeleteConfirmModal: React.FC<Props> = ({ open, onClose, onConfirm, document }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs">
      <DialogTitle>Confirmar Exclusão</DialogTitle>
      <DialogContent dividers>
        <Typography>
          Deseja excluir o documento <strong>{document?.name}</strong>?
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={onConfirm} color="error" variant="contained">
          Excluir
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DocumentDeleteConfirmModal;
