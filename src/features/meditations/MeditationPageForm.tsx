import { useState } from 'react';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  CircularProgress,
  Grid2,
  Paper,
  Snackbar,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { useNavigate, useParams } from 'react-router-dom';

import { SimpleDatePicker } from '@/components/common/inputs';
import { FORM_VALIDATION_MESSAGES } from '@/constants/errorMessages';

import MeditationDaysEditor from './components/MeditationDaysEditor';
import MeditationMediaField from './components/MeditationMediaField';
import { MEDITATION_DAYS_COUNT, MEDITATION_ROUTES } from './constants';
import {
  useMeditationById,
  useMeditationForm,
  useUnsavedChangesGuard,
} from './hooks';
import { isFriday, isMonday } from './utils';

interface MeditationPageFormProps {
  /** True quando o admin cria a meditação a partir da galeria de modelos. */
  fromTemplatePage?: boolean;
}

/** Formulário usado para criar e para editar a meditação da semana. */
export default function MeditationPageForm({
  fromTemplatePage = false,
}: MeditationPageFormProps) {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // A meditação vem do id na URL. Antes ela vinha do store, que não é
  // persistido: um F5 direto nesta rota abria o formulário vazio.
  const { id } = useParams<{ id: string }>();
  const {
    meditation: loadedMeditation,
    loading: loadingMeditation,
    error: loadError,
  } = useMeditationById(fromTemplatePage ? undefined : id);

  const [hasDayDraft, setHasDayDraft] = useState(false);

  const isMissingMeditation =
    !fromTemplatePage && !loadingMeditation && !loadedMeditation;

  const {
    values,
    setValue,
    days,
    setDays,
    errors,
    isDirty,
    saving,
    feedback,
    dismissFeedback,
    save,
  } = useMeditationForm({
    isCreation: fromTemplatePage,
    meditation: loadedMeditation,
  });

  useUnsavedChangesGuard(isDirty || hasDayDraft);

  const startDateInvalid = Boolean(values.startDate) && !isMonday(values.startDate);
  const endDateInvalid = Boolean(values.endDate) && !isFriday(values.endDate);
  const daysMissing = MEDITATION_DAYS_COUNT - days.length;

  if (loadingMeditation) {
    return (
      <Box data-testid="meditations-meditation-page-form"
        component="section"
        sx={{ py: { xs: 4, md: 6 }, display: 'flex', justifyContent: 'center' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (isMissingMeditation) {
    return (
      <Box data-testid="meditations-meditation-page-form" component="section" sx={{ py: { xs: 2, md: 3 } }}>
        <Alert
          severity="info"
          action={
            <Button
              color="inherit"
              size="small"
              type="button"
              onClick={() => navigate(MEDITATION_ROUTES.MANAGE)}
            >
              Ver meditações
            </Button>
          }
        >
          <AlertTitle>Meditação não encontrada</AlertTitle>
          {loadError || 'Abra a meditação que você quer editar pela lista.'}
        </Alert>
      </Box>
    );
  }

  return (
    <Box data-testid="meditations-meditation-page-form" component="section" sx={{ pb: { xs: 2, md: 3 } }}>
      {!fromTemplatePage && (
        <Typography variant="h5" fontWeight={700} sx={{ mb: { xs: 2, md: 3 } }}>
          Editar Meditação
        </Typography>
      )}

      <Paper
        variant="outlined"
        sx={{ p: { xs: 2, md: 3 }, borderRadius: 2, mb: { xs: 2, md: 3 } }}
      >
        <Typography variant="subtitle1" fontWeight={700}>
          Informações da meditação
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
          A semana vai de segunda a sexta-feira.
        </Typography>

        <Grid2 container spacing={2}>
          <Grid2 size={12}>
            <TextField
              label="Tema da Meditação"
              fullWidth
              required
              value={values.topic}
              onChange={(event) => setValue('topic', event.target.value)}
              error={errors.topic}
              helperText={
                errors.topic ? FORM_VALIDATION_MESSAGES.REQUIRED_FIELD : ''
              }
            />
          </Grid2>

          <Grid2 size={{ xs: 12, sm: 6 }}>
            <SimpleDatePicker
              value={values.startDate}
              onChange={(value) => setValue('startDate', value)}
              label="Data de Início"
              margin="none"
            />
            {startDateInvalid && (
              <Typography variant="caption" color="error">
                {FORM_VALIDATION_MESSAGES.MEDITATION_DATE_MONDAY}
              </Typography>
            )}
          </Grid2>

          <Grid2 size={{ xs: 12, sm: 6 }}>
            <SimpleDatePicker
              value={values.endDate}
              onChange={(value) => setValue('endDate', value)}
              label="Data de Término"
              margin="none"
            />
            {endDateInvalid && (
              <Typography variant="caption" color="error">
                {FORM_VALIDATION_MESSAGES.MEDITATION_DATE_FRIDAY}
              </Typography>
            )}
          </Grid2>
        </Grid2>
      </Paper>

      <Paper
        variant="outlined"
        sx={{ p: { xs: 2, md: 3 }, borderRadius: 2, mb: { xs: 2, md: 3 } }}
      >
        <Typography variant="subtitle1" fontWeight={700}>
          Documento da meditação
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
          Material que os professores abrem junto da meditação.
        </Typography>

        <MeditationMediaField
          values={values}
          onChange={setValue}
          savedFileName={loadedMeditation?.media?.originalName}
        />
      </Paper>

      <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 2 }}>
        <Typography variant="subtitle1" fontWeight={700}>
          Dias da meditação
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
          Informe o tema e o versículo de cada dia, de segunda a sexta.
        </Typography>

        <MeditationDaysEditor
          days={days}
          onChange={setDays}
          onDraftChange={setHasDayDraft}
        />
      </Paper>

      <Paper
        variant="outlined"
        sx={{
          position: 'sticky',
          bottom: 0,
          zIndex: 2,
          mt: { xs: 2, md: 3 },
          px: { xs: 2, md: 3 },
          py: { xs: 1.5, md: 2 },
          pb: { xs: 'calc(12px + env(safe-area-inset-bottom))', md: 2 },
          borderRadius: 2,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'stretch', sm: 'center' },
          justifyContent: 'space-between',
          gap: { xs: 1.25, sm: 2 },
        }}
      >
        <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
          <Typography
            variant="body2"
            color={daysMissing > 0 ? 'text.secondary' : 'success.main'}
          >
            {daysMissing > 0
              ? `Faltam ${daysMissing} ${daysMissing === 1 ? 'dia' : 'dias'} para completar a semana`
              : 'Semana completa'}
          </Typography>
        </Box>

        <Button
          variant="contained"
          size="large"
          type="button"
          onClick={save}
          disabled={saving}
          fullWidth={isMobile}
          startIcon={
            saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />
          }
          sx={{ minHeight: 44, textTransform: 'none', px: 3 }}
        >
          {saving ? 'Salvando...' : 'Salvar Meditação'}
        </Button>
      </Paper>

      <Snackbar
        open={Boolean(feedback)}
        autoHideDuration={4000}
        onClose={dismissFeedback}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={feedback?.severity ?? 'success'} variant="filled">
          {feedback?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
