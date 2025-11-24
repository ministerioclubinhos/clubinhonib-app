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
import { StatisticsFilters } from '../api';

interface PagelasTimeSeriesChartProps {
  filters?: StatisticsFilters;
}

export const PagelasTimeSeriesChart: React.FC<PagelasTimeSeriesChartProps> = ({ filters }) => {
  const theme = useTheme();
  const { data, isLoading, error } = usePagelasChartData(filters);
  const [selectedSeries, setSelectedSeries] = React.useState<string[]>(['total', 'presence']);

  if (isLoading) {
    return (
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      </Paper>
    );
  }

  if (error || !data) {
    return (
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Typography color="error">Erro ao carregar dados de pagelas</Typography>
      </Paper>
    );
  }

  // Combinar dados de todas as séries em um array único
  const combinedData = data.timeSeries.total.map((item, index) => ({
    date: item.date,
    total: item.value,
    presence: data.timeSeries.presence[index]?.value || 0,
    meditation: data.timeSeries.meditation[index]?.value || 0,
    verseRecitation: data.timeSeries.verseRecitation[index]?.value || 0,
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
    <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
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

