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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  ComposedChart,
  Line,
} from 'recharts';
import { EmojiEvents, TrendingUp, Group } from '@mui/icons-material';
import { useAcceptedChristsChartData } from '../hooks';
import { StatisticsFilters } from '../api';

interface EnhancedDecisionsChartProps {
  filters?: StatisticsFilters;
}

export const EnhancedDecisionsChart: React.FC<EnhancedDecisionsChartProps> = ({ filters }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
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

  const chartData =
    data.timeSeries && Array.isArray(data.timeSeries)
      ? data.timeSeries.map((item) => ({
          date: item.date,
          total: item.series?.total || 0,
          accepted: item.series?.ACCEPTED || 0,
          reconciled: item.series?.RECONCILED || 0,
        }))
      : [];

  // Calcular totais dos dados agregados se timeSeries estiver vazio
  const totalAccepted =
    chartData.length > 0
      ? chartData.reduce((sum, item) => sum + (item.accepted || 0), 0)
      : data.byGender?.reduce((sum, item) => sum + (item.accepted || 0), 0) || 0;
  const totalReconciled =
    chartData.length > 0
      ? chartData.reduce((sum, item) => sum + (item.reconciled || 0), 0)
      : data.byGender?.reduce((sum, item) => sum + (item.reconciled || 0), 0) || 0;
  const totalDecisions = totalAccepted + totalReconciled;

  const pieData = [
    { name: 'Aceitaram Cristo', value: totalAccepted, color: theme.palette.success.main },
    { name: 'Reconciliados', value: totalReconciled, color: theme.palette.info.main },
  ];

  // Dados por gênero
  const genderData =
    data.byGender?.map((item) => ({
      name: item.gender === 'M' ? 'Masculino' : 'Feminino',
      total: item.total,
      accepted: item.accepted,
      reconciled: item.reconciled,
    })) || [];

  // Dados por faixa etária
  const ageGroupData =
    data.byAgeGroup?.map((item) => ({
      name: item.ageGroup,
      total: item.total,
      accepted: item.accepted,
      reconciled: item.reconciled,
    })) || [];

  // Top 10 clubinhos
  const topClubsData =
    data.byClub
      ?.sort((a, b) => b.total - a.total)
      .slice(0, 10)
      .map((item) => ({
        name: `#${item.clubNumber}`,
        total: item.total,
        accepted: item.accepted,
        reconciled: item.reconciled,
      })) || [];

  // Dados por tempo de participação
  const participationData =
    data.byParticipationTime?.map((item) => ({
      name: item.timeRange,
      total: item.total,
      accepted: item.accepted,
      reconciled: item.reconciled,
      avgMonths: item.avgMonthsParticipating,
    })) || [];

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
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  bgcolor: entry.fill || entry.stroke,
                }}
              />
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
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Box sx={{ width: '98%', maxWidth: '98%', overflowX: 'hidden', mx: 'auto' }}>
      {/* Cards de Resumo */}
      <Grid
        container
        spacing={{ xs: 1.5, sm: 2, md: 3 }}
        sx={{ mb: 3, width: '100%', maxWidth: '100%' }}
      >
        <Grid item xs={12} sm={6} md={4} sx={{ width: '100%', maxWidth: '100%' }}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, sm: 3 },
              borderRadius: 3,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.primary.main}05 100%)`,
              border: `2px solid ${theme.palette.primary.main}30`,
              width: '100%',
              maxWidth: '100%',
              overflow: 'hidden',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 } }}>
              <Box
                sx={{
                  p: { xs: 1, sm: 1.5 },
                  borderRadius: 2,
                  bgcolor: `${theme.palette.primary.main}20`,
                }}
              >
                <EmojiEvents
                  sx={{ fontSize: { xs: 24, sm: 32 }, color: theme.palette.primary.main }}
                />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  fontWeight={600}
                  sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                >
                  Total de Decisões
                </Typography>
                <Typography
                  variant="h4"
                  fontWeight="bold"
                  color="primary"
                  sx={{ fontSize: { xs: '1.5rem', sm: '2rem' }, wordBreak: 'break-word' }}
                >
                  {totalDecisions.toLocaleString()}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={4} sx={{ width: '100%', maxWidth: '100%' }}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, sm: 3 },
              borderRadius: 3,
              background: `linear-gradient(135deg, ${theme.palette.success.main}15 0%, ${theme.palette.success.main}05 100%)`,
              border: `2px solid ${theme.palette.success.main}30`,
              width: '100%',
              maxWidth: '100%',
              overflow: 'hidden',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 } }}>
              <Box
                sx={{
                  p: { xs: 1, sm: 1.5 },
                  borderRadius: 2,
                  bgcolor: `${theme.palette.success.main}20`,
                }}
              >
                <TrendingUp
                  sx={{ fontSize: { xs: 24, sm: 32 }, color: theme.palette.success.main }}
                />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  fontWeight={600}
                  sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                >
                  Aceitaram Cristo
                </Typography>
                <Typography
                  variant="h4"
                  fontWeight="bold"
                  color="success.main"
                  sx={{ fontSize: { xs: '1.5rem', sm: '2rem' }, wordBreak: 'break-word' }}
                >
                  {totalAccepted.toLocaleString()}
                </Typography>
                {totalDecisions > 0 && (
                  <Chip
                    label={`${((totalAccepted / totalDecisions) * 100).toFixed(0)}%`}
                    size="small"
                    color="success"
                    sx={{ mt: 0.5, fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                  />
                )}
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={4} sx={{ width: '100%', maxWidth: '100%' }}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, sm: 3 },
              borderRadius: 3,
              background: `linear-gradient(135deg, ${theme.palette.info.main}15 0%, ${theme.palette.info.main}05 100%)`,
              border: `2px solid ${theme.palette.info.main}30`,
              width: '100%',
              maxWidth: '100%',
              overflow: 'hidden',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 } }}>
              <Box
                sx={{
                  p: { xs: 1, sm: 1.5 },
                  borderRadius: 2,
                  bgcolor: `${theme.palette.info.main}20`,
                }}
              >
                <Group sx={{ fontSize: { xs: 24, sm: 32 }, color: theme.palette.info.main }} />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  fontWeight={600}
                  sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                >
                  Reconciliados
                </Typography>
                <Typography
                  variant="h4"
                  fontWeight="bold"
                  color="info.main"
                  sx={{ fontSize: { xs: '1.5rem', sm: '2rem' }, wordBreak: 'break-word' }}
                >
                  {totalReconciled.toLocaleString()}
                </Typography>
                {totalDecisions > 0 && (
                  <Chip
                    label={`${((totalReconciled / totalDecisions) * 100).toFixed(0)}%`}
                    size="small"
                    color="info"
                    sx={{ mt: 0.5, fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                  />
                )}
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Gráficos */}
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ width: '100%', maxWidth: '100%' }}>
        {/* Gráfico Temporal - Se houver dados temporais */}
        {chartData && chartData.length > 0 && (
          <Grid item xs={12}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2, sm: 3 },
                borderRadius: 3,
                background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.primary.main}03 100%)`,
                border: `2px solid ${theme.palette.divider}`,
                width: '100%',
                maxWidth: '100%',
                overflow: 'hidden',
              }}
            >
              <Typography
                variant="h6"
                fontWeight="bold"
                gutterBottom
                sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
              >
                ✝️ Evolução de Decisões ao Longo do Tempo
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 3, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
              >
                Acompanhamento temporal das decisões por Cristo
              </Typography>

              <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
                <ComposedChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: isMobile ? 80 : 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                  <XAxis
                    dataKey="date"
                    stroke={theme.palette.text.secondary}
                    style={{ fontSize: isMobile ? 10 : 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={isMobile ? 80 : 60}
                  />
                  <YAxis
                    yAxisId="left"
                    stroke={theme.palette.text.secondary}
                    style={{ fontSize: isMobile ? 10 : 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }} />
                  <Bar
                    yAxisId="left"
                    dataKey="accepted"
                    name="Aceitaram Cristo"
                    fill={theme.palette.success.main}
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    yAxisId="left"
                    dataKey="reconciled"
                    name="Reconciliados"
                    fill={theme.palette.info.main}
                    radius={[4, 4, 0, 0]}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="total"
                    name="Total"
                    stroke={theme.palette.primary.main}
                    strokeWidth={isMobile ? 2 : 2}
                    dot={{ r: isMobile ? 3 : 4 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        )}

        {/* Gráfico por Gênero */}
        {genderData.length > 0 && (
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2, sm: 3 },
                borderRadius: 3,
                border: `2px solid ${theme.palette.divider}`,
                width: '100%',
                maxWidth: '100%',
                overflow: 'hidden',
              }}
            >
              <Typography
                variant="h6"
                fontWeight="bold"
                gutterBottom
                sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
              >
                👥 Decisões por Gênero
              </Typography>
              <ResponsiveContainer width="100%" height={isMobile ? 200 : 250}>
                <BarChart data={genderData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                  <XAxis
                    dataKey="name"
                    stroke={theme.palette.text.secondary}
                    style={{ fontSize: isMobile ? 10 : 12 }}
                  />
                  <YAxis
                    stroke={theme.palette.text.secondary}
                    style={{ fontSize: isMobile ? 10 : 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }} />
                  <Bar
                    dataKey="accepted"
                    name="Aceitaram"
                    fill={theme.palette.success.main}
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="reconciled"
                    name="Reconciliados"
                    fill={theme.palette.info.main}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        )}

        {/* Gráfico por Faixa Etária */}
        {ageGroupData.length > 0 && (
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2, sm: 3 },
                borderRadius: 3,
                border: `2px solid ${theme.palette.divider}`,
                width: '100%',
                maxWidth: '100%',
                overflow: 'hidden',
              }}
            >
              <Typography
                variant="h6"
                fontWeight="bold"
                gutterBottom
                sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
              >
                🎂 Decisões por Faixa Etária
              </Typography>
              <ResponsiveContainer width="100%" height={isMobile ? 200 : 250}>
                <BarChart data={ageGroupData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                  <XAxis
                    dataKey="name"
                    stroke={theme.palette.text.secondary}
                    style={{ fontSize: isMobile ? 10 : 12 }}
                  />
                  <YAxis
                    stroke={theme.palette.text.secondary}
                    style={{ fontSize: isMobile ? 10 : 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }} />
                  <Bar
                    dataKey="accepted"
                    name="Aceitaram"
                    fill={theme.palette.success.main}
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="reconciled"
                    name="Reconciliados"
                    fill={theme.palette.info.main}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        )}

        {/* Top 10 Clubinhos */}
        {topClubsData.length > 0 && (
          <Grid item xs={12}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2, sm: 3 },
                borderRadius: 3,
                border: `2px solid ${theme.palette.divider}`,
                width: '100%',
                maxWidth: '100%',
                overflow: 'hidden',
              }}
            >
              <Typography
                variant="h6"
                fontWeight="bold"
                gutterBottom
                sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
              >
                🏆 Top 10 Clubinhos com Mais Decisões
              </Typography>
              <ResponsiveContainer width="100%" height={isMobile ? 400 : 300}>
                <BarChart
                  data={topClubsData}
                  layout="vertical"
                  margin={{ top: 20, right: 30, left: isMobile ? 40 : 60, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                  <XAxis
                    type="number"
                    stroke={theme.palette.text.secondary}
                    style={{ fontSize: isMobile ? 10 : 12 }}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    stroke={theme.palette.text.secondary}
                    style={{ fontSize: isMobile ? 10 : 12 }}
                    width={isMobile ? 40 : 50}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }} />
                  <Bar
                    dataKey="accepted"
                    name="Aceitaram"
                    fill={theme.palette.success.main}
                    radius={[0, 4, 4, 0]}
                  />
                  <Bar
                    dataKey="reconciled"
                    name="Reconciliados"
                    fill={theme.palette.info.main}
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        )}

        {/* Gráfico por Tempo de Participação */}
        {participationData.length > 0 && (
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2, sm: 3 },
                borderRadius: 3,
                border: `2px solid ${theme.palette.divider}`,
                width: '100%',
                maxWidth: '100%',
                overflow: 'hidden',
              }}
            >
              <Typography
                variant="h6"
                fontWeight="bold"
                gutterBottom
                sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
              >
                ⏱️ Decisões por Tempo de Participação
              </Typography>
              <ResponsiveContainer width="100%" height={isMobile ? 200 : 250}>
                <BarChart
                  data={participationData}
                  margin={{ top: 20, right: 30, left: 20, bottom: isMobile ? 60 : 40 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                  <XAxis
                    dataKey="name"
                    stroke={theme.palette.text.secondary}
                    style={{ fontSize: isMobile ? 9 : 12 }}
                    angle={isMobile ? -45 : -15}
                    textAnchor="end"
                    height={isMobile ? 80 : 60}
                  />
                  <YAxis
                    stroke={theme.palette.text.secondary}
                    style={{ fontSize: isMobile ? 10 : 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }} />
                  <Bar
                    dataKey="accepted"
                    name="Aceitaram"
                    fill={theme.palette.success.main}
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="reconciled"
                    name="Reconciliados"
                    fill={theme.palette.info.main}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        )}

        {/* Gráfico de Pizza */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: `2px solid ${theme.palette.divider}`,
            }}
          >
            <Typography
              variant="h6"
              fontWeight="bold"
              gutterBottom
              sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
            >
              📊 Distribuição Geral
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 2, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
            >
              Proporção de cada tipo de decisão
            </Typography>

            <ResponsiveContainer width="100%" height={isMobile ? 200 : 250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={isMobile ? 60 : 80}
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
                      <Box
                        sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: item.color }}
                      />
                      <Typography variant="body2">{item.name}</Typography>
                    </Box>
                    <Typography variant="body2" fontWeight="bold">
                      {item.value.toLocaleString()}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={totalDecisions > 0 ? (item.value / totalDecisions) * 100 : 0}
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
