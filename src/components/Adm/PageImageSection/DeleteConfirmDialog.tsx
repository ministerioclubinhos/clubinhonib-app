import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';
import { SectionData } from '@/store/slices/image-section/imageSectionSlice';

interface Props {
  section: SectionData | null;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function DeleteConfirmDialog({ section, onCancel, onConfirm }: Props) {
  return (
    <Dialog open={!!section} onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle>Confirmar Exclusão</DialogTitle>
      <DialogContent>
        <Typography>
          Tem certeza que deseja excluir a seção <strong>{section?.caption || 'Sem Título'}</strong>?
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancelar</Button>
        <Button color="error" variant="contained" onClick={onConfirm}>
          Excluir
        </Button>
      </DialogActions>
    </Dialog>
  );
}