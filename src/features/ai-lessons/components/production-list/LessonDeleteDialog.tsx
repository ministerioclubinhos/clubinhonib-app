import React from 'react';
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { DeleteOutline as DeleteIcon } from '@mui/icons-material';

import type { Lesson } from '../../types';
import { formatLessonBadgeLabel } from '../../utils';

interface Props {
  lesson: Lesson | null;
  pending: boolean;
  error: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}

/** Confirma a exclusão de uma lição; a recusa da API aparece aqui dentro. */
export const LessonDeleteDialog: React.FC<Props> = ({ lesson, pending, error, onCancel, onConfirm }) => (
  <Dialog
    data-testid="ai-lessons-delete-dialog"
    open={Boolean(lesson)}
    onClose={() => !pending && onCancel()}
    maxWidth="xs"
    fullWidth
    slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}
  >
    <DialogTitle sx={{ fontWeight: 800 }}>Excluir lição?</DialogTitle>
    <DialogContent>
      <DialogContentText color="text.secondary">
        Tem certeza que deseja excluir <strong>{lesson?.theme}</strong> (
        {lesson ? formatLessonBadgeLabel(lesson) : ''})?
      </DialogContentText>
      <DialogContentText color="error.main" sx={{ mt: 1.5, fontWeight: 600, fontSize: '0.875rem' }}>
        Esta ação não pode ser desfeita. As {lesson?.stages?.length ?? ''} etapas, as versões
        geradas, os comentários e as imagens serão removidos.
      </DialogContentText>
      {error && (
        <Alert data-testid="ai-lessons-delete-error" severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </DialogContent>
    <DialogActions sx={{ px: 3, pb: 2 }}>
      <Button
        onClick={onCancel}
        disabled={pending}
        sx={{ borderRadius: 2, fontWeight: 600, textTransform: 'none', minHeight: 44 }}
      >
        Cancelar
      </Button>
      <Button
        onClick={onConfirm}
        variant="contained"
        color="error"
        disabled={pending}
        startIcon={pending ? <CircularProgress size={16} color="inherit" /> : <DeleteIcon />}
        sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none', minHeight: 44 }}
      >
        {pending ? 'Excluindo...' : 'Excluir tudo'}
      </Button>
    </DialogActions>
  </Dialog>
);
