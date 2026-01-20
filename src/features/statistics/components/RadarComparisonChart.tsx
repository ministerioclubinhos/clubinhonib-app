import React from 'react';
import { Box, Paper, Typography, CircularProgress, useTheme, Grid } from '@mui/material';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer, Tooltip } from 'recharts';
import { usePagelasChartData } from '../hooks';
import { PagelasStatsQueryDto } from '../api';

interface RadarComparisonChartProps {
  filters?: PagelasStatsQueryDto;
}

export const RadarComparisonChart: React.FC<RadarComparisonChartProps> = ({ filters }) => {
  const theme = useTheme();
  const { data, isLoading } = usePagelasChartData(filters);

  if (isLoading) {
    return (
      <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      </Paper>
    );
  }

  if (!data || !data.byGender || !data.byAgeGroup) {
    return (
      <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
        <Typography color="error">Erro ao carregar dados</Typography>
      </Paper>
    );
  }

  const genderData = [
    {
      metric: 'Presença',
      Masculino: data.byGender.find((g) => g.gender === 'M')?.presenceRate || 0,
      Feminino: data.byGender.find((g) => g.gender === 'F')?.presenceRate || 0,
    },
    {
      metric: 'Meditação',
      Masculino: data.byGender.find((g) => g.gender === 'M')?.meditationRate || 0,
      Feminino: data.byGender.find((g) => g.gender === 'F')?.meditationRate || 0,
    },
    {
      metric: 'Recitação',
      Masculino: data.byGender.find((g) => g.gender === 'M')?.verseRecitationRate || 0,
      Feminino: data.byGender.find((g) => g.gender === 'F')?.verseRecitationRate || 0,
    },
  ];

  const topAgeGroups = data.byAgeGroup.slice(0, 3);
  const ageGroupData = [
    {
      metric: 'Presença',
      ...Object.fromEntries(topAgeGroups.map((g) => [g.ageGroup, g.presenceRate])),
    },
    {
      metric: 'Meditação',
      ...Object.fromEntries(topAgeGroups.map((g) => [g.ageGroup, g.meditationRate])),
    },
    {
      metric: 'Recitação',
      ...Object.fromEntries(topAgeGroups.map((g) => [g.ageGroup, g.verseRecitationRate])),
    },
  ];

  const CustomTooltip = ({ active, payload }: any) => {
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
            {payload[0].payload.metric}
          </Typography>
          {payload.map((entry: any, index: number) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: entry.stroke }} />
              <Typography variant="body2">
                {entry.name}: <strong>{entry.value.toFixed(1)}%</strong>
              </Typography>
            </Box>
          ))}
        </Paper>
      );
    }
    return null;
  };

  return (
    <Grid container spacing={3}>

      <Grid item xs={12} md={6}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 3,
            height: '100%',
            background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.info.main}03 100%)`,
            border: `2px solid ${theme.palette.divider}`,
          }}
        >
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            👥 Comparação por Gênero
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
            Performance relativa entre meninos e meninas
          </Typography>

          <ResponsiveContainer width="100%" height={350}>
            <RadarChart data={genderData}>
              <PolarGrid stroke={theme.palette.divider} />
              <PolarAngleAxis
                dataKey="metric"
                tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
              />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Radar
                name="Masculino"
                dataKey="Masculino"
                stroke={theme.palette.info.main}
                fill={theme.palette.info.main}
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <Radar
                name="Feminino"
                dataKey="Feminino"
                stroke={theme.palette.secondary.main}
                fill={theme.palette.secondary.main}
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>

          <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'center' }}>
            {data.byGender.map((g) => (
              <Box key={g.gender} sx={{ textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  {g.gender === 'M' ? 'Masculino' : 'Feminino'}
                </Typography>
                <Typography variant="h6" fontWeight="bold" color={g.gender === 'M' ? 'info.main' : 'secondary.main'}>
                  {g.total}
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
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
            🎂 Comparação por Faixa Etária
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
            Performance por grupos de idade
          </Typography>

          <ResponsiveContainer width="100%" height={350}>
            <RadarChart data={ageGroupData}>
              <PolarGrid stroke={theme.palette.divider} />
              <PolarAngleAxis
                dataKey="metric"
                tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
              />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 11 }} />
              {topAgeGroups.map((group, index) => {
                const colors = [
                  theme.palette.primary.main,
                  theme.palette.success.main,
                  theme.palette.warning.main,
                ];
                return (
                  <Radar
                    key={group.ageGroup}
                    name={group.ageGroup}
                    dataKey={group.ageGroup}
                    stroke={colors[index]}
                    fill={colors[index]}
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                );
              })}
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>

          <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            {topAgeGroups.map((g, index) => {
              const colors = [
                theme.palette.primary.main,
                theme.palette.success.main,
                theme.palette.warning.main,
              ];
              return (
                <Box key={g.ageGroup} sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    {g.ageGroup} anos
                  </Typography>
                  <Typography variant="h6" fontWeight="bold" sx={{ color: colors[index] }}>
                    {g.total}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};

