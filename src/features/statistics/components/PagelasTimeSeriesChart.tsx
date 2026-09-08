import React from 'react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
  useTheme,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { usePagelasChartData } from '../hooks';
import type { PagelasStatsQueryDto } from '../types';
import { ChartError } from './ui';

interface PagelasTimeSeriesChartProps {
  filters?: PagelasStatsQueryDto;
}

export const PagelasTimeSeriesChart: React.FC<PagelasTimeSeriesChartProps> = ({ filters }) => {
  const theme = useTheme();
  const { data, isLoading, error, refetch } = usePagelasChartData(filters);
  const [selectedSeries, setSelectedSeries] = React.useState<string[]>(['total', 'presence']);

  if (isLoading) {
    return (
      <Paper data-testid="statistics-pagelas-time-series-chart" elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      </Paper>
    );
  }

  if (error || !data || !data.timeSeries) {
    return (
      <Paper data-testid="statistics-pagelas-time-series-chart" elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <ChartError
          subject="os dados de pagelas"
          error={error}
          onRetry={() => void refetch()}
        />
      </Paper>
    );
  }

  const timeSeries = data.timeSeries;
  const combinedData = timeSeries.total.map((item, index) => ({
    date: item.date,
    total: item.value,
    presence: timeSeries.presence?.[index]?.value || 0,
    meditation: timeSeries.meditation?.[index]?.value || 0,
    verseRecitation: timeSeries.verseRecitation?.[index]?.value || 0,
  }));

  const handleSeriesToggle = (
    event: React.MouseEvent<HTMLElement>,
    newSeries: string[]
  ) => {
    if (newSeries.length > 0) {
      setSelectedSeries(newSeries);
    }
  };

  const seriesConfig = {
    total: {
      label: 'Total',
      color: theme.palette.primary.main,
    },
    presence: {
      label: 'Presença',
      color: theme.palette.success.main,
    },
    meditation: {
      label: 'Meditação',
      color: theme.palette.info.main,
    },
    verseRecitation: {
      label: 'Recitação',
      color: theme.palette.secondary.main,
    },
  };

  return (
    <Paper data-testid="statistics-pagelas-time-series-chart" elevation={3} sx={{ p: 3, borderRadius: 2 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h6" fontWeight="bold">
          📊 Evolução de Pagelas ao Longo do Tempo
        </Typography>
        <ToggleButtonGroup
          value={selectedSeries}
          onChange={handleSeriesToggle}
          aria-label="séries de dados"
          size="small"
        >
          {Object.entries(seriesConfig).map(([key, config]) => (
            <ToggleButton key={key} value={key} aria-label={config.label}>
              {config.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={combinedData}>
          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
          <XAxis
            dataKey="date"
            stroke={theme.palette.text.secondary}
            style={{ fontSize: 12 }}
          />
          <YAxis stroke={theme.palette.text.secondary} style={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 8,
            }}
          />
          <Legend />
          {selectedSeries.map((key) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              name={seriesConfig[key as keyof typeof seriesConfig].label}
              stroke={seriesConfig[key as keyof typeof seriesConfig].color}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </Paper>
  );
};

