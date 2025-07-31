import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from '@mui/material';

interface Props {
  open: boolean;
  title?: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  confirmText: string;
}

export default function DeleteConfirmDialog({
  open,
  title,
  onClose,
  onConfirm,
  confirmText,
}: Props) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      aria-labelledby="delete-dialog-title"
      aria-describedby="delete-dialog-description"
    >
      <DialogTitle id="delete-dialog-title">Confirmar Exclusão</DialogTitle>
      <DialogContent>
        <Typography id="delete-dialog-description">
          {confirmText} {title && <strong>{title}</strong>}
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} aria-label="Cancelar exclusão">
          Cancelar
        </Button>
        <Button
          onClick={onConfirm}
          color="error"
          variant="contained"
          aria-label="Confirmar exclusão"
        >
          Excluir
        </Button>
      </DialogActions>
    </Dialog>
  );
}
