import { useEffect, useRef, useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import SaveOutlinedIcon from '@mui/icons-material/Save';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid2,
  IconButton,
  Stack,
  Switch,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';

import { FEATURE_FLAG_AUDIENCE_OPTIONS } from '../constants';
import type {
  FeatureFlagAudience,
  FeatureFlagFormValues,
  FeatureFlagResponse,
} from '../types';
import {
  audienceInfo,
  hasErrors,
  isKeyUsedByApp,
  toFormValues,
  validateForm,
} from '../utils';

interface Props {
  open: boolean;
  /** `null` cria; uma flag edita. */
  flag: FeatureFlagResponse | null;
  saving: boolean;
  error: string;
  onDismissError: () => void;
  onClose: () => void;
  onSubmit: (values: FeatureFlagFormValues) => Promise<boolean>;
}

const NO_ERRORS = { key: false, name: false, metadataJson: false };

/** Formulário de criação e edição de feature flag. */
export default function FeatureFlagFormDialog({
  open,
  flag,
  saving,
  error,
  onDismissError,
  onClose,
  onSubmit,
}: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [values, setValues] = useState<FeatureFlagFormValues>(() =>
    toFormValues(flag),
  );
  const [errors, setErrors] = useState(NO_ERRORS);

  const isEditing = Boolean(flag?.key);

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
    setValues(toFormValues(flag));
    setErrors(NO_ERRORS);
    dismissError.current();
  }, [open, flag]);

  const setValue = <K extends keyof FeatureFlagFormValues>(
    key: K,
    value: FeatureFlagFormValues[K],
  ) => setValues((previous) => ({ ...previous, [key]: value }));

  const handleSubmit = async () => {
    const nextErrors = validateForm(values);
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;

    const saved = await onSubmit(values);
    if (saved) onClose();
  };

  const selected = audienceInfo(values.audience);

  // Renomear uma chave que o código procura desliga o recurso na tela até o
  // código apontar para a chave nova.
  const renamingUsedKey = Boolean(
    flag && flag.key !== values.key && isKeyUsedByApp(flag.key),
  );

  return (
    <Dialog data-testid="feature-flags-feature-flag-form-dialog"
      open={open}
      onClose={saving ? undefined : onClose}
      maxWidth="md"
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
          px: { xs: 2, sm: 3 },
          fontSize: { xs: '1.05rem', sm: '1.25rem' },
        }}
      >
        {isEditing ? 'Editar feature flag' : 'Nova feature flag'}
        <IconButton
          onClick={onClose}
          disabled={saving}
          aria-label="Fechar"
          sx={{ minWidth: { xs: 44, sm: 'auto' }, minHeight: { xs: 44, sm: 'auto' } }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ px: { xs: 2, sm: 3 } }}>
        {error ? (
          <Alert severity="error" sx={{ mb: 2 }} onClose={onDismissError}>
            {error}
          </Alert>
        ) : null}

        <Grid2 container spacing={2}>
          <Grid2 size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              label="Chave"
              value={values.key}
              onChange={(event) =>
                setValue('key', event.target.value.toLowerCase())
              }
              disabled={saving}
              error={errors.key}
              helperText={
                errors.key
                  ? 'Use letras minúsculas, números e "_".'
                  : 'É por ela que o código pergunta pela flag.'
              }
            />
          </Grid2>

          <Grid2 size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              size="small"
              label="Nome"
              value={values.name}
              onChange={(event) => setValue('name', event.target.value)}
              error={errors.name}
              helperText={errors.name ? 'Informe um nome.' : ' '}
              disabled={saving}
            />
          </Grid2>

          <Grid2 size={12}>
            <TextField
              fullWidth
              size="small"
              label="Descrição"
              multiline
              rows={2}
              value={values.description}
              onChange={(event) => setValue('description', event.target.value)}
              disabled={saving}
            />
          </Grid2>

          <Grid2 size={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={values.enabled}
                  onChange={(event) => setValue('enabled', event.target.checked)}
                  disabled={saving}
                />
              }
              label={values.enabled ? 'Ligada' : 'Desligada'}
              sx={{ mt: 0.5 }}
            />
          </Grid2>
        </Grid2>

        {renamingUsedKey ? (
          <Alert severity="warning" sx={{ mt: 1 }}>
            A chave <strong>{flag?.key}</strong> é consultada pela aplicação.
            Renomeá-la desliga o recurso na tela até o código passar a procurar
            pela chave nova.
          </Alert>
        ) : null}

        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" fontWeight={700}>
            Quem enxerga a flag
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', mb: 1.5 }}
          >
            {selected.description}
          </Typography>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {FEATURE_FLAG_AUDIENCE_OPTIONS.map((option) => {
              const active = option.value === values.audience;

              return (
                <Chip
                  key={option.value}
                  label={option.label}
                  color={active ? option.color : 'default'}
                  variant={active ? 'filled' : 'outlined'}
                  disabled={saving}
                  onClick={() =>
                    setValue('audience', option.value as FeatureFlagAudience)
                  }
                  sx={{
                    borderRadius: 999,
                    fontWeight: active ? 700 : 400,
                    // Alvo de toque confortável no celular.
                    height: { xs: 40, sm: 32 },
                  }}
                />
              );
            })}
          </Stack>
        </Box>

        <Box sx={{ mt: 3 }}>
          <TextField
            fullWidth
            size="small"
            label="Metadata (JSON)"
            multiline
            rows={3}
            value={values.metadataJson}
            onChange={(event) => setValue('metadataJson', event.target.value)}
            error={errors.metadataJson}
            helperText={
              errors.metadataJson
                ? 'Informe um objeto JSON válido, ou deixe vazio.'
                : 'Opcional. Ex.: {"rollout": 50}'
            }
            disabled={saving}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: { xs: 2, sm: 3 }, py: 2, gap: 1, flexWrap: 'wrap' }}>
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
          {isEditing ? 'Salvar alterações' : 'Criar flag'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
