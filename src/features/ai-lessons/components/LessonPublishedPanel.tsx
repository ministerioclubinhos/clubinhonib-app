import { Alert, Button, CircularProgress, Stack, Typography } from '@mui/material';
import {
  EventAvailable as CurrentWeekIcon,
  EventNoteOutlined as WeekIcon,
  OpenInNew as OpenIcon,
  Send as PublishIcon,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { publicationKindLabel, publicationMaterialPath } from '../publication';
import type { LessonPublishedPanelProps } from '../types';

/** State of a published lesson: link to the real page, current-week shortcut and recovery when the page is gone. */
export function LessonPublishedPanel({
  isSpecial,
  preview,
  previewLoading,
  busy,
  settingCurrentWeek,
  currentWeekError,
  onOpenWeekMaterials,
  onSetCurrentWeek,
  onRepublish,
}: LessonPublishedPanelProps) {
  const material = preview?.weekMaterial ?? null;
  const missing = material?.exists === false;
  const path = material?.exists ? publicationMaterialPath(material.routePath) : null;
  const kind = publicationKindLabel(preview?.isSpecial ?? isSpecial);
  const buttonSx = { minHeight: 44, fontWeight: 700, textTransform: 'none' } as const;

  if (missing) {
    return (
      <Alert
        data-testid="ai-lesson-published-missing-notice"
        severity="warning"
        sx={{ mb: 2, borderRadius: 2, '& .MuiAlert-message': { width: '100%' } }}
      >
        <Typography variant="body2" sx={{ mb: 1 }}>
          O material publicado a partir desta lição foi removido de Materiais Semanais. Os itens
          aprovados continuam guardados aqui: você pode publicar novamente como um novo {kind}.
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <Button
            data-testid="ai-lesson-republish"
            variant="contained"
            color="success"
            startIcon={<PublishIcon />}
            disabled={busy}
            onClick={onRepublish}
            sx={buttonSx}
          >
            Publicar novamente
          </Button>
          <Button
            data-testid="ai-lesson-published-open-week-materials"
            color="inherit"
            startIcon={<WeekIcon />}
            onClick={onOpenWeekMaterials}
            sx={buttonSx}
          >
            Abrir Materiais Semanais
          </Button>
        </Stack>
      </Alert>
    );
  }

  return (
    <Alert
      data-testid="ai-lesson-published-notice"
      severity="success"
      sx={{ mb: 2, borderRadius: 2, '& .MuiAlert-message': { width: '100%' } }}
    >
      <Typography variant="body2" sx={{ mb: 1 }}>
        Lição publicada como {kind} em Materiais Semanais.{' '}
        {material?.exists
          ? material.currentWeek
            ? 'Esta página é o material da semana atual.'
            : 'Ela ainda não é o material da semana atual; essa escolha é feita à parte.'
          : ''}
      </Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} flexWrap="wrap" useFlexGap>
        {path && (
          <Button
            data-testid="ai-lesson-published-view-material"
            component={RouterLink}
            to={path}
            target="_blank"
            rel="noopener noreferrer"
            variant="contained"
            color="success"
            startIcon={<OpenIcon />}
            sx={buttonSx}
          >
            Ver material
          </Button>
        )}
        {material?.exists && !material.currentWeek && (
          <Button
            data-testid="ai-lesson-published-set-current-week"
            variant="outlined"
            color="inherit"
            startIcon={settingCurrentWeek ? <CircularProgress size={16} /> : <CurrentWeekIcon />}
            disabled={busy || settingCurrentWeek}
            onClick={onSetCurrentWeek}
            sx={buttonSx}
          >
            {settingCurrentWeek ? 'Definindo…' : 'Definir como semana atual'}
          </Button>
        )}
        <Button
          data-testid="ai-lesson-published-open-week-materials"
          color="inherit"
          startIcon={<WeekIcon />}
          onClick={onOpenWeekMaterials}
          sx={buttonSx}
        >
          Abrir Materiais Semanais
        </Button>
        {previewLoading && (
          <CircularProgress size={18} aria-label="Carregando os dados do material publicado" />
        )}
      </Stack>
      {currentWeekError && (
        <Typography
          data-testid="ai-lesson-published-current-week-error"
          role="alert"
          variant="caption"
          color="error"
          sx={{ display: 'block', mt: 1 }}
        >
          {currentWeekError}
        </Typography>
      )}
    </Alert>
  );
}
