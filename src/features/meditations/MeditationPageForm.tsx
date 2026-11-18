import { useState } from 'react';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { ArrowBack, CheckCircleOutline, Save, SelfImprovementOutlined } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';

import { SimpleDatePicker } from '@/components/common/inputs';
import { FORM_VALIDATION_MESSAGES } from '@/constants/errorMessages';
import UnsavedChangesDialog from '@/components/common/modal/UnsavedChangesDialog';
import { useGuardedExit } from '@/hooks';

import MeditationDaysEditor from './components/MeditationDaysEditor';
import MeditationMediaField from './components/MeditationMediaField';
import { MEDITATION_DAYS_COUNT, MEDITATION_ROUTES } from './constants';
import { useMeditationById, useMeditationForm, useUnsavedChangesGuard } from './hooks';
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

  // A meditação vem do id na URL. Antes ela vinha do store, que não é
  // persistido: um F5 direto nesta rota abria o formulário vazio.
  const { id } = useParams<{ id: string }>();
  const {
    meditation: loadedMeditation,
    loading: loadingMeditation,
    error: loadError,
    retry,
  } = useMeditationById(fromTemplatePage ? undefined : id);

  const [hasDayDraft, setHasDayDraft] = useState(false);

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

  useUnsavedChangesGuard(isDirty || hasDayDraft || saving);
  // Sair pelo botão da própria tela passa pela mesma confirmação do menu.
  const exit = useGuardedExit(isDirty || hasDayDraft || saving, MEDITATION_ROUTES.MANAGE);

  if (loadingMeditation) {
    return (
      <Stack
        data-testid="meditations-meditation-page-form"
        spacing={2}
        aria-busy="true"
        aria-label="Carregando meditação"
      >
        <Skeleton variant="rounded" height={100} />
        <Skeleton variant="rounded" height={220} />
        <Skeleton variant="rounded" height={300} />
      </Stack>
    );
  }

  if (!fromTemplatePage && !loadedMeditation) {
    return (
      <Paper
        data-testid="meditations-meditation-page-form"
        variant="outlined"
        sx={{ p: 3, borderRadius: 3 }}
      >
        <Alert data-testid="meditation-load-error" severity="error">
          <AlertTitle>Meditação não encontrada</AlertTitle>
          {loadError || 'Abra a meditação que você quer editar pela lista.'}
        </Alert>
        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <Button type="button" onClick={retry} sx={{ minHeight: 44 }}>
            Tentar novamente
          </Button>
          <Button
            type="button"
            onClick={() => navigate(MEDITATION_ROUTES.MANAGE)}
            sx={{ minHeight: 44 }}
          >
            Ver meditações
          </Button>
        </Stack>
      </Paper>
    );
  }

  const startDateMessage =
    errors.startDateMessage ||
    (values.startDate && !isMonday(values.startDate)
      ? FORM_VALIDATION_MESSAGES.MEDITATION_DATE_MONDAY
      : '');
  const endDateMessage =
    errors.endDateMessage ||
    (values.endDate && !isFriday(values.endDate)
      ? FORM_VALIDATION_MESSAGES.MEDITATION_DATE_FRIDAY
      : '');
  const daysMissing = MEDITATION_DAYS_COUNT - days.length;
  const pending = isDirty || hasDayDraft;

  return (
    <Box
      data-testid="meditations-meditation-page-form"
      component="section"
      sx={{ minWidth: 0, pb: 2 }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 3,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            display: { xs: 'none', sm: 'flex' },
          }}
        >
          <SelfImprovementOutlined />
        </Box>
        <Box>
          <Typography component="h1" variant="h5" fontWeight={800}>
            {fromTemplatePage ? 'Criar meditação' : 'Editar meditação'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            A semana vai de segunda a sexta-feira.
          </Typography>
        </Box>
      </Stack>

      <Box component="fieldset" disabled={saving} sx={{ border: 0, p: 0, m: 0, minWidth: 0 }}>
        <Stack spacing={3}>
          <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}>
            <Typography component="h2" variant="h6" fontWeight={700}>
              Informações da meditação
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
              O tema e o período aparecem para os professores.
            </Typography>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))' },
                gap: 2,
              }}
            >
              <TextField
                data-testid="meditation-topic"
                label="Tema da Meditação"
                required
                value={values.topic}
                onChange={(event) => setValue('topic', event.target.value)}
                error={errors.topic}
                helperText={errors.topic ? FORM_VALIDATION_MESSAGES.REQUIRED_FIELD : ''}
                sx={{ gridColumn: { sm: '1 / -1' } }}
              />
              <SimpleDatePicker
                value={values.startDate}
                onChange={(value) => setValue('startDate', value)}
                label="Data de Início (segunda-feira)"
                required
                error={errors.startDate || Boolean(startDateMessage)}
                helperText={
                  errors.startDate ? FORM_VALIDATION_MESSAGES.REQUIRED_FIELD : startDateMessage
                }
              />
              <SimpleDatePicker
                value={values.endDate}
                onChange={(value) => setValue('endDate', value)}
                label="Data de Término (sexta-feira)"
                required
                error={errors.endDate || Boolean(endDateMessage)}
                helperText={
                  errors.endDate ? FORM_VALIDATION_MESSAGES.REQUIRED_FIELD : endDateMessage
                }
              />
            </Box>
          </Paper>

          <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}>
            <Typography component="h2" variant="h6" fontWeight={700}>
              Documento da meditação
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
              Material que os professores abrem junto da meditação.
            </Typography>

            <MeditationMediaField
              values={values}
              onChange={setValue}
              savedFileName={loadedMeditation?.media?.originalName}
              error={errors.media}
            />
          </Paper>

          <Paper
            variant="outlined"
            sx={{
              p: { xs: 2, md: 3 },
              borderRadius: 3,
              borderColor: errors.days ? 'error.main' : undefined,
            }}
          >
            <Typography component="h2" variant="h6" fontWeight={700}>
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
        </Stack>
      </Box>

      <Paper
        data-testid="meditation-save-bar"
        variant="outlined"
        sx={{
          position: 'sticky',
          bottom: 0,
          zIndex: 2,
          mt: 3,
          p: 2,
          pb: 'max(16px, env(safe-area-inset-bottom))',
          borderRadius: 3,
          boxShadow: 3,
        }}
      >
        <Stack spacing={1.5}>
          {hasDayDraft && (
            <Alert data-testid="meditation-draft-warning" severity="warning">
              <AlertTitle>Conclua o dia em edição</AlertTitle>
              Salve ou descarte o dia antes de salvar a meditação.
            </Alert>
          )}
          {feedback && (
            <Alert
              data-testid="meditation-feedback"
              severity={feedback.severity}
              onClose={dismissFeedback}
            >
              {feedback.message}
            </Alert>
          )}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="space-between"
            alignItems={{ sm: 'center' }}
          >
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip
                size="small"
                icon={<CheckCircleOutline />}
                label={
                  saving
                    ? 'Salvando alterações…'
                    : pending
                      ? 'Alterações não salvas'
                      : 'Nenhuma alteração pendente'
                }
                color={pending ? 'warning' : 'default'}
                variant="outlined"
              />
              <Chip
                size="small"
                label={
                  daysMissing > 0
                    ? `Faltam ${daysMissing} ${daysMissing === 1 ? 'dia' : 'dias'} para completar a semana`
                    : 'Semana completa'
                }
                color={daysMissing > 0 ? (errors.days ? 'error' : 'default') : 'success'}
                variant="outlined"
              />
            </Stack>
            <Stack direction="row" spacing={1}>
              {!fromTemplatePage && (
                <Button
                  type="button"
                  onClick={exit.requestExit}
                  disabled={saving}
                  startIcon={<ArrowBack />}
                  sx={{ minHeight: 44, flex: { xs: 1, sm: 'initial' } }}
                >
                  Voltar para a lista
                </Button>
              )}
              <Button
                data-testid="meditation-save"
                type="button"
                variant="contained"
                disabled={saving || hasDayDraft}
                onClick={() => void save()}
                startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <Save />}
                sx={{ minHeight: 44, flex: { xs: 1, sm: 'initial' }, whiteSpace: 'nowrap' }}
              >
                {saving ? 'Salvando...' : 'Salvar Meditação'}
              </Button>
            </Stack>
          </Stack>
        </Stack>
      </Paper>

      <UnsavedChangesDialog
        open={exit.confirming}
        onStay={exit.cancelExit}
        onLeave={exit.confirmExit}
      />
    </Box>
  );
}
