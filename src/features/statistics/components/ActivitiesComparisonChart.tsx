import { toChartNumber } from '../types/chart.types';
import type { ChartTooltipProps } from '../types/chart.types';
import React from 'react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  useTheme,
  Grid2,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { CompareArrows } from '@mui/icons-material';
import { usePagelasChartData } from '../hooks';
import type { PagelasStatsQueryDto } from '../types';

/** Barra de atividade exibida no tooltip. */
interface ActivitiesTooltipPayload {
  category: string;
}

interface ActivitiesComparisonChartProps {
  filters?: PagelasStatsQueryDto;
}

type ViewMode = 'radar' | 'bar';

export const ActivitiesComparisonChart: React.FC<ActivitiesComparisonChartProps> = ({ filters }) => {
  const theme = useTheme();
  const { data, isLoading } = usePagelasChartData(filters);
  const [viewMode, setViewMode] = React.useState<ViewMode>('radar');

  if (isLoading) {
    return (
      <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      </Paper>
    );
  }

  if (!data || !data.byGender || !data.byAgeGroup || !data.byParticipationTime) {
    return (
      <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
        <Typography color="error">Erro ao carregar dados</Typography>
      </Paper>
    );
  }

  const comparisonData = {
    byGender: data.byGender.map((g) => ({
      category: g.gender === 'M' ? 'Masculino' : 'Feminino',
      Presença: g.presenceRate,
      Meditação: g.meditationRate,
      Recitação: g.verseRecitationRate,
    })),
    byAgeGroup: data.byAgeGroup.map((a) => ({
      category: a.ageGroup,
      Presença: a.presenceRate,
      Meditação: a.meditationRate,
      Recitação: a.verseRecitationRate,
    })),
    byParticipationTime: data.byParticipationTime.map((p) => ({
      category: p.timeRange,
      Presença: p.presenceRate,
      Meditação: p.meditationRate,
      Recitação: p.verseRecitationRate,
    })),
  };

  const radarData = [
    {
      metric: 'Presença',
      value: data.byGender.reduce((sum, g) => sum + g.presenceRate, 0) / data.byGender.length,
    },
    {
      metric: 'Meditação',
      value: data.byGender.reduce((sum, g) => sum + g.meditationRate, 0) / data.byGender.length,
    },
    {
      metric: 'Recitação',
      value: data.byGender.reduce((sum, g) => sum + g.verseRecitationRate, 0) / data.byGender.length,
    },
  ];

  const CustomTooltip = ({ active, payload }: ChartTooltipProps<ActivitiesTooltipPayload>) => {
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
            {payload[0].payload.category}
          </Typography>
          {payload.map((entry, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: entry.color }} />
              <Typography variant="body2">
                {entry.name}: <strong>{toChartNumber(entry.value).toFixed(1)}%</strong>
              </Typography>
            </Box>
          ))}
        </Paper>
      );
    }
    return null;
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 1.5, sm: 3 },
        borderRadius: 3,
        background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.secondary.main}03 100%)`,
        border: `2px solid ${theme.palette.divider}`,
      }}
    >
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <CompareArrows sx={{ fontSize: 28, color: theme.palette.secondary.main }} />
              <Typography variant="h5" fontWeight="bold">
                📊 Comparação de Atividades
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Análise comparativa: Presença vs Meditação vs Recitação
            </Typography>
          </Box>

          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(e, newMode) => newMode && setViewMode(newMode)}
            size="small"
          >
            <ToggleButton value="radar">Radar</ToggleButton>
            <ToggleButton value="bar">Barras</ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      <Box sx={{ mb: 3, p: { xs: 1.5, sm: 2 }, bgcolor: 'rgba(156, 39, 176, 0.08)', borderRadius: 2 }}>
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
          Taxas Médias Gerais
        </Typography>
        <Grid2 container spacing={2}>
          {radarData.map((item) => (
            <Grid2 size={{ xs: 12, sm: 4 }} key={item.metric}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  {item.metric}
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="secondary">
                  {item.value.toFixed(1)}%
                </Typography>
              </Box>
            </Grid2>
          ))}
        </Grid2>
      </Box>

      {viewMode === 'radar' && (
        <ResponsiveContainer width="100%" height={350}>
          <RadarChart data={radarData}>
            <PolarGrid stroke={theme.palette.divider} />
            <PolarAngleAxis dataKey="metric" tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} />
            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 11 }} />
            <Radar
              name="Taxa Média"
              dataKey="value"
              stroke={theme.palette.secondary.main}
              fill={theme.palette.secondary.main}
              fillOpacity={0.5}
              strokeWidth={3}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      )}

      <Grid2 container spacing={3} sx={{ mt: 2 }}>

        <Grid2 size={{ xs: 12, md: 4 }}>
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            Por Gênero
          </Typography>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={comparisonData.byGender}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
              <XAxis dataKey="category" stroke={theme.palette.text.secondary} style={{ fontSize: 10 }} />
              <YAxis domain={[0, 100]} stroke={theme.palette.text.secondary} style={{ fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="Presença" fill={theme.palette.success.main} />
              <Bar dataKey="Meditação" fill={theme.palette.info.main} />
              <Bar dataKey="Recitação" fill={theme.palette.secondary.main} />
            </BarChart>
          </ResponsiveContainer>
        </Grid2>

        <Grid2 size={{ xs: 12, md: 4 }}>
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            Por Faixa Etária
          </Typography>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={comparisonData.byAgeGroup}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
              <XAxis dataKey="category" stroke={theme.palette.text.secondary} style={{ fontSize: 10 }} />
              <YAxis domain={[0, 100]} stroke={theme.palette.text.secondary} style={{ fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="Presença" fill={theme.palette.success.main} />
              <Bar dataKey="Meditação" fill={theme.palette.info.main} />
              <Bar dataKey="Recitação" fill={theme.palette.secondary.main} />
            </BarChart>
          </ResponsiveContainer>
        </Grid2>

        <Grid2 size={{ xs: 12, md: 4 }}>
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            Por Tempo de Participação
          </Typography>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={comparisonData.byParticipationTime}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
              <XAxis
                dataKey="category"
                stroke={theme.palette.text.secondary}
                style={{ fontSize: 9 }}
                angle={-20}
                textAnchor="end"
                height={60}
              />
              <YAxis domain={[0, 100]} stroke={theme.palette.text.secondary} style={{ fontSize: 10 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="Presença" fill={theme.palette.success.main} />
              <Bar dataKey="Meditação" fill={theme.palette.info.main} />
              <Bar dataKey="Recitação" fill={theme.palette.secondary.main} />
            </BarChart>
          </ResponsiveContainer>
        </Grid2>
      </Grid2>

      <Box sx={{ mt: 3, p: { xs: 1.5, sm: 2 }, bgcolor: 'rgba(76, 175, 80, 0.08)', borderRadius: 2 }}>
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
          💡 Insights
        </Typography>
        <Grid2 container spacing={2}>
          <Grid2 size={{ xs: 12, sm: 4 }}>
            <Typography variant="caption" color="text.secondary">
              Atividade Mais Alta
            </Typography>
            <Typography variant="body1" fontWeight="bold">
              {radarData.reduce((max, item) => (item.value > max.value ? item : max)).metric}
            </Typography>
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 4 }}>
            <Typography variant="caption" color="text.secondary">
              Atividade Mais Baixa
            </Typography>
            <Typography variant="body1" fontWeight="bold">
              {radarData.reduce((min, item) => (item.value < min.value ? item : min)).metric}
            </Typography>
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 4 }}>
            <Typography variant="caption" color="text.secondary">
              Diferença Máxima
            </Typography>
            <Typography variant="body1" fontWeight="bold">
              {(Math.max(...radarData.map((d) => d.value)) - Math.min(...radarData.map((d) => d.value))).toFixed(1)}%
            </Typography>
          </Grid2>
        </Grid2>
      </Box>
    </Paper>
  );
};

