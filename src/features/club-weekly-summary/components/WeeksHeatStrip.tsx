import { Box, Paper, Stack, Tooltip, Typography, alpha, useTheme } from '@mui/material';

import { HEAT_STRIP_CELL_SIZE } from '../constants';
import { ClubWeekTimeline, type ClubWeeklySummaryWeek } from '../types';
import {
  formatRate,
  weekOverallStatus,
  weekPendencyCount,
  weekRangeLabel,
  weekStatusLabel,
} from '../utils';
import { statusColor } from './statusVisuals';

interface WeeksHeatStripProps {
  weeks: ClubWeeklySummaryWeek[];
  /** As semanas do recorte escolhido; ficam realçadas na faixa. */
  selectedWeeks: number[];
  onSelectWeek: (week: number) => void;
}

/**
 * O ano inteiro numa faixa.
 *
 * Um quadradinho por semana, pintado pela pior situação entre os clubinhos
 * daquela semana. É o "desenho" que a lista abaixo não consegue dar: quarenta
 * semanas cabem de uma vez, e a semana que correu mal salta à vista antes de
 * qualquer rolagem.
 */
export function WeeksHeatStrip({
  weeks,
  selectedWeeks,
  onSelectWeek,
}: WeeksHeatStripProps) {
  const theme = useTheme();
  const selected = new Set(selectedWeeks);

  return (
    <Paper
      data-testid="club-weekly-summary-heat-strip"
      elevation={0}
      sx={{
        p: { xs: 1.5, sm: 2 },
        borderRadius: 3,
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Stack sx={{ mb: 1.5 }}>
        <Typography variant="subtitle1" fontWeight={700}>
          O ano letivo de uma vez
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Cada quadrado é uma semana, pintada pela situação mais grave entre os
          clubinhos. Toque para saltar até ela.
        </Typography>
      </Stack>

      <Box
        role="list"
        sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}
      >
        {weeks.map((week) => {
          const status = weekOverallStatus(week);
          const color = statusColor(theme, status);
          const isSelected = selected.has(week.week);
          const isCurrent = week.timeline === ClubWeekTimeline.Current;
          const pendencies = weekPendencyCount(week);

          const details = [
            `Semana ${week.week} · ${weekRangeLabel(week)}`,
            weekStatusLabel(status),
            `${formatRate(week.counts.completionRate)} das pagelas lançadas`,
            pendencies > 0 ? `${pendencies} clubinho(s) devendo` : null,
          ]
            .filter((line): line is string => line !== null)
            .join(' • ');

          return (
            <Tooltip key={week.week} title={details} enterTouchDelay={0}>
              <Box
                component="button"
                type="button"
                role="listitem"
                aria-label={details}
                aria-current={isSelected ? 'true' : undefined}
                onClick={() => onSelectWeek(week.week)}
                data-testid={`club-weekly-summary-strip-${week.week}`}
                sx={{
                  width: HEAT_STRIP_CELL_SIZE,
                  height: HEAT_STRIP_CELL_SIZE,
                  p: 0,
                  cursor: 'pointer',
                  borderRadius: 1,
                  bgcolor: alpha(color, isSelected ? 0.45 : 0.18),
                  color: theme.palette.text.primary,
                  border: `1px solid ${alpha(color, isSelected ? 1 : 0.35)}`,
                  outline: isCurrent
                    ? `2px solid ${theme.palette.primary.main}`
                    : 'none',
                  outlineOffset: 1,
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  fontFamily: 'inherit',
                  lineHeight: 1,
                  transition: 'transform 120ms ease',
                  '&:hover': { transform: 'scale(1.12)' },
                  '&:focus-visible': {
                    outline: `2px solid ${theme.palette.primary.main}`,
                  },
                }}
              >
                {week.week}
              </Box>
            </Tooltip>
          );
        })}
      </Box>
    </Paper>
  );
}
