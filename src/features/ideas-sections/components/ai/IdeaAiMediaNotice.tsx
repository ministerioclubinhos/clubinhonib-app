import { Alert } from '@mui/material';
import { IdeaAiMediaStatus, type IdeaAiMediaNoticeProps } from '../../types';
import { IDEA_AI_ERROR_LABELS } from '../../ai-constants';

/**
 * Origem da versão da IA quando ela não veio da tentativa atual: aproveitada
 * de uma tentativa anterior, às vezes porque a nova falhou.
 */
export default function IdeaAiMediaNotice({ result, baseAttempt }: IdeaAiMediaNoticeProps) {
  if (!result?.carriedOver || result.status !== IdeaAiMediaStatus.ENHANCED) return null;
  const origin = baseAttempt ? `da tentativa ${baseAttempt}` : 'de uma tentativa anterior';
  return (
    <Alert
      data-testid="idea-ai-media-carried"
      severity={result.errorCode ? 'warning' : 'info'}
      sx={{ mt: 1 }}
    >
      {result.errorCode
        ? `A nova tentativa não deu certo (${IDEA_AI_ERROR_LABELS[result.errorCode]}). Mantivemos a versão ${origin}.`
        : `Versão aproveitada ${origin}, sem nova chamada à IA.`}
    </Alert>
  );
}
