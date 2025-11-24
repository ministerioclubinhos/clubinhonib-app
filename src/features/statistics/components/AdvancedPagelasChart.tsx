import React from 'react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
  useTheme,
  ButtonGroup,
  Button,
} from '@mui/material';
import {
  ComposedChart,
  Line,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ShowChart, BarChart as BarChartIcon, Timeline } from '@mui/icons-material';
import { usePagelasChartData } from '../hooks';
import { StatisticsFilters } from '../api';

interface AdvancedPagelasChartProps {
  filters?: StatisticsFilters;
}

type ChartType = 'line' | 'bar' | 'area' | 'composed';

export const AdvancedPagelasChart: React.FC<AdvancedPagelasChartProps> = ({ filters }) => {
  const theme = useTheme();
  const { data, isLoading } = usePagelasChartData(filters);
  const [chartType, setChartType] = React.useState<ChartType>('composed');
  const [selectedMetrics, setSelectedMetrics] = React.useState<string[]>(['total', 'presence']);

  if (isLoading) {
    return (
      <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      </Paper>
    );
  }

  if (!data) {
    return (
      <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
        <Typography color="error">Erro ao carregar dados</Typography>
      </Paper>
    );
  }

  const combinedData = data.timeSeries.total.map((item, index) => ({
    date: item.date,
    total: item.value,
    presence: data.timeSeries.presence[index]?.value || 0,
    meditation: data.timeSeries.meditation[index]?.value || 0,
    verseRecitation: data.timeSeries.verseRecitation[index]?.value || 0,
  }));

  const metrics = [
    { key: 'total', label: 'Total', color: theme.palette.primary.main },
    { key: 'presence', label: 'Presença', color: theme.palette.success.main },
    { key: 'meditation', label: 'Meditação', color: theme.palette.info.main },
    { key: 'verseRecitation', label: 'Recitação', color: theme.palette.secondary.main },
  ];

  const handleMetricToggle = (event: React.MouseEvent<HTMLElement>, newMetrics: string[]) => {
    if (newMetrics.length > 0) {
      setSelectedMetrics(newMetrics);
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Paper
          elevation={8}
          sx={{
            p: 2,
            background: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 2,
          }}
        >
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            {label}
          </Typography>
          {payload.map((entry: any, index: number) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: entry.color }} />
              <Typography variant="body2">
                {entry.name}: <strong>{entry.value}</strong>
              </Typography>
            </Box>
          ))}
        </Paper>
      );
    }
    return null;
  };

  const renderChart = () => {
    const commonProps = {
      data: combinedData,
      margin: { top: 10, right: 30, left: 0, bottom: 0 },
    };

    switch (chartType) {
      case 'line':
        return (
          <ComposedChart {...commonProps}>
            <defs>
              {metrics.map((metric) => (
                <linearGradient key={metric.key} id={`gradient-${metric.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={metric.color} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={metric.color} stopOpacity={0.1} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
            <XAxis dataKey="date" stroke={theme.palette.text.secondary} />
            <YAxis stroke={theme.palette.text.secondary} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {selectedMetrics.map((key) => {
              const metric = metrics.find((m) => m.key === key);
              return metric ? (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  name={metric.label}
                  stroke={metric.color}
                  strokeWidth={3}
                  dot={{ r: 5, strokeWidth: 2 }}
                  activeDot={{ r: 7 }}
                />
              ) : null;
            })}
          </ComposedChart>
        );

      case 'area':
        return (
          <ComposedChart {...commonProps}>
            <defs>
              {metrics.map((metric) => (
                <linearGradient key={metric.key} id={`area-gradient-${metric.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={metric.color} stopOpacity={0.6} />
                  <stop offset="95%" stopColor={metric.color} stopOpacity={0.1} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
            <XAxis dataKey="date" stroke={theme.palette.text.secondary} />
            <YAxis stroke={theme.palette.text.secondary} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {selectedMetrics.map((key) => {
              const metric = metrics.find((m) => m.key === key);
              return metric ? (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  name={metric.label}
                  stroke={metric.color}
                  strokeWidth={2}
                  fill={`url(#area-gradient-${key})`}
                />
              ) : null;
            })}
          </ComposedChart>
        );

      case 'bar':
        return (
          <ComposedChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
            <XAxis dataKey="date" stroke={theme.palette.text.secondary} />
            <YAxis stroke={theme.palette.text.secondary} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {selectedMetrics.map((key) => {
              const metric = metrics.find((m) => m.key === key);
              return metric ? <Bar key={key} dataKey={key} name={metric.label} fill={metric.color} /> : null;
            })}
          </ComposedChart>
        );

      case 'composed':
      default:
        return (
          <ComposedChart {...commonProps}>
            <defs>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.3} />
                <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
            <XAxis dataKey="date" stroke={theme.palette.text.secondary} />
            <YAxis stroke={theme.palette.text.secondary} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area
              type="monotone"
              dataKey="total"
              name="Total"
              fill="url(#colorTotal)"
              stroke={theme.palette.primary.main}
              strokeWidth={2}
            />
            <Bar dataKey="presence" name="Presença" fill={theme.palette.success.main} />
            <Line
              type="monotone"
              dataKey="meditation"
              name="Meditação"
              stroke={theme.palette.info.main}
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="verseRecitation"
              name="Recitação"
              stroke={theme.palette.secondary.main}
              strokeWidth={2}
            />
          </ComposedChart>
        );
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.primary.main}03 100%)`,
        border: `2px solid ${theme.palette.divider}`,
      }}
    >
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              📊 Evolução de Pagelas
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Análise temporal detalhada das atividades
            </Typography>
          </Box>

          <ButtonGroup size="small" variant="outlined">
            <Button
              onClick={() => setChartType('composed')}
              variant={chartType === 'composed' ? 'contained' : 'outlined'}
              startIcon={<ShowChart />}
            >
              Composto
            </Button>
            <Button
              onClick={() => setChartType('line')}
              variant={chartType === 'line' ? 'contained' : 'outlined'}
              startIcon={<ShowChart />}
            >
              Linha
            </Button>
            <Button
              onClick={() => setChartType('area')}
              variant={chartType === 'area' ? 'contained' : 'outlined'}
              startIcon={<Timeline />}
            >
              Área
            </Button>
            <Button
              onClick={() => setChartType('bar')}
              variant={chartType === 'bar' ? 'contained' : 'outlined'}
              startIcon={<BarChartIcon />}
            >
              Barras
            </Button>
          </ButtonGroup>
        </Box>

        {chartType !== 'composed' && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary" gutterBottom display="block">
              Selecione as métricas para visualizar:
            </Typography>
            <ToggleButtonGroup
              value={selectedMetrics}
              onChange={handleMetricToggle}
              size="small"
              aria-label="métricas"
            >
              {metrics.map((metric) => (
                <ToggleButton key={metric.key} value={metric.key} sx={{ textTransform: 'none' }}>
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: metric.color, mr: 1 }} />
                  {metric.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>
        )}
      </Box>

      <ResponsiveContainer width="100%" height={450}>
        {renderChart()}
      </ResponsiveContainer>
    </Paper>
  );
};

