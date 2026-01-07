import React from 'react';
import { Box, Paper, Typography, CircularProgress, useTheme } from '@mui/material';
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
import { useAcceptedChristsChartData } from '../hooks';
import { StatisticsFilters } from '../api';

interface AcceptedChristsChartProps {
  filters?: StatisticsFilters;
}

export const AcceptedChristsChart: React.FC<AcceptedChristsChartProps> = ({ filters }) => {
  const theme = useTheme();
  const { data, isLoading, error } = useAcceptedChristsChartData(filters);

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
        <Typography color="error">Erro ao carregar dados de decisões</Typography>
      </Paper>
    );
  }

  // Transformar os dados para o formato do gráfico
  const chartData = data.timeSeries.map((item) => ({
    date: item.date,
    total: item.series.total,
    accepted: item.series.ACCEPTED || 0,
    reconciled: item.series.RECONCILED || 0,
  }));

  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        ✝️ Decisões por Cristo ao Longo do Tempo
      </Typography>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
          <XAxis dataKey="date" stroke={theme.palette.text.secondary} style={{ fontSize: 12 }} />
          <YAxis stroke={theme.palette.text.secondary} style={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 8,
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="total"
            name="Total"
            stroke={theme.palette.primary.main}
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="accepted"
            name="Aceitaram"
            stroke={theme.palette.success.main}
            strokeWidth={2}
            dot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="reconciled"
            name="Reconciliados"
            stroke={theme.palette.info.main}
            strokeWidth={2}
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Resumo */}
      <Box sx={{ mt: 3, display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="body2" color="text.secondary">
            Total de Decisões
          </Typography>
          <Typography variant="h5" fontWeight="bold" color="primary">
            {chartData.reduce((sum, item) => sum + item.total, 0)}
          </Typography>
        </Box>
        <Box>
          <Typography variant="body2" color="text.secondary">
            Aceitaram Cristo
          </Typography>
          <Typography variant="h5" fontWeight="bold" color="success.main">
            {chartData.reduce((sum, item) => sum + item.accepted, 0)}
          </Typography>
        </Box>
        <Box>
          <Typography variant="body2" color="text.secondary">
            Reconciliados
          </Typography>
          <Typography variant="h5" fontWeight="bold" color="info.main">
            {chartData.reduce((sum, item) => sum + item.reconciled, 0)}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};
