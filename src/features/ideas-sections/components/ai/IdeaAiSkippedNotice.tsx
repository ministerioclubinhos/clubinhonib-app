import { Alert } from '@mui/material';
import type { IdeaAiSkippedNoticeProps } from '../../types';
import { IDEA_AI_ERROR_LABELS, IDEA_AI_SKIP_LABELS } from '../../ai-constants';

export default function IdeaAiSkippedNotice({ reason, failed, errorCode }: IdeaAiSkippedNoticeProps) {
  return (
    <Alert data-testid="idea-ai-skipped-notice" severity={failed ? 'warning' : 'info'}>
      {failed
        ? `Não foi possível melhorar este arquivo. ${
            errorCode ? IDEA_AI_ERROR_LABELS[errorCode] : ''
          } O original continua disponível.`
        : reason
          ? IDEA_AI_SKIP_LABELS[reason]
          : 'Este material permanece original.'}
    </Alert>
  );
}
