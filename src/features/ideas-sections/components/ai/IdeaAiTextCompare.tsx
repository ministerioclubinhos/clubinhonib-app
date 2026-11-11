import { Box, Paper, Stack, Typography } from '@mui/material';
import type { IdeaAiTextCompareProps } from '../../types';
import { ideaWordDiff } from '../../ai-utils';
import { IDEA_AI_COMPARE_COLUMNS } from '../../ai-constants';
import IdeaAiChoice from './IdeaAiChoice';
export default function IdeaAiTextCompare({
  label,
  original,
  enhanced,
  decision,
  onChange,
  disabled,
}: IdeaAiTextCompareProps) {
  /**
   * Sem versão da IA a comparação vira uma coluna só: no celular, o cartão
   * vazio empurrava o conteúdo seguinte uma tela inteira para baixo.
   */
  const hasEnhanced = enhanced !== null;
  return (
    <Stack data-testid="idea-ai-text-compare" spacing={1.5}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ sm: 'center' }}
        gap={1}
      >
        <Typography component="h3" variant="subtitle1" fontWeight={700}>
          {label}
        </Typography>
        <IdeaAiChoice
          label={label}
          decision={decision}
          enhanced={hasEnhanced}
          onChange={onChange}
          disabled={disabled}
        />
      </Stack>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: hasEnhanced ? IDEA_AI_COMPARE_COLUMNS : 'minmax(0, 1fr)',
          gap: 2,
        }}
      >
        <Paper variant="outlined" sx={{ p: 2, bgcolor: 'action.hover', minWidth: 0 }}>
          <Typography variant="overline" color="text.secondary">
            Original
          </Typography>
          <Typography sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
            {original}
          </Typography>
        </Paper>
        {hasEnhanced && (
          <Paper variant="outlined" sx={{ p: 2, minWidth: 0, borderColor: 'success.light' }}>
            <Typography variant="overline" color="success.main">
              Melhorada pela IA
            </Typography>
            <Typography sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
              {ideaWordDiff(original, enhanced).map((part, index) => (
                <Box
                  component="span"
                  key={index}
                  sx={
                    part.changed
                      ? { bgcolor: 'success.main', color: 'success.contrastText' }
                      : undefined
                  }
                >
                  {part.text}
                </Box>
              ))}
            </Typography>
          </Paper>
        )}
      </Box>
      {!hasEnhanced && (
        <Typography variant="caption" color="text.secondary">
          Nenhuma melhoria aprovada para este campo.
        </Typography>
      )}
    </Stack>
  );
}
