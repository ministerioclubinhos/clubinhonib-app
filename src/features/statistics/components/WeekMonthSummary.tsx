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
  useMediaQuery,
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
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { data, isLoading } = useOverview();

  const lastSixWeeksData = React.useMemo(() => {
    if (!data?.pagelas?.lastSixWeeks || data.pagelas.lastSixWeeks.length === 0) return [];
    return data.pagelas.lastSixWeeks.map((item) => ({
      date: `S${item.week}/${item.year}`,
      value: item.total,
      presenceRate: item.presenceRate,
    }));
  }, [data?.pagelas?.lastSixWeeks]);

  const lastSixMonthsData = React.useMemo(() => {
    if (!data?.acceptedChrists?.lastSixMonths || data.acceptedChrists.lastSixMonths.length === 0) return [];
    return data.acceptedChrists.lastSixMonths.map((item) => ({
      date: item.month,
      value: item.total,
    }));
  }, [data?.acceptedChrists?.lastSixMonths]);

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
    const weeklyAvg = monthValue / 4;
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
    <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ width: '100%', maxWidth: '100%', margin: 0 }}>

      <Grid item xs={12} md={6} sx={{ width: '100%', maxWidth: '100%' }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 1.5, sm: 3 },
            borderRadius: 3,
            background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.primary.main}05 100%)`,
            border: `2px solid ${theme.palette.divider}`,
            width: '98%',
            maxWidth: '98%',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: { xs: 2, sm: 3 } }}>
            <CalendarToday sx={{ fontSize: { xs: 20, sm: 24 }, color: theme.palette.primary.main }} />
            <Typography variant="h6" fontWeight="bold" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
              📅 Resumo: Semana vs Mês
            </Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Pagelas Registradas
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 2, sm: 3 }, mb: 2 }}>
              <Box sx={{ flex: { xs: '1 1 calc(50% - 8px)', sm: 'none' }, minWidth: 0 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.875rem' } }}>
                  Esta Semana
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="primary" sx={{ fontSize: { xs: '1.25rem', sm: '2.125rem' }, wordBreak: 'break-word' }}>
                  {data.pagelas.thisWeek.total}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  {data.pagelas.thisWeek.presenceRate.toFixed(1)}% presença
                </Typography>
              </Box>
              <Box sx={{ flex: { xs: '1 1 calc(50% - 8px)', sm: 'none' }, minWidth: 0 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.875rem' } }}>
                  Este Mês
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="primary" sx={{ fontSize: { xs: '1.25rem', sm: '2.125rem' }, wordBreak: 'break-word' }}>
                  {data.pagelas.thisMonth.total}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
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

          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Decisões por Cristo
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 2, sm: 3 }, mb: 2, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
              <Box sx={{ flex: { xs: '1 1 calc(50% - 8px)', sm: 'none' }, minWidth: 0 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  Esta Semana
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="success.main" sx={{ fontSize: { xs: '1.25rem', sm: '2.125rem' } }}>
                  {data.acceptedChrists.thisWeek}
                </Typography>
              </Box>
              <Box sx={{ flex: { xs: '1 1 calc(50% - 8px)', sm: 'none' }, minWidth: 0 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  Este Mês
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="success.main" sx={{ fontSize: { xs: '1.25rem', sm: '2.125rem' } }}>
                  {data.acceptedChrists.thisMonth}
                </Typography>
              </Box>
              <Box sx={{ flex: { xs: '1 1 auto', sm: 'none' }, minWidth: 0 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  Este Ano
                </Typography>
                <Typography variant="h4" fontWeight="bold" color="success.main" sx={{ fontSize: { xs: '1.25rem', sm: '2.125rem' } }}>
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

          <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(76, 175, 80, 0.08)', borderRadius: 2 }}>
            <Typography variant="caption" color="text.secondary" gutterBottom display="block">
              Distribuição de Decisões (Ano Todo)
            </Typography>
            <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ width: '100%', maxWidth: '100%', margin: 0 }}>
              <Grid item xs={6} sx={{ width: '100%', maxWidth: '100%' }}>
                <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>Aceitaram</Typography>
                <Typography variant="h6" fontWeight="bold" color="success.main" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' }, wordBreak: 'break-word' }}>
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
              <Grid item xs={6} sx={{ width: '100%', maxWidth: '100%' }}>
                <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>Reconciliados</Typography>
                <Typography variant="h6" fontWeight="bold" color="info.main" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' }, wordBreak: 'break-word' }}>
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

      <Grid item xs={12} md={6} sx={{ width: '100%', maxWidth: '100%' }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 1.5, sm: 3 },
            borderRadius: 3,
            background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.success.main}05 100%)`,
            border: `2px solid ${theme.palette.divider}`,
            width: '98%',
            maxWidth: '98%',
            overflow: 'hidden',
          }}
        >
          <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
            📊 Últimas 6 Semanas - Pagelas
          </Typography>
          <Box sx={{ width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
            <ResponsiveContainer width="100%" height={isMobile ? 220 : 250}>
              <AreaChart data={lastSixWeeksData} margin={isMobile ? { top: 5, right: 0, left: -20, bottom: 0 } : { top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.6} />
                    <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                <XAxis dataKey="date" stroke={theme.palette.text.secondary} style={{ fontSize: isMobile ? 9 : 11 }} angle={isMobile ? -45 : 0} textAnchor={isMobile ? 'end' : 'middle'} height={isMobile ? 50 : 30} tickMargin={isMobile ? 5 : 10} />
                <YAxis stroke={theme.palette.text.secondary} style={{ fontSize: isMobile ? 9 : 11 }} width={isMobile ? 25 : 40} />
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
          </Box>
        </Paper>
      </Grid>

      <Grid item xs={12} sx={{ width: '100%', maxWidth: '100%' }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 1.5, sm: 3 },
            borderRadius: 3,
            background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.success.main}05 100%)`,
            border: `2px solid ${theme.palette.divider}`,
            width: '98%',
            maxWidth: '98%',
            overflow: 'hidden',
          }}
        >
          <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
            ✝️ Últimos 6 Meses - Decisões por Cristo
          </Typography>
          <Box sx={{ width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
            <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
              <AreaChart data={lastSixMonthsData} margin={isMobile ? { top: 5, right: 0, left: -20, bottom: 0 } : { top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDecisions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={theme.palette.success.main} stopOpacity={0.6} />
                    <stop offset="95%" stopColor={theme.palette.success.main} stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                <XAxis dataKey="date" stroke={theme.palette.text.secondary} style={{ fontSize: isMobile ? 9 : 11 }} angle={isMobile ? -45 : 0} textAnchor={isMobile ? 'end' : 'middle'} height={isMobile ? 50 : 30} tickMargin={isMobile ? 5 : 10} />
                <YAxis stroke={theme.palette.text.secondary} style={{ fontSize: isMobile ? 9 : 11 }} width={isMobile ? 25 : 40} />
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
          </Box>

          <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ mt: 2, width: '100%', maxWidth: '100%', margin: 0 }}>
            <Grid item xs={6} sm={3} sx={{ width: '100%', maxWidth: '100%' }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                Média Mensal
              </Typography>
              <Typography variant="h6" fontWeight="bold" color="success.main" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' }, wordBreak: 'break-word' }}>
                {(() => {
                  if (!lastSixMonthsData || lastSixMonthsData.length === 0) return '0';
                  const avg = lastSixMonthsData.reduce((sum, m) => sum + (m.value || 0), 0) / 6;
                  return isNaN(avg) ? '0' : avg.toFixed(0);
                })()}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={3} sx={{ width: '100%', maxWidth: '100%' }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                Melhor Mês
              </Typography>
              <Typography variant="h6" fontWeight="bold" color="success.main" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' }, wordBreak: 'break-word' }}>
                {(() => {
                  if (!lastSixMonthsData || lastSixMonthsData.length === 0) return '0';
                  const max = Math.max(...lastSixMonthsData.map((m) => m.value || 0));
                  return isNaN(max) || max === -Infinity ? '0' : max.toString();
                })()}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={3} sx={{ width: '100%', maxWidth: '100%' }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                Total (6 meses)
              </Typography>
              <Typography variant="h6" fontWeight="bold" color="success.main" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' }, wordBreak: 'break-word' }}>
                {(() => {
                  if (!lastSixMonthsData) return '0';
                  const total = lastSixMonthsData.reduce((sum, m) => sum + (m.value || 0), 0);
                  return isNaN(total) ? '0' : total.toString();
                })()}
              </Typography>
            </Grid>
            <Grid item xs={6} sm={3} sx={{ width: '100%', maxWidth: '100%' }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                Projeção Anual
              </Typography>
              <Typography variant="h6" fontWeight="bold" color="success.main" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' }, wordBreak: 'break-word' }}>
                {(() => {
                  if (!lastSixMonthsData || lastSixMonthsData.length === 0) return '0';
                  const total = lastSixMonthsData.reduce((sum, m) => sum + (m.value || 0), 0);
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

