import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CloseIcon from '@mui/icons-material/Close';

interface Props {
  feedback: any | null;
  onClose: () => void;
  onConfirm: () => void;
}

const FeedbackDeleteConfirmModal: React.FC<Props> = ({ feedback, onClose, onConfirm }) => {
  if (!feedback) return null;

  return (
    <Dialog
      open={!!feedback}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3, p: 2 },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 0 }}>
          <WarningAmberIcon color="warning" />
          Confirmar Exclusão
        </DialogTitle>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      <DialogContent sx={{ mt: 2 }}>
        <Typography variant="body1" textAlign="center">
          Tem certeza que deseja excluir o feedback de{' '}
          <strong>{feedback.name}</strong>?
        </Typography>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'center', mt: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Cancelar
        </Button>
        <Button onClick={onConfirm} variant="contained" color="error">
          Excluir
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FeedbackDeleteConfirmModal;