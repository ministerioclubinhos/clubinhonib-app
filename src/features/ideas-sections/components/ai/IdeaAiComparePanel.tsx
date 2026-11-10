import AutoAwesomeOutlined from '@mui/icons-material/AutoAwesomeOutlined';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Divider,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  IdeaAiDecision,
  IdeaAiMediaStatus,
  IdeaAiStatus,
  type IdeaAiCompareProps,
} from '../../types';
import { IDEA_AI_PANEL_SX } from '../../ai-constants';
import { initialIdeaAiDecisions } from '../../ai-utils';
import { formatDateTime } from '../../utils';
import IdeaAiStatusChip from './IdeaAiStatusChip';
import IdeaAiTextCompare from './IdeaAiTextCompare';
import IdeaAiDocumentCompare from './IdeaAiDocumentCompare';
import IdeaAiImageCompare from './IdeaAiImageCompare';
import IdeaAiGuardWarning from './IdeaAiGuardWarning';
import IdeaAiSkippedNotice from './IdeaAiSkippedNotice';
export default function IdeaAiComparePanel({
  excludedMediaIds = [],
  section,
  decisions,
  onChange,
  onRetry,
  retrying,
  disabled,
  error,
}: IdeaAiCompareProps) {
  const detail = section.aiEnhancement;
  const original = detail?.snapshot ?? {
    title: section.title,
    description: section.description,
    medias: section.medias,
    source: 'LEGACY_CAPTURE',
  };
  const result = detail?.currentResult;
  const active = detail?.activeAttempt;
  const history = detail?.attemptHistory ?? [];
  const limit = detail?.maxAttempts ?? 3;
  const latest = history[0];
  const changeMedia = (sourceMediaId: string, decision: IdeaAiDecision) => {
    if (decisions)
      onChange({
        ...decisions,
        medias: decisions.medias.map((m) =>
          m.sourceMediaId === sourceMediaId ? { ...m, decision } : m
        ),
      });
  };
  return (
    <Paper variant="outlined" data-testid="idea-ai-compare-panel" sx={IDEA_AI_PANEL_SX}>
      <Stack spacing={2}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={2}>
          <Box>
            <Typography component="h2" variant="h6" fontWeight={800}>
              Original e melhoria por IA
            </Typography>
            <Typography color="text.secondary" variant="body2">
              Compare cada item e escolha o que será publicado.
            </Typography>
          </Box>
          <Box sx={{ alignSelf: 'flex-start' }}>
            <IdeaAiStatusChip status={latest?.status ?? section.aiStatus} />
          </Box>
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} gap={1} flexWrap="wrap">
          <Button
            type="button"
            variant="contained"
            data-testid="idea-ai-reprocess"
            startIcon={<AutoAwesomeOutlined />}
            onClick={onRetry}
            disabled={disabled || retrying || Boolean(active) || history.length >= limit}
            sx={{ minHeight: 44 }}
          >
            {retrying
              ? 'Solicitando…'
              : history.length
                ? 'Tentar novamente com IA'
                : 'Melhorar ideia com IA'}
          </Button>
          {decisions && (
            <>
              <Button
                type="button"
                data-testid="idea-ai-use-all"
                disabled={disabled}
                sx={{ minHeight: 44 }}
                onClick={() => {
                  const defaults = initialIdeaAiDecisions(detail);
                  if (defaults)
                    onChange({
                      ...defaults,
                      title: result?.enhancedTitle
                        ? IdeaAiDecision.ENHANCED
                        : IdeaAiDecision.ORIGINAL,
                      description:
                        result?.enhancedDescription != null
                          ? IdeaAiDecision.ENHANCED
                          : IdeaAiDecision.ORIGINAL,
                      medias: defaults.medias.map((m) => ({
                        ...m,
                        decision: result?.medias.find((r) => r.sourceMediaId === m.sourceMediaId)
                          ?.enhancedMedia
                          ? IdeaAiDecision.ENHANCED
                          : IdeaAiDecision.ORIGINAL,
                      })),
                    });
                }}
              >
                Usar todas as melhorias
              </Button>
              <Button
                type="button"
                data-testid="idea-ai-use-original"
                disabled={disabled}
                sx={{ minHeight: 44 }}
                onClick={() =>
                  onChange({
                    ...decisions,
                    title: IdeaAiDecision.ORIGINAL,
                    description: IdeaAiDecision.ORIGINAL,
                    medias: decisions.medias.map((m) => ({
                      ...m,
                      decision: IdeaAiDecision.ORIGINAL,
                    })),
                  })
                }
              >
                Manter tudo original
              </Button>
            </>
          )}
        </Stack>
        <Typography variant="body2" color="text.secondary">
          {history.length} de {limit} tentativas. Cada tentativa parte do original preservado. Nada
          é publicado automaticamente.
        </Typography>
        {history.length >= limit && (
          <Alert severity="info">
            Limite de tentativas atingido. Você pode publicar o original ou uma melhoria disponível.
          </Alert>
        )}
        {error && (
          <Alert data-testid="idea-ai-error" severity="error">
            {error}
          </Alert>
        )}
        {active && (
          <Box data-testid="idea-ai-progress" role="status">
            <Typography variant="body2" sx={{ mb: 1 }}>
              A IA está trabalhando. O original e o último resultado continuam disponíveis.
            </Typography>
            <LinearProgress />
          </Box>
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
        {original.source === 'LEGACY_CAPTURE' && (
          <Alert severity="info">
            Ideia anterior a este recurso: o original corresponde aos dados existentes quando a
            preservação foi iniciada.
          </Alert>
        )}
        {!result && !active && (
          <Alert severity="info">
            Ainda não há melhoria para comparar. Use “Melhorar ideia com IA” para gerar uma versão a
            partir do original.
          </Alert>
        )}
        {result && (
          <Typography variant="body2">
            Comparando com a tentativa {result.attempt} • {formatDateTime(result.finishedAt)}
          </Typography>
        )}
        <IdeaAiGuardWarning guard={result?.textGuard ?? latest?.textGuard} />
        <IdeaAiTextCompare
          label="Título"
          original={original.title}
          enhanced={result?.enhancedTitle ?? null}
          decision={decisions?.title ?? IdeaAiDecision.ORIGINAL}
          disabled={disabled || !decisions}
          onChange={(title) => {
            if (decisions) onChange({ ...decisions, title });
          }}
        />
        <IdeaAiTextCompare
          label="Descrição"
          original={original.description}
          enhanced={result?.enhancedDescription ?? null}
          decision={decisions?.description ?? IdeaAiDecision.ORIGINAL}
          disabled={disabled || !decisions}
          onChange={(description) => {
            if (decisions) onChange({ ...decisions, description });
          }}
        />
        <Divider />
        <Typography component="h3" variant="h6" fontWeight={700}>
          Materiais enviados
        </Typography>
        {original.medias.map((media) => {
          const excluded = excludedMediaIds.includes(media.id);
          const improved = result?.medias.find((m) => m.sourceMediaId === media.id);
          const decision =
            decisions?.medias.find((m) => m.sourceMediaId === media.id)?.decision ??
            IdeaAiDecision.ORIGINAL;
          return (
            <Box key={media.id} data-testid="idea-ai-media-item" sx={{ minWidth: 0 }}>
              {excluded && (
                <Alert severity="info">
                  Removido da publicação. O arquivo original continua preservado.
                </Alert>
              )}
              <Typography
                component="h4"
                variant="subtitle1"
                fontWeight={700}
                sx={{ mb: 1, overflowWrap: 'anywhere' }}
              >
                {media.originalName || media.title || 'Material'}
              </Typography>
              {media.mediaType === 'image' ? (
                <IdeaAiImageCompare
                  original={media}
                  result={improved}
                  decision={decision}
                  onChange={(value) => changeMedia(media.id, value)}
                  disabled={disabled || !decisions || excluded}
                />
              ) : media.mediaType === 'document' ? (
                <IdeaAiDocumentCompare
                  original={media}
                  result={improved}
                  decision={decision}
                  onChange={(value) => changeMedia(media.id, value)}
                  disabled={disabled || !decisions || excluded}
                />
              ) : (
                <Button
                  component="a"
                  href={media.url}
                  target="_blank"
                  rel="noreferrer"
                  sx={{ minHeight: 44 }}
                >
                  Assistir vídeo original
                </Button>
              )}
              <Box sx={{ mt: 1 }}>
                <IdeaAiGuardWarning guard={improved?.guard} />
                {(improved?.status === IdeaAiMediaStatus.SKIPPED ||
                  improved?.status === IdeaAiMediaStatus.FAILED ||
                  media.mediaType === 'video') && (
                  <IdeaAiSkippedNotice
                    reason={improved?.skipReason ?? 'NOT_SUPPORTED'}
                    failed={improved?.status === IdeaAiMediaStatus.FAILED}
                  />
                )}
              </Box>
            </Box>
          );
        })}
        {section.pageId && (
          <Accordion data-testid="idea-ai-published-version" disableGutters elevation={0}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography fontWeight={700}>Versão publicada</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={1}>
                <Typography component="h3" variant="h6">
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
                        : original.medias.find((m) => m.id === choice.sourceMediaId)
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
            sx={{ border: 1, borderColor: 'divider', borderRadius: 1 }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
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
                      {attempt.errorCode === 'CANCELLED'
                        ? ' • Cancelada ao publicar o original'
                        : ''}
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
    </Paper>
  );
}
