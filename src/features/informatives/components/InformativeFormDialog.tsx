import { useEffect, useRef, useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Switch,
  TextField,
  useMediaQuery,
  useTheme,
} from '@mui/material';

import { FORM_VALIDATION_MESSAGES } from '@/constants/errorMessages';

import type { InformativeFormValues, InformativeResponse } from '../types';
import { hasErrors, toFormValues, validateForm } from '../utils';

interface Props {
  open: boolean;
  /** `null` cria; um informativo edita. */
  informative: InformativeResponse | null;
  saving: boolean;
  error: string;
  onDismissError: () => void;
  onClose: () => void;
  onSubmit: (values: InformativeFormValues) => Promise<boolean>;
}

const NO_ERRORS = { title: false, description: false };

/** Formulário de criação e edição de informativo. */
export default function InformativeFormDialog({
  open,
  informative,
  saving,
  error,
  onDismissError,
  onClose,
  onSubmit,
}: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [values, setValues] = useState<InformativeFormValues>(() =>
    toFormValues(informative),
  );
  const [errors, setErrors] = useState(NO_ERRORS);

  const isEditing = Boolean(informative?.id);

  /**
   * O callback de erro chega recriado a cada render do gerenciador, e estava
   * entre as dependências do efeito abaixo. Com isso, qualquer re-render com o
   * diálogo aberto — a busca assentando, a listagem recarregando — repunha os
   * valores do servidor por cima do que já havia sido digitado, e a pessoa
   * salvava sem o campo que acabara de escrever. A ref tira a identidade do
   * callback da conta: o efeito volta a depender só da abertura e do registro
   * em edição.
   */
  const dismissError = useRef(onDismissError);
  useEffect(() => {
    dismissError.current = onDismissError;
  });

  useEffect(() => {
    if (!open) return;
    setValues(toFormValues(informative));
    setErrors(NO_ERRORS);
    dismissError.current();
  }, [open, informative]);

  const setValue = <K extends keyof InformativeFormValues>(
    key: K,
    value: InformativeFormValues[K],
  ) => setValues((previous) => ({ ...previous, [key]: value }));

  const handleSubmit = async () => {
    const nextErrors = validateForm(values);
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;

    const saved = await onSubmit(values);
    if (saved) onClose();
  };

  return (
    <Dialog data-testid="informatives-informative-form-dialog"
      open={open}
      onClose={saving ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
      slotProps={{ paper: { sx: { borderRadius: isMobile ? 0 : 3 } } }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          fontWeight: 700,
        }}
      >
        {isEditing ? 'Editar informativo' : 'Novo informativo'}
        <IconButton
          onClick={onClose}
          disabled={saving}
          aria-label="Fechar"
          sx={{ minWidth: { xs: 44, sm: 'auto' }, minHeight: { xs: 44, sm: 'auto' } }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {error ? (
          <Alert severity="error" sx={{ mb: 2 }} onClose={onDismissError}>
            {error}
          </Alert>
        ) : null}

        <TextField
          fullWidth
          label="Título"
          value={values.title}
          onChange={(event) => setValue('title', event.target.value)}
          error={errors.title}
          helperText={errors.title ? FORM_VALIDATION_MESSAGES.REQUIRED_FIELD : ' '}
          disabled={saving}
          sx={{ mt: 1 }}
        />

        <TextField
          fullWidth
          label="Descrição"
          multiline
          rows={4}
          value={values.description}
          onChange={(event) => setValue('description', event.target.value)}
          error={errors.description}
          helperText={
            errors.description ? FORM_VALIDATION_MESSAGES.REQUIRED_FIELD : ' '
          }
          disabled={saving}
        />

        <FormControlLabel
          control={
            <Switch
              checked={values.public}
              onChange={(event) => setValue('public', event.target.checked)}
              disabled={saving}
            />
          }
          label={
            values.public
              ? 'Publicado — aparece para todos'
              : 'Rascunho — visível apenas no painel'
          }
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, gap: 1, flexWrap: 'wrap' }}>
        <Button
          onClick={onClose}
          disabled={saving}
          fullWidth={isMobile}
          sx={{ minHeight: 44, textTransform: 'none' }}
        >
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={() => void handleSubmit()}
          disabled={saving}
          startIcon={
            saving ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              <SaveOutlinedIcon />
            )
          }
          fullWidth={isMobile}
          sx={{ minHeight: 44, textTransform: 'none', fontWeight: 700 }}
        >
          {isEditing ? 'Salvar alterações' : 'Criar informativo'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
