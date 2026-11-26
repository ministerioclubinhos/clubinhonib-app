import { Box, Paper, Stack, Typography, alpha, useTheme } from '@mui/material';

import { WEEK_STATUS_LEGEND_ORDER } from '../constants';
import { weekStatusDescription, weekStatusLabel } from '../utils';
import { STATUS_ICONS, statusColor } from './statusVisuals';

/**
 * A legenda das situações.
 *
 * Fica sempre visível, e não atrás de um botão: sem ela as sete situações são
 * sete tons de cor, e o quadro deixa de ser legível justamente para quem mais
 * precisa dele.
 */
export function WeekStatusLegend() {
  const theme = useTheme();

  return (
    <Paper
      data-testid="club-weekly-summary-legend"
      elevation={0}
      sx={{
        px: { xs: 1.5, sm: 2 },
        py: 1.25,
        borderRadius: 3,
        border: `1px solid ${theme.palette.divider}`,
        bgcolor: alpha(theme.palette.text.primary, 0.02),
      }}
    >
      <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1.5} sx={{ rowGap: 1 }}>
        <Typography variant="caption" fontWeight={700} color="text.secondary">
          Legenda
        </Typography>
        {WEEK_STATUS_LEGEND_ORDER.map((status) => (
          <Stack
            key={status}
            direction="row"
            alignItems="center"
            spacing={0.5}
            title={weekStatusDescription(status)}
          >
            <Box sx={{ display: 'flex', fontSize: 16, color: statusColor(theme, status) }}>
              {STATUS_ICONS[status]}
            </Box>
            <Typography variant="caption" color="text.secondary">
              {weekStatusLabel(status)}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Paper>
  );
}
