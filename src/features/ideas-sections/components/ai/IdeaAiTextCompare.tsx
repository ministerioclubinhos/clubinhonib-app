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
          enhanced={enhanced !== null}
          onChange={onChange}
          disabled={disabled}
        />
      </Stack>
      <Box sx={{ display: 'grid', gridTemplateColumns: IDEA_AI_COMPARE_COLUMNS, gap: 2 }}>
        <Paper variant="outlined" sx={{ p: 2, bgcolor: 'action.hover', minWidth: 0 }}>
          <Typography variant="overline" color="text.secondary">
            Original
          </Typography>
          <Typography sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
            {original}
          </Typography>
        </Paper>
        <Paper
          variant="outlined"
          sx={{ p: 2, minWidth: 0, borderColor: enhanced !== null ? 'success.light' : 'divider' }}
        >
          <Typography variant="overline" color="success.main">
            Melhorada pela IA
          </Typography>
          <Typography sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
            {enhanced === null
              ? 'Nenhuma melhoria aprovada para este campo.'
              : ideaWordDiff(original, enhanced).map((part, index) => (
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
      </Box>
    </Stack>
  );
}
