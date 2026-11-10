import { Alert } from '@mui/material';
import type { IdeaAiGuardWarningProps } from '../../types';
export default function IdeaAiGuardWarning({ guard }: IdeaAiGuardWarningProps) {
  if (!guard || guard.approved) return null;
  return (
    <Alert data-testid="idea-ai-guard-warning" severity="warning">
      Original preservado: {guard.violations.join(' ')}
    </Alert>
  );
}
