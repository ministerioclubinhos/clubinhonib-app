import React, { memo, Suspense } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Skeleton,
  useTheme,
  alpha,
  Chip,
  Button,
  useMediaQuery,
  Divider,
} from '@mui/material';
import {
  TrendingUp,
  People,
  Groups,
  School,
  Favorite,
  CalendarMonth,
  ArrowForward,
  AutoAwesome,
  EmojiEvents,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
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
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useStatistics } from '../context';
import { useOverview, usePagelasChartData, useInsights } from '../hooks';
import { StatCard, ChartWrapper } from '../components/ui';

const MotionBox = motion.create(Box);

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }: any) => {
  const theme = useTheme();

  if (active && payload && payload.length) {
    return (
      <Paper
        elevation={8}
        sx={{
          p: 2,
          borderRadius: 2,
          bgcolor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography variant="subtitle2" fontWeight={700} gutterBottom>
          {label}
        </Typography>
        {payload.map((entry: any, index: number) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: entry.color }} />
            <Typography variant="body2">
              {entry.name}: <strong>{entry.value?.toLocaleString('pt-BR')}</strong>
            </Typography>
          </Box>
        ))}
      </Paper>
    );
  }
  return null;
};

// Top Engaged Children Mini List
const TopChildrenList: React.FC = memo(() => {
  const theme = useTheme();
  const { state } = useStatistics();
  const { data: insights, isLoading } = useInsights(state.filters);

  if (isLoading) {
    return (
      <Box>
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} height={60} sx={{ mb: 1, borderRadius: 2 }} />
        ))}
      </Box>
    );
  }

  const topChildren = insights?.topEngagedChildren?.slice(0, 5) || [];

  if (topChildren.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography color="text.secondary">Nenhum dado disponivel</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {topChildren.map((child, index) => (
        <motion.div
          key={child.childId}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              p: 1.5,
              mb: 1,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.02 + index * 0.01),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              transition: 'all 0.2s',
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.05),
                transform: 'translateX(4px)',
              },
            }}
          >
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                bgcolor:
                  index === 0
                    ? '#ffd700'
                    : index === 1
                      ? '#c0c0c0'
                      : index === 2
                        ? '#cd7f32'
                        : theme.palette.grey[300],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 14,
                color: index < 3 ? 'black' : 'white',
              }}
            >
              {index + 1}
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" fontWeight={600} noWrap>
                {child.childName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {child.age} anos • Clubinho #{child.clubNumber || '-'}
              </Typography>
            </Box>
            <Chip
              label={`${child.engagementScore.toFixed(0)}%`}
              size="small"
              color={child.engagementScore >= 90 ? 'success' : child.engagementScore >= 75 ? 'primary' : 'default'}
              sx={{ fontWeight: 700 }}
            />
          </Box>
        </motion.div>
      ))}
      <Button
        variant="text"
        fullWidth
        endIcon={<ArrowForward />}
        sx={{ mt: 1, textTransform: 'none' }}
      >
        Ver todos os rankings
      </Button>
    </Box>
  );
});

TopChildrenList.displayName = 'TopChildrenList';

export const OverviewTab: React.FC = memo(() => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { state } = useStatistics();
  const { data: overview, isLoading: overviewLoading } = useOverview();
  const { data: chartData, isLoading: chartLoading } = usePagelasChartData(state.filters);

  // Prepare chart data
  const timeSeriesData = React.useMemo(() => {
    if (!chartData?.timeSeries?.total) return [];
    return chartData.timeSeries.total.map((item, index) => ({
      date: item.date,
      total: item.value,
      presenca: chartData.timeSeries?.presence?.[index]?.value || 0,
      meditacao: chartData.timeSeries?.meditation?.[index]?.value || 0,
      versiculo: chartData.timeSeries?.verseRecitation?.[index]?.value || 0,
    }));
  }, [chartData]);

  // Gender distribution
  const genderData = React.useMemo(() => {
    if (!chartData?.byGender) return [];
    return chartData.byGender.map((g) => ({
      name: g.gender === 'M' ? 'Masculino' : 'Feminino',
      value: g.total,
      color: g.gender === 'M' ? theme.palette.info.main : theme.palette.secondary.main,
    }));
  }, [chartData, theme]);

  return (
    <Box sx={{ width: '100%' }}>
      {/* Quick Stats Row */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={6} md={3}>
          <StatCard
            title="Total Criancas"
            value={overview?.summary.totalChildren || 0}
            icon={<People />}
            color={theme.palette.primary.main}
            loading={overviewLoading}
            subtitle={`${overview?.summary.activeChildrenThisMonth || 0} ativos`}
          />
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <StatCard
            title="Clubinhos"
            value={overview?.summary.totalClubs || 0}
            icon={<Groups />}
            color={theme.palette.secondary.main}
            loading={overviewLoading}
          />
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <StatCard
            title="Professores"
            value={overview?.summary.totalTeachers || 0}
            icon={<School />}
            color={theme.palette.success.main}
            loading={overviewLoading}
          />
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <StatCard
            title="Decisoes Ano"
            value={overview?.acceptedChrists.thisYear || 0}
            icon={<Favorite />}
            color="#f43f5e"
            variant="gradient"
            loading={overviewLoading}
          />
        </Grid>
      </Grid>

      {/* Weekly Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, md: 3 },
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.03)} 0%, ${theme.palette.background.paper} 100%)`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <CalendarMonth color="success" />
              <Typography variant="h6" fontWeight={700}>
                Esta Semana
              </Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Pagelas
                </Typography>
                <Typography variant="h4" fontWeight={700} color="success.main">
                  {overview?.pagelas.thisWeek.total.toLocaleString('pt-BR') || 0}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Taxa Presenca
                </Typography>
                <Typography variant="h4" fontWeight={700} color="primary">
                  {overview?.pagelas.thisWeek.presenceRate.toFixed(1) || 0}%
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, md: 3 },
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.03)} 0%, ${theme.palette.background.paper} 100%)`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <CalendarMonth color="primary" />
              <Typography variant="h6" fontWeight={700}>
                Este Mes
              </Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Pagelas
                </Typography>
                <Typography variant="h4" fontWeight={700} color="primary">
                  {overview?.pagelas.thisMonth.total.toLocaleString('pt-BR') || 0}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Taxa Presenca
                </Typography>
                <Typography variant="h4" fontWeight={700} color="success.main">
                  {overview?.pagelas.thisMonth.presenceRate.toFixed(1) || 0}%
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3}>
        {/* Main Time Series Chart */}
        <Grid item xs={12} lg={8}>
          <ChartWrapper
            title={isMobile ? 'Pagelas' : 'Evolucao de Pagelas'}
            subtitle={isMobile ? '' : 'Analise temporal das atividades'}
            icon={<TrendingUp />}
            color={theme.palette.primary.main}
            loading={chartLoading}
            isEmpty={timeSeriesData.length === 0}
            height={isMobile ? 320 : 450}
          >
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={timeSeriesData}
                margin={isMobile ? { top: 10, right: 10, left: 0, bottom: 30 } : { top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                <XAxis
                  dataKey="date"
                  stroke={theme.palette.text.secondary}
                  angle={isMobile ? -45 : -45}
                  textAnchor="end"
                  height={isMobile ? 60 : 60}
                  tickFormatter={(value) => {
                    // Check if it's a week format (e.g., "2025-W47")
                    if (typeof value === 'string' && value.includes('-W')) {
                      const [year, week] = value.split('-W');
                      return `S${week}/${year.slice(2)}`; // e.g., "S47/25"
                    }
                    // Otherwise, parse as regular date
                    const date = new Date(value);
                    if (isNaN(date.getTime())) return value; // Fallback if invalid
                    const day = date.getDate().toString().padStart(2, '0');
                    const month = (date.getMonth() + 1).toString().padStart(2, '0');
                    return `${day}/${month}`;
                  }}
                  style={{ fontSize: isMobile ? 10 : 11 }}
                  interval={isMobile ? 'preserveStartEnd' : timeSeriesData.length > 20 ? Math.floor(timeSeriesData.length / 15) : 'preserveStartEnd'}
                />
                <YAxis stroke={theme.palette.text.secondary} style={{ fontSize: isMobile ? 9 : 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={isMobile ? { fontSize: '10px', bottom: -5 } : undefined}
                  iconSize={isMobile ? 8 : 14}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  name="Total"
                  fill="url(#colorTotal)"
                  stroke={theme.palette.primary.main}
                  strokeWidth={2}
                />
                <Bar dataKey="presenca" name="Presenca" fill={theme.palette.success.main} />
                <Line
                  type="monotone"
                  dataKey="meditacao"
                  name="Meditacao"
                  stroke={theme.palette.info.main}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="versiculo"
                  name="Versiculo"
                  stroke={theme.palette.secondary.main}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartWrapper>
        </Grid>

        {/* Side Panel - Top Children */}
        <Grid item xs={12} lg={4}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, md: 3 },
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              height: '100%',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <EmojiEvents color="warning" />
              <Typography variant="h6" fontWeight={700}>
                Top Engajados
              </Typography>
            </Box>
            <TopChildrenList />
          </Paper>
        </Grid>
      </Grid>

      {/* Gender Distribution & Decisions */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        {/* Gender Pie Chart */}
        <Grid item xs={12} md={4}>
          <ChartWrapper
            title={isMobile ? 'Genero' : 'Distribuicao por Genero'}
            icon={<People />}
            color={theme.palette.info.main}
            loading={chartLoading}
            isEmpty={genderData.length === 0}
            height={300}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genderData}
                  cx="50%"
                  cy="50%"
                  innerRadius={isMobile ? 40 : 60}
                  outerRadius={isMobile ? 70 : 90}
                  paddingAngle={5}
                  dataKey="value"
                  label={(props) => `${props.name}: ${(Number(props.percent || 0) * 100).toFixed(0)}%`}
                >
                  {genderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </ChartWrapper>
        </Grid>

        {/* Decisions Summary */}
        <Grid item xs={12} md={8}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, md: 3 },
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              height: '100%',
              background: `linear-gradient(135deg, ${alpha('#f43f5e', 0.03)} 0%, ${theme.palette.background.paper} 100%)`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: isMobile ? 2 : 3 }}>
              <Favorite sx={{ color: '#f43f5e' }} />
              <Typography variant="h6" fontWeight={700}>
                {isMobile ? 'Decisoes' : 'Decisoes por Cristo'}
              </Typography>
            </Box>

            <Grid container spacing={isMobile ? 1 : 3}>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    Esta Semana
                  </Typography>
                  <Typography variant={isMobile ? "h4" : "h3"} fontWeight={800} sx={{ color: '#f43f5e' }}>
                    {overview?.acceptedChrists.thisWeek || 0}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    Este Mes
                  </Typography>
                  <Typography variant={isMobile ? "h4" : "h3"} fontWeight={800} sx={{ color: '#f43f5e' }}>
                    {overview?.acceptedChrists.thisMonth || 0}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    Este Ano
                  </Typography>
                  <Typography variant={isMobile ? "h4" : "h3"} fontWeight={800} sx={{ color: '#f43f5e' }}>
                    {overview?.acceptedChrists.thisYear || 0}
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: alpha('#10b981', 0.1),
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    Aceitos
                  </Typography>
                  <Typography variant="h4" fontWeight={700} sx={{ color: '#10b981' }}>
                    {overview?.acceptedChrists.byDecisionType?.ACCEPTED || 0}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: alpha('#6366f1', 0.1),
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    Reconciliados
                  </Typography>
                  <Typography variant="h4" fontWeight={700} sx={{ color: '#6366f1' }}>
                    {overview?.acceptedChrists.byDecisionType?.RECONCILED || 0}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
});

OverviewTab.displayName = 'OverviewTab';

export default OverviewTab;
