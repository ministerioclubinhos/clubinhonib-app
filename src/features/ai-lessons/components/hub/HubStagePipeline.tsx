import React from 'react';
import { Box, Stack, Tooltip, useTheme } from '@mui/material';

import { StudioHubStageTone, type StudioHubStageDot } from '../../types';

interface Props {
  stages: StudioHubStageDot[];
}

/**
 * The lesson's stages as a row of segments, in production order.
 *
 * One glance tells how far the package is and where it is stuck; the name and
 * the status of each stage are in the tooltip and in the accessible label.
 */
export const HubStagePipeline: React.FC<Props> = ({ stages }) => {
  const theme = useTheme();
  const colors: Record<StudioHubStageTone, string> = {
    [StudioHubStageTone.DONE]: theme.palette.success.main,
    [StudioHubStageTone.PRODUCED]: theme.palette.info.main,
    [StudioHubStageTone.WORKING]: theme.palette.primary.light,
    [StudioHubStageTone.PROBLEM]: theme.palette.error.main,
    [StudioHubStageTone.STALE]: theme.palette.warning.main,
    [StudioHubStageTone.TODO]: theme.palette.action.disabledBackground,
  };

  return (
    <Stack
      direction="row"
      spacing={0.5}
      role="list"
      aria-label="Etapas da lição"
      data-testid="ai-lessons-hub-pipeline"
      sx={{ width: '100%' }}
    >
      {stages.map((stage) => (
        <Tooltip key={stage.type} title={`${stage.label} — ${stage.statusLabel}`} arrow>
          <Box
            role="listitem"
            aria-label={`${stage.label}: ${stage.statusLabel}`}
            data-tone={stage.tone}
            sx={{
              flex: 1,
              minWidth: 0,
              height: 8,
              borderRadius: 4,
              bgcolor: colors[stage.tone],
            }}
          />
        </Tooltip>
      ))}
    </Stack>
  );
};
