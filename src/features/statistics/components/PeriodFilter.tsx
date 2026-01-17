import React from 'react';
import { TextField, MenuItem, Grid, Box, Typography } from '@mui/material';
import { CalendarToday, Info } from '@mui/icons-material';
import { PeriodShortcut } from '../api';
import { getPeriodDescription } from '../utils/periodHelpers';
import { SimpleDatePicker } from '@/components/common/inputs';

interface PeriodFilterProps {
  period?: PeriodShortcut;
  startDate?: string;
  endDate?: string;
  onPeriodChange: (period: PeriodShortcut | undefined) => void;
  onStartDateChange: (date: string | undefined) => void;
  onEndDateChange: (date: string | undefined) => void;
  showDescription?: boolean;
}

export const PeriodFilter: React.FC<PeriodFilterProps> = ({
  period,
  startDate,
  endDate,
  onPeriodChange,
  onStartDateChange,
  onEndDateChange,
  showDescription = true,
}) => {
  const isCustomPeriod = period === 'custom';
  const description = showDescription ? getPeriodDescription(period, startDate, endDate) : null;

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            fullWidth
            select
            label="Período"
            value={period || ''}
            onChange={(e) => {
              const value = e.target.value as PeriodShortcut | '';
              onPeriodChange(value || undefined);

              if (value && value !== 'custom') {
                onStartDateChange(undefined);
                onEndDateChange(undefined);
              }
            }}
            size="small"
            InputProps={{
              startAdornment: <CalendarToday sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />,
            }}
          >
            <MenuItem value="">Todos os Períodos</MenuItem>
            <MenuItem value="today">Hoje</MenuItem>
            <MenuItem value="this_week">Esta Semana</MenuItem>
            <MenuItem value="this_month">Este Mês</MenuItem>
            <MenuItem value="last_7_days">Últimos 7 Dias</MenuItem>
            <MenuItem value="last_30_days">Últimos 30 Dias</MenuItem>
            <MenuItem value="this_year">Este Ano</MenuItem>
            <MenuItem value="custom">Personalizado...</MenuItem>
          </TextField>
        </Grid>

        {isCustomPeriod && (
          <Grid item xs={12} sm={6} md={4}>
            <SimpleDatePicker
              value={startDate || ''}
              onChange={(value) => onStartDateChange(value || undefined)}
              label="Data Início"
              size="small"
              margin="none"
            />
          </Grid>
        )}

        {isCustomPeriod && (
          <Grid item xs={12} sm={6} md={4}>
            <SimpleDatePicker
              value={endDate || ''}
              onChange={(value) => onEndDateChange(value || undefined)}
              label="Data Fim"
              size="small"
              margin="none"
            />
          </Grid>
        )}
      </Grid>

      {showDescription && description && (
        <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Info sx={{ fontSize: 16, color: 'info.main' }} />
          <Typography variant="caption" color="info.main">
            {description}
          </Typography>
        </Box>
      )}
    </Box>
  );
};
