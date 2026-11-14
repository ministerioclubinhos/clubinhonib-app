import { Box, Typography } from '@mui/material';
import { lessonStageLabel } from '../presentation.utils';
import { LESSON_STAGE_STATUS_LABELS } from '../presentation.constants';
import type { StageImpactListProps } from '../types';

/** Lists the items a save or regeneration will mark as outdated. */
export function StageImpactList({ stages, category }: StageImpactListProps) {
  if (!stages.length) return null;
  return (
    <Box data-testid="ai-lesson-stage-impact-list" component="ul" sx={{ pl: 2.5, my: 1 }}>
      {stages.map((stage) => (
        <Typography component="li" variant="body2" key={stage.id}>
          <strong>{lessonStageLabel(stage.type, category)}</strong> —{' '}
          {LESSON_STAGE_STATUS_LABELS[stage.status]}
        </Typography>
      ))}
    </Box>
  );
}
