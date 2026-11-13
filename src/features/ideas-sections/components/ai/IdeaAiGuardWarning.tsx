import { Alert, AlertTitle, Box } from '@mui/material';
import type { IdeaAiGuardWarningProps } from '../../types';

/**
 * Motivo pelo qual a revisão de essência reprovou a versão da IA. Diz o que
 * fazer: publicar o original ou pedir uma nova tentativa só deste item.
 */
export default function IdeaAiGuardWarning({ guard }: IdeaAiGuardWarningProps) {
  if (!guard || guard.approved) return null;
  return (
    <Alert data-testid="idea-ai-guard-warning" severity="warning">
      <AlertTitle>A revisão de essência reprovou a versão da IA</AlertTitle>
      {guard.violations.length > 0 && (
        <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
          {guard.violations.map((violation) => (
            <li key={violation}>{violation}</li>
          ))}
        </Box>
      )}
      O original foi preservado. Você pode publicá-lo ou regenerar só os itens com falha.
    </Alert>
  );
}
