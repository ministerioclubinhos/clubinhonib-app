import React from 'react';
import { Box, Paper, Typography, CircularProgress, useTheme, Grid, LinearProgress, Chip } from '@mui/material';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { EmojiEvents, TrendingUp, Group } from '@mui/icons-material';
import { useAcceptedChristsChartData } from '../hooks';
import { StatisticsFilters } from '../api';

interface EnhancedDecisionsChartProps {
  filters?: StatisticsFilters;
}

export const EnhancedDecisionsChart: React.FC<EnhancedDecisionsChartProps> = ({ filters }) => {
  const theme = useTheme();
  const { data, isLoading } = useAcceptedChristsChartData(filters);

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
        <Typography color="error">Erro ao carregar dados de decisões</Typography>
      </Paper>
    );
  }

  const chartData = data.timeSeries.map((item) => ({
    date: item.date,
    total: item.series.total,
    accepted: item.series.ACCEPTED || 0,
    reconciled: item.series.RECONCILED || 0,
  }));

  const totalAccepted = chartData.reduce((sum, item) => sum + item.accepted, 0);
  const totalReconciled = chartData.reduce((sum, item) => sum + item.reconciled, 0);
  const totalDecisions = totalAccepted + totalReconciled;

  const pieData = [
    { name: 'Aceitaram Cristo', value: totalAccepted, color: theme.palette.success.main },
    { name: 'Reconciliados', value: totalReconciled, color: theme.palette.info.main },
  ];

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
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: entry.fill || entry.stroke }} />
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

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontWeight="bold">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Box>
      {/* Cards de Resumo */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.primary.main}05 100%)`,
              border: `2px solid ${theme.palette.primary.main}30`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: `${theme.palette.primary.main}20`,
                }}
              >
                <EmojiEvents sx={{ fontSize: 32, color: theme.palette.primary.main }} />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" fontWeight={600}>
                  Total de Decisões
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="primary">
                  {totalDecisions}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              background: `linear-gradient(135deg, ${theme.palette.success.main}15 0%, ${theme.palette.success.main}05 100%)`,
              border: `2px solid ${theme.palette.success.main}30`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: `${theme.palette.success.main}20`,
                }}
              >
                <TrendingUp sx={{ fontSize: 32, color: theme.palette.success.main }} />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" fontWeight={600}>
                  Aceitaram Cristo
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="success.main">
                  {totalAccepted}
                </Typography>
                <Chip
                  label={`${((totalAccepted / totalDecisions) * 100).toFixed(0)}%`}
                  size="small"
                  color="success"
                  sx={{ mt: 0.5 }}
                />
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              background: `linear-gradient(135deg, ${theme.palette.info.main}15 0%, ${theme.palette.info.main}05 100%)`,
              border: `2px solid ${theme.palette.info.main}30`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: `${theme.palette.info.main}20`,
                }}
              >
                <Group sx={{ fontSize: 32, color: theme.palette.info.main }} />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" fontWeight={600}>
                  Reconciliados
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="info.main">
                  {totalReconciled}
                </Typography>
                <Chip
                  label={`${((totalReconciled / totalDecisions) * 100).toFixed(0)}%`}
                  size="small"
                  color="info"
                  sx={{ mt: 0.5 }}
                />
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Gráficos */}
      <Grid container spacing={3}>
        {/* Gráfico de Área Temporal */}
        <Grid item xs={12} lg={8}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.primary.main}03 100%)`,
              border: `2px solid ${theme.palette.divider}`,
            }}
          >
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              ✝️ Evolução de Decisões ao Longo do Tempo
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Acompanhamento temporal das decisões por Cristo
            </Typography>

            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorAccepted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={theme.palette.success.main} stopOpacity={0.6} />
                    <stop offset="95%" stopColor={theme.palette.success.main} stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="colorReconciled" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={theme.palette.info.main} stopOpacity={0.6} />
                    <stop offset="95%" stopColor={theme.palette.info.main} stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                <XAxis dataKey="date" stroke={theme.palette.text.secondary} style={{ fontSize: 12 }} />
                <YAxis stroke={theme.palette.text.secondary} style={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="accepted"
                  name="Aceitaram"
                  stroke={theme.palette.success.main}
                  strokeWidth={2}
                  fill="url(#colorAccepted)"
                />
                <Area
                  type="monotone"
                  dataKey="reconciled"
                  name="Reconciliados"
                  stroke={theme.palette.info.main}
                  strokeWidth={2}
                  fill="url(#colorReconciled)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Gráfico de Pizza */}
        <Grid item xs={12} lg={4}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              height: '100%',
              background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.success.main}03 100%)`,
              border: `2px solid ${theme.palette.divider}`,
            }}
          >
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              📊 Distribuição
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Proporção de cada tipo de decisão
            </Typography>

            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            <Box sx={{ mt: 2 }}>
              {pieData.map((item) => (
                <Box key={item.name} sx={{ mb: 1.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: item.color }} />
                      <Typography variant="body2">{item.name}</Typography>
                    </Box>
                    <Typography variant="body2" fontWeight="bold">
                      {item.value}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(item.value / totalDecisions) * 100}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: `${item.color}15`,
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                        bgcolor: item.color,
                      },
                    }}
                  />
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

