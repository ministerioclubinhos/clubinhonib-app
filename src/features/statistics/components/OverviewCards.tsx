import React from 'react';
import { Box, Grid, Paper, Typography, CircularProgress, useTheme } from '@mui/material';
import { People, School, Groups, TrendingUp } from '@mui/icons-material';
import { useOverview } from '../hooks';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => {
  const theme = useTheme();
  
  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRadius: 2,
        background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
        border: `1px solid ${color}30`,
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" fontWeight="bold" color={color}>
            {value}
          </Typography>
        </Box>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            bgcolor: `${color}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {React.cloneElement(icon as React.ReactElement<{ sx?: object }>, {
            sx: { fontSize: 32, color },
          })}
        </Box>
      </Box>
    </Paper>
  );
};

export const OverviewCards: React.FC = () => {
  const theme = useTheme();
  const { data, isLoading, error } = useOverview();

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
        <Typography color="error">Erro ao carregar dados gerais</Typography>
      </Box>
    );
  }

  const cards = [
    {
      title: 'Total de Crianças',
      value: data.summary.totalChildren,
      icon: <People />,
      color: theme.palette.primary.main,
    },
    {
      title: 'Total de Clubinhos',
      value: data.summary.totalClubs,
      icon: <Groups />,
      color: theme.palette.secondary.main,
    },
    {
      title: 'Total de Professores',
      value: data.summary.totalTeachers,
      icon: <School />,
      color: theme.palette.success.main,
    },
    {
      title: 'Ativos Este Mês',
      value: data.summary.activeChildrenThisMonth,
      icon: <TrendingUp />,
      color: theme.palette.info.main,
    },
  ];

  return (
    <Grid container spacing={3}>
      {cards.map((card, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <StatCard {...card} />
        </Grid>
      ))}
    </Grid>
  );
};

