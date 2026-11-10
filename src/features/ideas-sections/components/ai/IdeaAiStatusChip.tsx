import { Chip } from '@mui/material';
import { IdeaAiStatus, type IdeaAiStatusProps } from '../../types';
import { IDEA_AI_STATUS_LABELS } from '../../ai-constants';
export default function IdeaAiStatusChip({ status }: IdeaAiStatusProps) {
  return (
    <Chip
      data-testid="idea-ai-status-chip"
      size="small"
      label={status ? IDEA_AI_STATUS_LABELS[status] : 'Sem melhoria automática'}
      color={
        status === IdeaAiStatus.FAILED
          ? 'warning'
          : status === IdeaAiStatus.COMPLETED
            ? 'success'
            : 'default'
      }
    />
  );
}
