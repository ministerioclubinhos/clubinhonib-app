import React from 'react';
import { Box, IconButton, Tooltip, Chip } from '@mui/material';
import { ChevronLeft, ChevronRight, Today } from '@mui/icons-material';
import { toLabelWeek } from '../utils';

type Props = {
  year: number;
  week: number;
  onChange: (next: { year: number; week: number }) => void;
  currentYear?: number;
  currentWeek?: number;
};

export default function WeekPicker({ year, week, onChange, currentYear, currentWeek }: Props) {
  const dec = () => onChange(week > 1 ? { year, week: week - 1 } : { year: year - 1, week: 53 });
  const inc = () => onChange(week < 53 ? { year, week: week + 1 } : { year: year + 1, week: 1 });
  const goToday = () => onChange({ year: currentYear ?? year, week: currentWeek ?? week });

  const label = toLabelWeek ? toLabelWeek(year, week) : `Ano ${year} • Semana ${week}`;

  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'space-between' }}>
      <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
        <Tooltip title="Semana anterior">
          <IconButton size="small" onClick={dec}>
            <ChevronLeft />
          </IconButton>
        </Tooltip>

        <Tooltip title="Semana atual">
          <IconButton size="small" onClick={goToday}>
            <Today />
          </IconButton>
        </Tooltip>

        <Tooltip title="Próxima semana">
          <IconButton size="small" onClick={inc}>
            <ChevronRight />
          </IconButton>
        </Tooltip>
      </Box>

      <Chip
        size="small"
        color="default"
        label={label}
        sx={{ fontWeight: 700, '& .MuiChip-label': { px: 1 } }}
      />
    </Box>
  );
}
