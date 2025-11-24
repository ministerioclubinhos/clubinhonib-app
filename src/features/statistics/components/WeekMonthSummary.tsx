import React from 'react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  useTheme,
  Grid,
  LinearProgress,
  Chip,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { CalendarToday, TrendingUp, TrendingDown } from '@mui/icons-material';
import { useOverview } from '../hooks';

export const WeekMonthSummary: React.FC = () => {
  const theme = useTheme();
  const { data, isLoading } = useOverview();

  if (isLoading || !data) {
    return (
      <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      </Paper>
    );
  }

  const weekVsMonth = [
    {
      period: 'Esta Semana',
      total: data.pagelas.thisWeek.total,
      presenceRate: data.pagelas.thisWeek.presenceRate,
      decisions: data.acceptedChrists.thisWeek,
    },
    {
      period: 'Este Mês',
      total: data.pagelas.thisMonth.total,
      presenceRate: data.pagelas.thisMonth.presenceRate,
      decisions: data.acceptedChrists.thisMonth,
    },
  ];

  const getTrend = (weekValue: number, monthValue: number) => {
    const weeklyAvg = monthValue / 4; // Aproximação de 4 semanas
    if (weekValue > weeklyAvg * 1.1) {
      return { icon: <TrendingUp />, color: theme.palette.success.main, text: 'Acima da média' };
    }
    if (weekValue < weeklyAvg * 0.9) {
      return { icon: <TrendingDown />, color: theme.palette.error.main, text: 'Abaixo da média' };
    }
    return { icon: <TrendingUp />, color: theme.palette.info.main, text: 'Na média' };
  };

  const pagelaTrend = getTrend(data.pagelas.thisWeek.total, data.pagelas.thisMonth.total);
  const decisionTrend = getTrend(data.acceptedChrists.thisWeek, data.acceptedChrists.thisMonth);

  return (
    <Grid container spacing={3}>
      {/* Card Resumo Semana vs Mês */}
      <Grid item xs={12} md={6}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 3,
            background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.primary.main}05 100%)`,
            border: `2px solid ${theme.palette.divider}`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
            <CalendarToday sx={{ fontSize: 24, color: theme.palette.primary.main }} />
            <Typography variant="h6" fontWeight="bold">
              📅 Resumo: Semana vs Mês
            </Typography>
          </Box>

          {/* Pagelas */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Pagelas Registradas
            </Typography>
            <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Esta Semana
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="primary">
                  {data.pagelas.thisWeek.total}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {data.pagelas.thisWeek.presenceRate.toFixed(1)}% presença
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Este Mês
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="primary">
                  {data.pagelas.thisMonth.total}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {data.pagelas.thisMonth.presenceRate.toFixed(1)}% presença
                </Typography>
              </Box>
            </Box>
            <Chip
              icon={pagelaTrend.icon}
              label={pagelaTrend.text}
              size="small"
              sx={{
                bgcolor: `${pagelaTrend.color}15`,
                color: pagelaTrend.color,
                fontWeight: 600,
              }}
            />
          </Box>

          {/* Decisões */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Decisões por Cristo
            </Typography>
            <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Esta Semana
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="success.main">
                  {data.acceptedChrists.thisWeek}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Este Mês
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="success.main">
                  {data.acceptedChrists.thisMonth}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Este Ano
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="success.main">
                  {data.acceptedChrists.thisYear}
                </Typography>
              </Box>
            </Box>
            <Chip
              icon={decisionTrend.icon}
              label={decisionTrend.text}
              size="small"
              sx={{
                bgcolor: `${decisionTrend.color}15`,
                color: decisionTrend.color,
                fontWeight: 600,
              }}
            />
          </Box>

          {/* Distribuição de Decisões */}
          <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(76, 175, 80, 0.08)', borderRadius: 2 }}>
            <Typography variant="caption" color="text.secondary" gutterBottom display="block">
              Distribuição de Decisões (Ano Todo)
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2">Aceitaram</Typography>
                <Typography variant="h6" fontWeight="bold" color="success.main">
                  {data.acceptedChrists.byDecisionType.ACCEPTED}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={
                    (data.acceptedChrists.byDecisionType.ACCEPTED / data.acceptedChrists.thisYear) *
                    100
                  }
                  sx={{
                    mt: 0.5,
                    height: 6,
                    borderRadius: 3,
                    bgcolor: `${theme.palette.success.main}15`,
                    '& .MuiLinearProgress-bar': {
                      bgcolor: theme.palette.success.main,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">Reconciliados</Typography>
                <Typography variant="h6" fontWeight="bold" color="info.main">
                  {data.acceptedChrists.byDecisionType.RECONCILED}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={
                    (data.acceptedChrists.byDecisionType.RECONCILED / data.acceptedChrists.thisYear) *
                    100
                  }
                  sx={{
                    mt: 0.5,
                    height: 6,
                    borderRadius: 3,
                    bgcolor: `${theme.palette.info.main}15`,
                    '& .MuiLinearProgress-bar': {
                      bgcolor: theme.palette.info.main,
                    },
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Grid>

      {/* Gráfico de Últimas Semanas */}
      <Grid item xs={12} md={6}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 3,
            background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.success.main}05 100%)`,
            border: `2px solid ${theme.palette.divider}`,
          }}
        >
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            📊 Últimas 6 Semanas - Pagelas
          </Typography>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={data.pagelas.lastSixWeeks}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.6} />
                  <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
              <XAxis dataKey="date" stroke={theme.palette.text.secondary} style={{ fontSize: 11 }} />
              <YAxis stroke={theme.palette.text.secondary} style={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 8,
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                name="Total"
                stroke={theme.palette.primary.main}
                strokeWidth={2}
                fill="url(#colorValue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Paper>
      </Grid>

      {/* Gráfico de Últimos Meses - Decisões */}
      <Grid item xs={12}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 3,
            background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.success.main}05 100%)`,
            border: `2px solid ${theme.palette.divider}`,
          }}
        >
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            ✝️ Últimos 6 Meses - Decisões por Cristo
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data.acceptedChrists.lastSixMonths}>
              <defs>
                <linearGradient id="colorDecisions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={theme.palette.success.main} stopOpacity={0.6} />
                  <stop offset="95%" stopColor={theme.palette.success.main} stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
              <XAxis dataKey="date" stroke={theme.palette.text.secondary} style={{ fontSize: 11 }} />
              <YAxis stroke={theme.palette.text.secondary} style={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 8,
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                name="Decisões"
                stroke={theme.palette.success.main}
                strokeWidth={2}
                fill="url(#colorDecisions)"
              />
            </AreaChart>
          </ResponsiveContainer>

          {/* Stats Rápidas */}
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={12} sm={3}>
              <Typography variant="caption" color="text.secondary">
                Média Mensal
              </Typography>
              <Typography variant="h6" fontWeight="bold" color="success.main">
                {(() => {
                  if (!data.acceptedChrists.lastSixMonths || data.acceptedChrists.lastSixMonths.length === 0) return '0';
                  const avg = data.acceptedChrists.lastSixMonths.reduce((sum, m) => sum + (m.value || 0), 0) / 6;
                  return isNaN(avg) ? '0' : avg.toFixed(0);
                })()}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Typography variant="caption" color="text.secondary">
                Melhor Mês
              </Typography>
              <Typography variant="h6" fontWeight="bold" color="success.main">
                {(() => {
                  if (!data.acceptedChrists.lastSixMonths || data.acceptedChrists.lastSixMonths.length === 0) return '0';
                  const max = Math.max(...data.acceptedChrists.lastSixMonths.map((m) => m.value || 0));
                  return isNaN(max) || max === -Infinity ? '0' : max.toString();
                })()}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Typography variant="caption" color="text.secondary">
                Total (6 meses)
              </Typography>
              <Typography variant="h6" fontWeight="bold" color="success.main">
                {(() => {
                  if (!data.acceptedChrists.lastSixMonths) return '0';
                  const total = data.acceptedChrists.lastSixMonths.reduce((sum, m) => sum + (m.value || 0), 0);
                  return isNaN(total) ? '0' : total.toString();
                })()}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Typography variant="caption" color="text.secondary">
                Projeção Anual
              </Typography>
              <Typography variant="h6" fontWeight="bold" color="success.main">
                {(() => {
                  if (!data.acceptedChrists.lastSixMonths || data.acceptedChrists.lastSixMonths.length === 0) return '0';
                  const total = data.acceptedChrists.lastSixMonths.reduce((sum, m) => sum + (m.value || 0), 0);
                  const projection = (total / 6) * 12;
                  return isNaN(projection) ? '0' : projection.toFixed(0);
                })()}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  );
};

