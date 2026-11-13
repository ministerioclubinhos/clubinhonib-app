import AutoAwesomeOutlined from '@mui/icons-material/AutoAwesomeOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import StopCircleOutlined from '@mui/icons-material/StopCircleOutlined';
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

import {
  IdeaAiDecision,
  IdeaAiPublicationField,
  IdeaAiScope,
  IdeaAiSnapshotSource,
  IdeaAiStatus,
  type IdeaAiStatusPanelProps,
} from '../../types';
import { formatDateTime } from '../../utils';
import { IDEA_AI_ERROR_LABELS, IDEA_AI_SCOPE_LABELS } from '../../ai-constants';
import {
  ideaAiAttemptsLeft,
  ideaAiProgressPercent,
  ideaAiRegenerateBlock,
  isIdeaAiInfraError,
} from '../../ai-utils';
import IdeaAiStatusChip from './IdeaAiStatusChip';
import IdeaAiAttemptHistory from './IdeaAiAttemptHistory';

/**
 * Etapa 1: o que a IA já fez com esta ideia e o que dá para fazer agora.
 *
 * Mostra o progresso real da tentativa ativa, as tentativas restantes e por
 * que a regeneração está bloqueada, em vez de um botão desabilitado mudo.
 */
export default function IdeaAiStatusPanel({
  section,
  onRegenerate,
  onCancel,
  onRestore,
  busy,
  disabled,
  error,
}: IdeaAiStatusPanelProps) {
  const detail = section.aiEnhancement;
  const original = detail?.snapshot;
  const result = detail?.currentResult;
  const active = detail?.activeAttempt;
  const history = detail?.attemptHistory ?? [];
  const latest = history[0];
  const published = Boolean(section.pageId);
  const block = ideaAiRegenerateBlock(section);
  const percent = ideaAiProgressPercent(active);

  return (
    <Stack data-testid="idea-ai-status-panel" spacing={2}>
      <Stack direction="row" alignItems="center" flexWrap="wrap" gap={1}>
        <IdeaAiStatusChip status={latest?.status ?? section.aiStatus} />
        {detail && (
          <Typography variant="body2" color="text.secondary" data-testid="idea-ai-attempts">
            {detail.attemptsUsed} de {detail.maxAttempts} tentativas usadas · nada é publicado
            automaticamente
          </Typography>
        )}
      </Stack>

      {active && (
        <Box data-testid="idea-ai-progress" role="status" aria-live="polite">
          <Typography variant="body2" sx={{ mb: 1 }}>
            {active.status === IdeaAiStatus.PENDING
              ? 'Na fila da IA. '
              : `A IA está trabalhando (${IDEA_AI_SCOPE_LABELS[active.scope].toLowerCase()}). `}
            {active.progressTotal > 0 && active.status === IdeaAiStatus.PROCESSING
              ? `${active.progressDone} de ${active.progressTotal} itens prontos. `
              : ''}
            O original e o último resultado continuam disponíveis.
          </Typography>
          <LinearProgress
            variant={percent === null ? 'indeterminate' : 'determinate'}
            value={percent ?? undefined}
            aria-label="Progresso da melhoria"
          />
          {active.startedAt && (
            <Typography variant="caption" color="text.secondary">
              Iniciada em {formatDateTime(active.startedAt)}
            </Typography>
          )}
        </Box>
      )}

      {error && (
        <Alert data-testid="idea-ai-error" severity="error">
          {error}
        </Alert>
      )}

      {detail && !detail.enabled && !published && (
        <Alert data-testid="idea-ai-disabled" severity="info">
          A melhoria de ideias por IA está desligada (feature flag “Melhoria das ideias por IA”).
          Nada é enviado à IA; resultados já gerados continuam aqui e podem ser publicados.
          {active ? ' A tentativa na fila só continua quando a melhoria for religada.' : ''}
        </Alert>
      )}

      {detail?.enabled && !detail.providerReady && !published && (
        <Alert data-testid="idea-ai-provider-missing" severity="warning">
          O provedor de IA não está configurado (chave e modelo de texto). Configure em Provedores
          de IA para melhorar ideias. Você pode revisar e publicar o original normalmente.
        </Alert>
      )}

      {latest?.status === IdeaAiStatus.FAILED && (
        <Alert data-testid="idea-ai-failed" severity="warning">
          A tentativa {latest.attempt} falhou.{' '}
          {latest.errorCode ? IDEA_AI_ERROR_LABELS[latest.errorCode] : ''}{' '}
          {isIdeaAiInfraError(latest.errorCode)
            ? 'Corrija a causa antes de tentar de novo.'
            : 'Você pode tentar novamente ou continuar a revisão com o original.'}{' '}
          {result ? 'A melhoria anterior foi preservada.' : ''}
        </Alert>
      )}

      {detail && ideaAiAttemptsLeft(detail) === 0 && !published && (
        <Alert data-testid="idea-ai-limit" severity="info">
          Limite de tentativas atingido. Você pode publicar o original, uma melhoria disponível ou
          editar o texto à mão.
        </Alert>
      )}

      {detail?.enabled !== false && !result && !active && !history.length && !published && (
        <Alert data-testid="idea-ai-empty" severity="info">
          Ainda não há melhoria para comparar. Use “Melhorar ideia com IA” para gerar uma versão a
          partir do original.
        </Alert>
      )}

      {result && (
        <Typography variant="body2" color="text.secondary" data-testid="idea-ai-current">
          Em comparação: tentativa {result.attempt}
          {result.scope !== IdeaAiScope.FULL && result.baseAttempt
            ? ` (completa a tentativa ${result.baseAttempt})`
            : ''}{' '}
          • {formatDateTime(result.finishedAt)}
        </Typography>
      )}

      {original?.source === IdeaAiSnapshotSource.LEGACY_CAPTURE && (
        <Alert data-testid="idea-ai-legacy" severity="info">
          Ideia anterior a este recurso: o original corresponde aos dados existentes quando a
          preservação foi iniciada.
        </Alert>
      )}

      {!published && (detail?.enabled !== false || active) && (
        <Stack direction={{ xs: 'column', sm: 'row' }} gap={1} alignItems={{ sm: 'center' }}>
          {detail?.enabled !== false && (
          <Button
            type="button"
            variant={result ? 'outlined' : 'contained'}
            data-testid="idea-ai-reprocess"
            startIcon={<AutoAwesomeOutlined />}
            onClick={onRegenerate}
            disabled={disabled || busy || Boolean(block)}
            sx={{ minHeight: 44, textTransform: 'none' }}
          >
            {history.length ? 'Regenerar com IA…' : 'Melhorar ideia com IA…'}
          </Button>
          )}
          {active && (
            <Button
              type="button"
              color="warning"
              data-testid="idea-ai-cancel"
              startIcon={<StopCircleOutlined />}
              onClick={onCancel}
              disabled={disabled || busy}
              sx={{ minHeight: 44, textTransform: 'none' }}
            >
              Cancelar melhoria
            </Button>
          )}
          {block && !active && (
            <Typography variant="caption" color="text.secondary" data-testid="idea-ai-block-reason">
              {block}
            </Typography>
          )}
        </Stack>
      )}

      {published && (
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
                  data-testid={`idea-ai-published-media-${media.id}`}
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
                  {choice.field === IdeaAiPublicationField.TITLE
                    ? 'Título'
                    : choice.field === IdeaAiPublicationField.DESCRIPTION
                      ? 'Descrição'
                      : (original?.medias ?? []).find((m) => m.id === choice.sourceMediaId)
                          ?.originalName || 'Material'}
                  : {choice.decision === IdeaAiDecision.ENHANCED ? 'Versão IA' : 'Original'}
                  {choice.edited ? ' (editada na revisão)' : ''}
                  {choice.enhancementId
                    ? ` • tentativa ${history.find((a) => a.id === choice.enhancementId)?.attempt ?? 'anterior'}`
                    : ''}
                </Typography>
              ))}
            </Stack>
          </AccordionDetails>
        </Accordion>
      )}

      <IdeaAiAttemptHistory
        attempts={history}
        currentId={result?.id ?? null}
        canRestore={!published && !active}
        busy={disabled || busy}
        onRestore={onRestore}
      />
    </Stack>
  );
}
