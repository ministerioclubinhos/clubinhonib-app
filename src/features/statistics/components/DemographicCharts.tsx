import React from 'react';
import { Box, Paper, Typography, CircularProgress, Grid, useTheme } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { usePagelasChartData } from '../hooks';
import { StatisticsFilters } from '../api';

interface DemographicChartsProps {
  filters?: StatisticsFilters;
}

export const DemographicCharts: React.FC<DemographicChartsProps> = ({ filters }) => {
  const theme = useTheme();
  const { data, isLoading, error } = usePagelasChartData(filters);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography color="error">Erro ao carregar dados demográficos</Typography>
      </Box>
    );
  }

  const genderColors = {
    M: theme.palette.info.main,
    F: theme.palette.secondary.main,
  };

  const genderData = data.byGender.map((item) => ({
    ...item,
    genderLabel: item.gender === 'M' ? 'Masculino' : 'Feminino',
  }));

  const ageGroupColors = [
    theme.palette.primary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
  ];

  return (
    <Grid container spacing={3}>
      
      <Grid item xs={12} md={6}>
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            👥 Distribuição por Gênero
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={genderData}
                dataKey="total"
                nameKey="genderLabel"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ genderLabel, total, percent }) =>
                  `${genderLabel}: ${total} (${(percent * 100).toFixed(0)}%)`
                }
              >
                {genderData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={genderColors[entry.gender as keyof typeof genderColors]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 8,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            🎂 Distribuição por Faixa Etária
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.byAgeGroup}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
              <XAxis
                dataKey="ageGroup"
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
              <Bar dataKey="total" name="Total" fill={theme.palette.primary.main} />
              <Bar
                dataKey="presenceRate"
                name="Taxa de Presença (%)"
                fill={theme.palette.success.main}
              />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      <Grid item xs={12}>
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            ⏱️ Análise por Tempo de Participação
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.byParticipationTime}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
              <XAxis
                dataKey="timeRange"
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
              <Bar dataKey="total" name="Total" fill={theme.palette.info.main} />
              <Bar
                dataKey="presenceRate"
                name="Taxa de Presença (%)"
                fill={theme.palette.success.main}
              />
              <Bar
                dataKey="avgMonthsParticipating"
                name="Média de Meses"
                fill={theme.palette.warning.main}
              />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>
    </Grid>
  );
};

