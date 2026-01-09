import React from 'react';
import { Box, Grid, Paper, Typography, LinearProgress, useTheme, Chip } from '@mui/material';
import { TrendingUp, TrendingDown, TrendingFlat } from '@mui/icons-material';
import { useOverview } from '../hooks';

interface MetricCardProps {
  title: string;
  currentValue: number;
  previousValue?: number;
  icon: React.ReactNode;
  suffix?: string;
  color: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  currentValue,
  previousValue,
  icon,
  suffix = '',
  color,
}) => {
  const theme = useTheme();

  const getTrend = () => {
    if (!previousValue) return null;
    const change = ((currentValue - previousValue) / previousValue) * 100;
    if (Math.abs(change) < 1)
      return { icon: <TrendingFlat />, color: theme.palette.grey[500], text: 'Estável' };
    if (change > 0)
      return {
        icon: <TrendingUp />,
        color: theme.palette.success.main,
        text: `+${change.toFixed(1)}%`,
      };
    return {
      icon: <TrendingDown />,
      color: theme.palette.error.main,
      text: `${change.toFixed(1)}%`,
    };
  };

  const trend = getTrend();

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 1.5, sm: 2 },
        height: '100%',
        background: `linear-gradient(135deg, ${color}08 0%, ${color}03 100%)`,
        border: `2px solid ${color}20`,
        borderRadius: 3,
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: `0 8px 24px ${color}30`,
          borderColor: `${color}40`,
        },
      }}
    >
      {/* Decorative background element */}
      <Box
        sx={{
          position: 'absolute',
          top: -20,
          right: -20,
          width: { xs: 60, sm: 100 },
          height: { xs: 60, sm: 100 },
          borderRadius: '50%',
          background: `radial-gradient(circle, ${color}15 0%, transparent 70%)`,
        }}
      />

      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            mb: { xs: 1, sm: 1.5 },
          }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
            fontWeight={600}
            sx={{
              textTransform: 'uppercase',
              letterSpacing: 1,
              fontSize: { xs: '0.7rem', sm: '0.75rem' },
            }}
          >
            {title}
          </Typography>
          <Box
            sx={{
              p: { xs: 0.75, sm: 1 },
              borderRadius: 2,
              bgcolor: `${color}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              '& svg': {
                fontSize: { xs: 18, sm: 24 },
                color: color,
              },
            }}
          >
            {icon}
          </Box>
        </Box>

        <Typography
          variant="h4"
          fontWeight="bold"
          sx={{
            background: `linear-gradient(135deg, ${color} 0%, ${color}CC 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            mb: { xs: 0.5, sm: 1 },
            fontSize: { xs: '1.5rem', sm: '2rem' },
          }}
        >
          {currentValue.toLocaleString('pt-BR')}
          {suffix && (
            <Typography
              component="span"
              variant="h6"
              sx={{ ml: 0.5, opacity: 0.7, fontSize: { xs: '1rem', sm: '1.25rem' } }}
            >
              {suffix}
            </Typography>
          )}
        </Typography>

        {trend && (
          <Chip
            icon={trend.icon}
            label={trend.text}
            size="small"
            sx={{
              bgcolor: `${trend.color}15`,
              color: trend.color,
              fontWeight: 600,
              fontSize: { xs: '0.65rem', sm: '0.7rem' },
              height: { xs: 20, sm: 24 },
              '& .MuiChip-icon': { color: trend.color },
            }}
          />
        )}
      </Box>
    </Paper>
  );
};

export const OverviewSummaryCards: React.FC = () => {
  const theme = useTheme();
  const { data, isLoading } = useOverview();

  if (isLoading || !data) return null;

  const metrics: Array<{
    title: string;
    currentValue: number;
    previousValue?: number;
    icon: React.ReactNode;
    color: string;
  }> = [
    {
      title: 'Total de Crianças',
      currentValue: data.summary.totalChildren,
      icon: <TrendingUp />,
      color: theme.palette.primary.main,
    },
    {
      title: 'Clubinhos Ativos',
      currentValue: data.summary.totalClubs,
      icon: <TrendingUp />,
      color: theme.palette.secondary.main,
    },
    {
      title: 'Professores',
      currentValue: data.summary.totalTeachers,
      icon: <TrendingUp />,
      color: theme.palette.success.main,
    },
    {
      title: 'Ativos Este Mês',
      currentValue: data.summary.activeChildrenThisMonth,
      previousValue: data.summary.totalChildren,
      icon: <TrendingUp />,
      color: theme.palette.info.main,
    },
    // ⭐ v2.10.0: Informações sobre clubinhos e crianças desativadas
    ...(data.summary.inactiveChildren !== undefined
      ? [
          {
            title: 'Crianças Desativadas',
            currentValue: data.summary.inactiveChildren,
            icon: <TrendingDown />,
            color: theme.palette.warning.main,
          },
        ]
      : []),
    ...(data.summary.inactiveClubs !== undefined
      ? [
          {
            title: 'Clubinhos Desativados',
            currentValue: data.summary.inactiveClubs,
            icon: <TrendingDown />,
            color: theme.palette.error.main,
          },
        ]
      : []),
  ];

  // Calcular taxa de engajamento
  const engagementRate = (data.summary.activeChildrenThisMonth / data.summary.totalChildren) * 100;

  return (
    <Box>
      <Grid container spacing={{ xs: 1, sm: 1.5 }}>
        {metrics.map((metric, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <MetricCard {...metric} />
          </Grid>
        ))}
      </Grid>

      {/* Barra de Engajamento */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3 },
          mt: { xs: 2, sm: 3 },
          borderRadius: 3,
          background: `linear-gradient(135deg, ${theme.palette.primary.main}08 0%, ${theme.palette.secondary.main}08 100%)`,
          border: `2px solid ${theme.palette.divider}`,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 1.5,
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          <Typography
            variant="body2"
            fontWeight={600}
            color="text.secondary"
            sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
          >
            Taxa de Engajamento Mensal
          </Typography>
          <Typography
            variant="h6"
            fontWeight="bold"
            color="primary"
            sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
          >
            {engagementRate.toFixed(1)}%
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={engagementRate}
          sx={{
            height: 12,
            borderRadius: 6,
            bgcolor: `${theme.palette.primary.main}10`,
            '& .MuiLinearProgress-bar': {
              borderRadius: 6,
              background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            },
          }}
        />
      </Paper>
    </Box>
  );
};
