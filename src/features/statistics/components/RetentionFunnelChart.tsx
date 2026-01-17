import React from 'react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  useTheme,
  Grid,
  Chip,
  LinearProgress,
} from '@mui/material';
import { TrendingUp, TrendingDown, Group, Timer } from '@mui/icons-material';
import { usePagelasChartData } from '../hooks';
import { StatisticsFilters } from '../api';

interface RetentionFunnelChartProps {
  filters?: StatisticsFilters;
}

export const RetentionFunnelChart: React.FC<RetentionFunnelChartProps> = ({ filters }) => {
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

  if (!data || !data.byParticipationTime || data.byParticipationTime.length === 0) {
    return (
      <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
        <Typography color="text.secondary">Sem dados de retenção para o período selecionado</Typography>
      </Paper>
    );
  }

  const retentionData = data.byParticipationTime;
  const maxTotal = Math.max(...retentionData.map((d) => d.total));

  const timeRangeConfig = {
    '0-3 meses': { label: 'Novatos', icon: '🌱', color: theme.palette.info.main },
    '3-6 meses': { label: 'Iniciantes', icon: '🌿', color: theme.palette.success.main },
    '6-12 meses': { label: 'Regulares', icon: '🌳', color: theme.palette.primary.main },
    '1+ ano': { label: 'Veteranos', icon: '🏆', color: theme.palette.warning.main },
  };

  const getTrendIcon = (index: number) => {
    if (index === 0) return null;
    const prev = retentionData[index - 1];
    const curr = retentionData[index];
    if (curr.presenceRate > prev.presenceRate) {
      return <TrendingUp sx={{ color: theme.palette.success.main, fontSize: 18 }} />;
    }
    return <TrendingDown sx={{ color: theme.palette.error.main, fontSize: 18 }} />;
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <Timer sx={{ fontSize: 28, color: theme.palette.primary.main }} />
          <Typography variant="h5" fontWeight="bold">
            ⏱️ Funil de Retenção
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Análise de engajamento por tempo de participação
        </Typography>
      </Box>

      <Box sx={{ mb: 3 }}>
        {retentionData.map((stage, index) => {
          const config = timeRangeConfig[stage.timeRange as keyof typeof timeRangeConfig] || {
            label: stage.timeRange,
            icon: '📊',
            color: theme.palette.grey[500],
          };
          const percentage = (stage.total / maxTotal) * 100;

          return (
            <Box key={stage.timeRange} sx={{ mb: 2 }}>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                <Typography variant="h6" sx={{ minWidth: 30 }}>
                  {config.icon}
                </Typography>
                <Typography variant="subtitle1" fontWeight="bold">
                  {config.label}
                </Typography>
                <Chip
                  label={stage.timeRange}
                  size="small"
                  variant="outlined"
                  sx={{ borderColor: config.color, color: config.color }}
                />
                {getTrendIcon(index)}
              </Box>

              <Box
                sx={{
                  position: 'relative',
                  width: `${percentage}%`,
                  maxWidth: '100%',
                  minWidth: '30%',
                  height: 80,
                  background: `linear-gradient(90deg, ${config.color} 0%, ${config.color}CC 100%)`,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  px: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateX(4px)',
                    boxShadow: `0 4px 12px ${config.color}40`,
                  },
                }}
              >
                <Grid container spacing={1} sx={{ color: 'white' }}>
                  <Grid item xs={6}>
                    <Box>
                      <Typography variant="caption" sx={{ opacity: 0.9 }}>
                        Total
                      </Typography>
                      <Typography variant="h5" fontWeight="bold">
                        {stage.total}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.8 }}>
                        ({stage.uniqueChildren} crianças únicas)
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box>
                      <Typography variant="caption" sx={{ opacity: 0.9 }}>
                        Taxa de Presença
                      </Typography>
                      <Typography variant="h5" fontWeight="bold">
                        {stage.presenceRate.toFixed(1)}%
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.8 }}>
                        Média: {stage.avgMonthsParticipating.toFixed(1)} meses
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              <Box sx={{ mt: 1, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Chip
                  icon={<Group />}
                  label={`${stage.uniqueChildren} crianças`}
                  size="small"
                  variant="outlined"
                />
                <Chip
                  label={`${stage.meditationRate.toFixed(1)}% meditação`}
                  size="small"
                  color="info"
                  variant="outlined"
                />
                <Chip
                  label={`${stage.verseRecitationRate.toFixed(1)}% recitação`}
                  size="small"
                  color="secondary"
                  variant="outlined"
                />
              </Box>
            </Box>
          );
        })}
      </Box>

      <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(25, 118, 210, 0.08)', borderRadius: 2 }}>
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
          📈 Análise de Conversão
        </Typography>
        <Grid container spacing={2}>
          {retentionData.map((stage, index) => {
            if (index === 0) return null;
            const prev = retentionData[index - 1];
            const conversionRate = ((stage.uniqueChildren / prev.uniqueChildren) * 100).toFixed(1);

            return (
              <Grid item xs={12} sm={4} key={stage.timeRange}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    {prev.timeRange} → {stage.timeRange}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="h6" fontWeight="bold" color="primary">
                      {conversionRate}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      conversão
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={parseFloat(conversionRate)}
                    sx={{
                      mt: 0.5,
                      height: 4,
                      borderRadius: 2,
                      bgcolor: `${theme.palette.primary.main}15`,
                      '& .MuiLinearProgress-bar': {
                        bgcolor: theme.palette.primary.main,
                      },
                    }}
                  />
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Box>

      <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(76, 175, 80, 0.08)', borderRadius: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={3}>
            <Typography variant="body2" color="text.secondary">
              Total Geral
            </Typography>
            <Typography variant="h6" fontWeight="bold" color="success.main">
              {retentionData.reduce((sum, s) => sum + s.total, 0)}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Typography variant="body2" color="text.secondary">
              Taxa Média
            </Typography>
            <Typography variant="h6" fontWeight="bold" color="success.main">
              {(
                retentionData.reduce((sum, s) => sum + s.presenceRate, 0) / retentionData.length
              ).toFixed(1)}
              %
            </Typography>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Typography variant="body2" color="text.secondary">
              Maior Retenção
            </Typography>
            <Typography variant="h6" fontWeight="bold" color="success.main">
              {Math.max(...retentionData.map((s) => s.presenceRate)).toFixed(1)}%
            </Typography>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Typography variant="body2" color="text.secondary">
              Taxa de Veteranos
            </Typography>
            <Typography variant="h6" fontWeight="bold" color="success.main">
              {(
                (retentionData.find((s) => s.timeRange === '1+ ano')?.uniqueChildren || 0) /
                retentionData.reduce((sum, s) => sum + s.uniqueChildren, 0) *
                100
              ).toFixed(1)}
              %
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

