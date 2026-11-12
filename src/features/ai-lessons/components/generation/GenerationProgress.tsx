import { Box, LinearProgress, Stack, Typography } from '@mui/material';
import { generationStepText } from '../../generation.utils';
import type { LessonGenerationProgress } from '../../types';

interface GenerationProgressProps {
  progress: LessonGenerationProgress | null | undefined;
  /** Already formatted (`m:ss`). */
  elapsed: string;
  title?: string;
}

/** Step, images done, percentage and time of a running generation. */
export function GenerationProgress({ progress, elapsed, title }: GenerationProgressProps) {
  const percent = progress?.percent ?? null;
  return (
    <Box data-testid="ai-lesson-generation-progress" sx={{ minWidth: 0 }}>
      {title && (
        <Typography variant="body2" fontWeight={700}>
          {title}
        </Typography>
      )}
      <Stack direction="row" justifyContent="space-between" alignItems="baseline" gap={1}>
        <Typography
          data-testid="ai-lesson-generation-step"
          variant="body2"
          fontWeight={title ? 400 : 700}
          sx={{ overflowWrap: 'anywhere' }}
        >
          {generationStepText(progress)}
        </Typography>
        <Typography
          data-testid="ai-lesson-generation-percent"
          variant="body2"
          fontWeight={700}
          sx={{ flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}
        >
          {percent === null ? `há ${elapsed}` : `${percent}% · há ${elapsed}`}
        </Typography>
      </Stack>
      <LinearProgress
        variant={percent === null ? 'indeterminate' : 'determinate'}
        value={percent ?? undefined}
        aria-label={percent === null ? 'Geração em andamento' : `Geração ${percent}% concluída`}
        sx={{ mt: 0.75, height: 8, borderRadius: 4 }}
      />
    </Box>
  );
}
