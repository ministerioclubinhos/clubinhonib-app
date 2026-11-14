import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Stack,
  Typography,
} from '@mui/material';
import { IdeaAiScope, type IdeaAiAttemptHistoryProps } from '../../types';
import { IDEA_AI_ERROR_LABELS, IDEA_AI_RESULT_STATUSES, IDEA_AI_SCOPE_LABELS } from '../../ai-constants';
import { formatDateTime } from '../../utils';
import IdeaAiStatusChip from './IdeaAiStatusChip';

/** Todas as tentativas, com o que cada uma refez e a opção de voltar a uma delas. */
export default function IdeaAiAttemptHistory({
  attempts,
  currentId,
  canRestore,
  busy,
  onRestore,
}: IdeaAiAttemptHistoryProps) {
  if (!attempts.length) return null;
  return (
    <Accordion
      data-testid="idea-ai-history"
      disableGutters
      elevation={0}
      sx={{ border: 1, borderColor: 'divider', borderRadius: 1, '&::before': { display: 'none' } }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ minHeight: 48 }}>
        <Typography fontWeight={700}>Histórico de tentativas ({attempts.length})</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={2}>
          {attempts.map((attempt) => {
            const isCurrent = attempt.id === currentId;
            const restorable = !isCurrent && IDEA_AI_RESULT_STATUSES.includes(attempt.status);
            return (
              <Box key={attempt.id} data-testid={`idea-ai-history-${attempt.attempt}`}>
                <Stack direction="row" flexWrap="wrap" alignItems="center" gap={1}>
                  <Typography fontWeight={600}>Tentativa {attempt.attempt}</Typography>
                  <IdeaAiStatusChip status={attempt.status} />
                  {isCurrent && (
                    <Typography variant="caption" color="success.main" fontWeight={700}>
                      Em comparação
                    </Typography>
                  )}
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  {IDEA_AI_SCOPE_LABELS[attempt.scope]}
                  {attempt.scope !== IdeaAiScope.FULL && attempt.baseAttempt
                    ? ` · completa a tentativa ${attempt.baseAttempt}`
                    : ''}
                  {' · '}
                  {formatDateTime(attempt.requestedAt)}
                  {!attempt.countsTowardLimit ? ' · não conta no limite' : ''}
                </Typography>
                {attempt.instructions && (
                  <Typography variant="body2" sx={{ fontStyle: 'italic', overflowWrap: 'anywhere' }}>
                    Orientação: “{attempt.instructions}”
                  </Typography>
                )}
                {attempt.errorCode && (
                  <Typography variant="body2" color="text.secondary">
                    {IDEA_AI_ERROR_LABELS[attempt.errorCode]}
                  </Typography>
                )}
                {!isCurrent && attempt.enhancedTitle && (
                  <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
                    {attempt.enhancedTitle}
                  </Typography>
                )}
                {restorable && canRestore && (
                  <Button
                    type="button"
                    data-testid={`idea-ai-restore-${attempt.attempt}`}
                    size="small"
                    disabled={busy}
                    onClick={() => onRestore(attempt.id)}
                    sx={{ minHeight: 44, textTransform: 'none', mt: 0.5 }}
                  >
                    Usar este resultado
                  </Button>
                )}
              </Box>
            );
          })}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}
