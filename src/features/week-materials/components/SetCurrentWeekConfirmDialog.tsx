import {
  Dialog, DialogTitle, DialogContent, DialogContentText,
  DialogActions, Button, IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface Props {
  open: boolean;
  materialTitle: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export default function SetCurrentWeekConfirmDialog({
  open, materialTitle, onClose, onConfirm,
}: Props) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ pr: 6 }}>
        Confirmar alteração
        <IconButton
          aria-label="fechar"
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          Deseja realmente tornar <strong>{materialTitle}</strong> o material da semana atual?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={onConfirm} variant="contained" color="primary">
          Confirmar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
