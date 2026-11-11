import AutoAwesomeOutlined from '@mui/icons-material/AutoAwesomeOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material';

import { IdeaAiDecision, IdeaAiStatus, type IdeaAiStatusPanelProps } from '../../types';
import { formatDateTime } from '../../utils';
import IdeaAiStatusChip from './IdeaAiStatusChip';

/**
 * Etapa 1: o que a IA já fez com esta ideia.
 *
 * Reúne num lugar só o estado, a tentativa em andamento, o histórico e a
 * versão publicada — antes esses avisos vinham misturados à comparação, e a
 * tela abria com uma pilha de alertas antes do primeiro texto.
 */
export default function IdeaAiStatusPanel({
  section,
  onRetry,
  retrying,
  disabled,
  error,
}: IdeaAiStatusPanelProps) {
  const detail = section.aiEnhancement;
  const original = detail?.snapshot;
  const result = detail?.currentResult;
  const active = detail?.activeAttempt;
  const history = detail?.attemptHistory ?? [];
  const limit = detail?.maxAttempts ?? 3;
  const latest = history[0];

  return (
    <Stack data-testid="idea-ai-status-panel" spacing={2}>
      <Stack direction="row" alignItems="center" flexWrap="wrap" gap={1}>
        <IdeaAiStatusChip status={latest?.status ?? section.aiStatus} />
        <Typography variant="body2" color="text.secondary">
          {history.length} de {limit} tentativas · nada é publicado automaticamente
        </Typography>
      </Stack>

      {active && (
        <Box data-testid="idea-ai-progress" role="status">
          <Typography variant="body2" sx={{ mb: 1 }}>
            A IA está trabalhando. O original e o último resultado continuam disponíveis.
          </Typography>
          <LinearProgress />
        </Box>
      )}

      {error && (
        <Alert data-testid="idea-ai-error" severity="error">
          {error}
        </Alert>
      )}

      {latest?.status === IdeaAiStatus.FAILED && (
        <Alert severity="warning">
          A tentativa {latest.attempt} falhou.{' '}
          {latest.errorCode === 'PROVIDER_NOT_CONFIGURED'
            ? 'Confira a configuração do provedor de IA.'
            : 'Você pode tentar novamente ou continuar a revisão com o original.'}{' '}
          {result ? 'A melhoria anterior foi preservada.' : ''}
        </Alert>
      )}

      {history.length >= limit && (
        <Alert severity="info">
          Limite de tentativas atingido. Você pode publicar o original ou uma melhoria disponível.
        </Alert>
      )}

      {!result && !active && !history.length && (
        <Alert severity="info">
          Ainda não há melhoria para comparar. Use “Melhorar ideia com IA” para gerar uma versão a
          partir do original.
        </Alert>
      )}

      {result && (
        <Typography variant="body2" color="text.secondary">
          Resultado disponível: tentativa {result.attempt} • {formatDateTime(result.finishedAt)}
        </Typography>
      )}

      {original?.source === 'LEGACY_CAPTURE' && (
        <Alert severity="info">
          Ideia anterior a este recurso: o original corresponde aos dados existentes quando a
          preservação foi iniciada.
        </Alert>
      )}

      <Button
        type="button"
        variant={result ? 'outlined' : 'contained'}
        data-testid="idea-ai-reprocess"
        startIcon={<AutoAwesomeOutlined />}
        onClick={onRetry}
        disabled={disabled || retrying || Boolean(active) || history.length >= limit}
        sx={{ minHeight: 44, alignSelf: { sm: 'flex-start' }, textTransform: 'none' }}
      >
        {retrying
          ? 'Solicitando…'
          : history.length
            ? 'Tentar novamente com IA'
            : 'Melhorar ideia com IA'}
      </Button>

      {section.pageId && (
        <Accordion
          data-testid="idea-ai-published-version"
          disableGutters
          elevation={0}
          sx={{
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
            '&::before': { display: 'none' },
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ minHeight: 48 }}>
            <Typography fontWeight={700}>Versão publicada</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={1}>
              <Typography component="h3" variant="subtitle1" fontWeight={700}>
                {section.title}
              </Typography>
              <Typography sx={{ whiteSpace: 'pre-wrap' }}>{section.description}</Typography>
              {section.medias.map((media) => (
                <Button
                  key={media.id}
                  component="a"
                  href={media.url}
                  target="_blank"
                  rel="noreferrer"
                  sx={{ minHeight: 44, justifyContent: 'flex-start', overflowWrap: 'anywhere' }}
                >
                  {media.originalName || media.title || 'Material publicado'}
                </Button>
              ))}
              {detail?.publicationChoices?.map((choice) => (
                <Typography key={`${choice.field}:${choice.sourceMediaId ?? ''}`} variant="body2">
                  {choice.field === 'TITLE'
                    ? 'Título'
                    : choice.field === 'DESCRIPTION'
                      ? 'Descrição'
                      : (original?.medias ?? []).find((m) => m.id === choice.sourceMediaId)
                          ?.originalName || 'Material'}
                  : {choice.decision === IdeaAiDecision.ENHANCED ? 'Versão IA' : 'Original'}
                  {choice.enhancementId
                    ? ` • tentativa ${history.find((a) => a.id === choice.enhancementId)?.attempt ?? 'anterior'}`
                    : ''}
                </Typography>
              ))}
            </Stack>
          </AccordionDetails>
        </Accordion>
      )}

      {!!history.length && (
        <Accordion
          data-testid="idea-ai-history"
          disableGutters
          elevation={0}
          sx={{
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
            '&::before': { display: 'none' },
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ minHeight: 48 }}>
            <Typography fontWeight={700}>Histórico de tentativas ({history.length})</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={2}>
              {history.map((attempt) => (
                <Box key={attempt.id}>
                  <Stack direction="row" flexWrap="wrap" alignItems="center" gap={1}>
                    <Typography>Tentativa {attempt.attempt}</Typography>
                    <IdeaAiStatusChip status={attempt.status} />
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    {formatDateTime(attempt.requestedAt)}
                    {attempt.errorCode === 'CANCELLED' ? ' • Cancelada ao publicar o original' : ''}
                  </Typography>
                  {attempt.id !== result?.id && attempt.enhancedTitle && (
                    <Typography variant="body2">{attempt.enhancedTitle}</Typography>
                  )}
                </Box>
              ))}
            </Stack>
          </AccordionDetails>
        </Accordion>
      )}
    </Stack>
  );
}
