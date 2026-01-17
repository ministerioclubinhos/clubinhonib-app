import React from 'react';
import { Box, Paper, Typography, Button, ButtonGroup, Chip, useTheme, Divider } from '@mui/material';
import {
  CalendarToday,
  DateRange,
  CalendarMonth,
  TodayOutlined,
  EventAvailable,
} from '@mui/icons-material';
import { StatisticsFilters } from '../api';
import dayjs from 'dayjs';
import { YearSelector } from './YearSelector';

interface QuickFiltersProps {
  onSelectFilter: (filters: StatisticsFilters) => void;
  currentFilters?: StatisticsFilters;
  showYearSelector?: boolean;
  selectedYear?: number;
  onYearChange?: (year: number) => void;
}

export const QuickFilters: React.FC<QuickFiltersProps> = ({
  onSelectFilter,
  currentFilters,
  showYearSelector = true,
  selectedYear,
  onYearChange,
}) => {
  const theme = useTheme();
  const [internalYear, setInternalYear] = React.useState(new Date().getFullYear());

  const handleYearChange = (year: number) => {
    setInternalYear(year);
    if (onYearChange) {
      onYearChange(year);
    }
  };

  const effectiveYear = selectedYear || internalYear;

  const quickFilters = [
    {
      label: 'Hoje',
      icon: <TodayOutlined />,
      color: theme.palette.primary.main,
      getFilters: (): StatisticsFilters => ({
        startDate: dayjs().format('YYYY-MM-DD'),
        endDate: dayjs().format('YYYY-MM-DD'),
        groupBy: 'day',
      }),
    },
    {
      label: 'Esta Semana',
      icon: <CalendarToday />,
      color: theme.palette.info.main,
      getFilters: (): StatisticsFilters => ({
        startDate: dayjs().startOf('week').format('YYYY-MM-DD'),
        endDate: dayjs().endOf('week').format('YYYY-MM-DD'),
        groupBy: 'day',
      }),
    },
    {
      label: 'Este Mês',
      icon: <CalendarMonth />,
      color: theme.palette.success.main,
      getFilters: (): StatisticsFilters => {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return {
          startDate: dayjs(firstDay).format('YYYY-MM-DD'),
          endDate: dayjs(lastDay).format('YYYY-MM-DD'),
          groupBy: 'week',
        };
      },
    },
    {
      label: 'Últimos 7 Dias',
      icon: <DateRange />,
      color: theme.palette.secondary.main,
      getFilters: (): StatisticsFilters => ({
        startDate: dayjs().subtract(6, 'days').format('YYYY-MM-DD'),
        endDate: dayjs().format('YYYY-MM-DD'),
        groupBy: 'day',
      }),
    },
    {
      label: 'Últimos 30 Dias',
      icon: <DateRange />,
      color: theme.palette.warning.main,
      getFilters: (): StatisticsFilters => ({
        startDate: dayjs().subtract(29, 'days').format('YYYY-MM-DD'),
        endDate: dayjs().format('YYYY-MM-DD'),
        groupBy: 'week',
      }),
    },
    {
      label: 'Este Ano',
      icon: <EventAvailable />,
      color: theme.palette.error.main,
      getFilters: (): StatisticsFilters => ({
        year: new Date().getFullYear(),
        groupBy: 'month',
      }),
    },
  ];

  const isFilterActive = (filter: typeof quickFilters[0]) => {
    const filterConfig = filter.getFilters();
    if (!currentFilters) return false;

    if (filterConfig.year) {
      return currentFilters.year === filterConfig.year;
    }

    return (
      currentFilters.startDate === filterConfig.startDate &&
      currentFilters.endDate === filterConfig.endDate
    );
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 1.5, sm: 2 },
        borderRadius: 2,
        mb: { xs: 2, sm: 3 },
        background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.primary.main}03 100%)`,
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: { xs: 1.5, sm: 2 }, flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EventAvailable sx={{ fontSize: { xs: 18, sm: 20 }, color: theme.palette.text.secondary }} />
          <Typography variant="subtitle2" fontWeight={600} color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
            Atalhos Rápidos
          </Typography>
        </Box>
        {showYearSelector && (
          <YearSelector
            selectedYear={effectiveYear}
            onYearChange={handleYearChange}
            yearsRange={3}
            showLabel={true}
          />
        )}
      </Box>

      <Box
        sx={{
          display: 'flex',
          gap: { xs: 0.75, sm: 1 },
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        {quickFilters.map((filter, index) => {
          const active = isFilterActive(filter);
          return (
            <Button
              key={index}
              size="small"
              variant={active ? 'contained' : 'outlined'}
              startIcon={filter.icon}
              onClick={() => onSelectFilter(filter.getFilters())}
              sx={{
                textTransform: 'none',
                borderRadius: 2,
                borderColor: active ? undefined : `${filter.color}50`,
                color: active ? undefined : filter.color,
                bgcolor: active ? filter.color : 'transparent',
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                px: { xs: 1, sm: 1.5 },
                '&:hover': {
                  bgcolor: active ? filter.color : `${filter.color}15`,
                  borderColor: filter.color,
                },
              }}
            >
              {filter.label}
            </Button>
          );
        })}
      </Box>

      {currentFilters?.startDate && currentFilters?.endDate && (
        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Período ativo:
          </Typography>
          <Chip
            label={`${dayjs(currentFilters.startDate).format('DD/MM')} - ${dayjs(currentFilters.endDate).format('DD/MM/YYYY')}`}
            size="small"
            color="primary"
            variant="outlined"
          />
          {currentFilters.groupBy && (
            <Chip
              label={`Agrupado por ${currentFilters.groupBy === 'day' ? 'dia' : currentFilters.groupBy === 'week' ? 'semana' : currentFilters.groupBy === 'month' ? 'mês' : 'ano'}`}
              size="small"
              variant="outlined"
            />
          )}
        </Box>
      )}
    </Paper>
  );
};

