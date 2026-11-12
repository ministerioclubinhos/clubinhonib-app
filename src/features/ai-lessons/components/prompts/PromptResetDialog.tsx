import React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';

interface Props {
  open: boolean;
  stageLabel: string;
  /** Há texto digitado e não salvo nesta etapa. */
  hasUnsavedText: boolean;
  pending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

/** Confirma a volta de uma etapa ao padrão oficial — só para quem está logado. */
export const PromptResetDialog: React.FC<Props> = ({
  open,
  stageLabel,
  hasUnsavedText,
  pending,
  onCancel,
  onConfirm,
}) => (
  <Dialog
    data-testid="admin-prompt-page-reset-dialog"
    aria-labelledby="admin-prompts-reset-title"
    open={open}
    onClose={() => {
      if (!pending) onCancel();
    }}
    maxWidth="xs"
    fullWidth
    slotProps={{
      paper: {
        sx: {
          borderRadius: { xs: 2, sm: 3 },
          m: { xs: 1.5, sm: 4 },
          width: { xs: 'calc(100% - 24px)', sm: '100%' },
        },
      },
    }}
  >
    <DialogTitle id="admin-prompts-reset-title" sx={{ fontWeight: 800 }}>
      Voltar ao padrão oficial?
    </DialogTitle>
    <DialogContent>
      <DialogContentText color="text.secondary">
        A sua orientação para <strong>{stageLabel}</strong> será removida, e as suas próximas
        gerações desta etapa usarão só as regras oficiais. Isso não afeta os outros administradores.
      </DialogContentText>
      {hasUnsavedText && (
        <DialogContentText
          data-testid="admin-prompts-reset-unsaved-warning"
          color="warning.main"
          sx={{ mt: 1.5, fontWeight: 600 }}
        >
          O texto que você digitou e ainda não salvou nesta etapa também será descartado.
        </DialogContentText>
      )}
    </DialogContent>
    <DialogActions
      sx={{
        px: { xs: 2, sm: 3 },
        pb: 2,
        flexDirection: { xs: 'column-reverse', sm: 'row' },
        '& > :not(style) ~ :not(style)': { ml: { xs: 0, sm: 1 }, mt: { xs: 1, sm: 0 } },
        '& .MuiButton-root': { width: { xs: '100%', sm: 'auto' }, minHeight: 44 },
      }}
    >
      <Button disabled={pending} onClick={onCancel} sx={{ borderRadius: 2, fontWeight: 600, textTransform: 'none' }}>
        Cancelar
      </Button>
      <Button
        data-testid="admin-prompts-reset-confirm"
        color="warning"
        variant="contained"
        onClick={onConfirm}
        disabled={pending}
        sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none' }}
      >
        {pending ? 'Removendo…' : 'Voltar ao padrão'}
      </Button>
    </DialogActions>
  </Dialog>
);
