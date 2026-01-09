import * as React from 'react';
import {
  Box,
  Button,
  ButtonGroup,
  IconButton,
  Tooltip,
  useMediaQuery,
  useTheme,
  Chip,
  Stack,
} from '@mui/material';
import { ChevronLeft, ChevronRight, Today } from '@mui/icons-material';
import { toLabelWeek } from '../utils';

type Props = {
  year: number;
  week: number;
  onChange: (next: { year: number; week: number }) => void;
  goCurrent: () => void;
};

export default function WeekBar({ year, week, onChange, goCurrent }: Props) {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));

  const dec = () => onChange(week > 1 ? { year, week: week - 1 } : { year: year - 1, week: 53 });
  const inc = () => onChange(week < 53 ? { year, week: week + 1 } : { year: year + 1, week: 1 });

  const label = toLabelWeek ? toLabelWeek(year, week) : `Ano ${year} • Semana ${week}`;

  if (isXs) {
    return (
      <Stack spacing={1}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title="Semana anterior">
              <IconButton size="small" onClick={dec}>
                <ChevronLeft />
              </IconButton>
            </Tooltip>
            <Tooltip title="Semana atual">
              <IconButton size="small" onClick={goCurrent}>
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
            sx={{ fontWeight: 700, maxWidth: '60%', '& .MuiChip-label': { px: 1 } }}
          />
        </Box>
      </Stack>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1,
        alignItems: 'center',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
      }}
    >
      <ButtonGroup variant="outlined" size="small" sx={{ borderRadius: 999, overflow: 'hidden' }}>
        <Button onClick={dec} startIcon={<ChevronLeft />}>
          Anterior
        </Button>
        <Tooltip title="Semana atual">
          <Button onClick={goCurrent} startIcon={<Today />}>
            Hoje
          </Button>
        </Tooltip>
        <Button onClick={inc} endIcon={<ChevronRight />}>
          Próxima
        </Button>
      </ButtonGroup>

      <Chip
        size="small"
        color="default"
        label={label}
        sx={{ fontWeight: 700, '& .MuiChip-label': { px: 1 } }}
      />
    </Box>
  );
}
