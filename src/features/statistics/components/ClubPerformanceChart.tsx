import React from 'react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  useTheme,
  Avatar,
  LinearProgress,
  Chip,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { EmojiEvents, TrendingUp, Group } from '@mui/icons-material';
import { usePagelasChartData } from '../hooks';
import { StatisticsFilters } from '../api';

interface ClubPerformanceChartProps {
  filters?: StatisticsFilters;
}

export const ClubPerformanceChart: React.FC<ClubPerformanceChartProps> = ({ filters }) => {
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

  if (!data) {
    return (
      <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
        <Typography color="error">Erro ao carregar dados dos clubinhos</Typography>
      </Paper>
    );
  }

  // Ordenar clubinhos por performance
  const sortedClubs = [...data.byClub].sort((a, b) => b.presenceRate - a.presenceRate);
  const topClubs = sortedClubs.slice(0, 10);

  const getPerformanceColor = (rate: number) => {
    if (rate >= 90) return theme.palette.success.main;
    if (rate >= 75) return theme.palette.info.main;
    if (rate >= 60) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  const getMedalColor = (position: number) => {
    switch (position) {
      case 0:
        return '#FFD700'; // Ouro
      case 1:
        return '#C0C0C0'; // Prata
      case 2:
        return '#CD7F32'; // Bronze
      default:
        return theme.palette.grey[400];
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Paper
          elevation={8}
          sx={{
            p: 2,
            background: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 2,
            minWidth: 200,
          }}
        >
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            Clubinho #{data.clubNumber}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Typography variant="body2">
              Total: <strong>{data.total}</strong>
            </Typography>
            <Typography variant="body2">
              Presença: <strong>{data.presenceRate.toFixed(1)}%</strong>
            </Typography>
            {data.meditationRate && (
              <Typography variant="body2">
                Meditação: <strong>{data.meditationRate.toFixed(1)}%</strong>
              </Typography>
            )}
          </Box>
        </Paper>
      );
    }
    return null;
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.warning.main}03 100%)`,
        border: `2px solid ${theme.palette.divider}`,
      }}
    >
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
          <EmojiEvents sx={{ fontSize: 28, color: theme.palette.warning.main }} />
          <Typography variant="h5" fontWeight="bold">
            🏆 Performance dos Clubinhos
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Ranking de clubinhos por taxa de presença e engajamento
        </Typography>
      </Box>

      {/* Gráfico de Barras Horizontal */}
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={topClubs} layout="horizontal">
          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
          <XAxis type="number" domain={[0, 100]} stroke={theme.palette.text.secondary} />
          <YAxis
            type="category"
            dataKey="clubNumber"
            tickFormatter={(value) => `#${value}`}
            stroke={theme.palette.text.secondary}
            width={60}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="presenceRate" name="Taxa de Presença (%)" radius={[0, 8, 8, 0]}>
            {topClubs.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getPerformanceColor(entry.presenceRate)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Lista Detalhada */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
          Top 5 Clubinhos
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {topClubs.slice(0, 5).map((club, index) => (
            <Paper
              key={club.clubId}
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                background: index < 3 ? `${getMedalColor(index)}08` : theme.palette.background.default,
                border: `1px solid ${theme.palette.divider}`,
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateX(4px)',
                  boxShadow: 2,
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {/* Posição/Medalha */}
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: index < 3 ? getMedalColor(index) : theme.palette.grey[400],
                    fontWeight: 'bold',
                  }}
                >
                  {index < 3 ? <EmojiEvents /> : index + 1}
                </Avatar>

                {/* Informações do Clubinho */}
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      Clubinho #{club.clubNumber}
                    </Typography>
                    <Chip
                      icon={<Group />}
                      label={`${club.total} pagelas`}
                      size="small"
                      variant="outlined"
                    />
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          Taxa de Presença
                        </Typography>
                        <Typography variant="caption" fontWeight="bold" color={getPerformanceColor(club.presenceRate)}>
                          {club.presenceRate.toFixed(1)}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={club.presenceRate}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          bgcolor: `${getPerformanceColor(club.presenceRate)}15`,
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 3,
                            bgcolor: getPerformanceColor(club.presenceRate),
                          },
                        }}
                      />
                    </Box>

                    <Chip
                      icon={<TrendingUp />}
                      label={club.presenceRate >= 85 ? 'Excelente' : club.presenceRate >= 70 ? 'Bom' : 'Regular'}
                      size="small"
                      color={club.presenceRate >= 85 ? 'success' : club.presenceRate >= 70 ? 'info' : 'warning'}
                    />
                  </Box>
                </Box>
              </Box>
            </Paper>
          ))}
        </Box>
      </Box>
    </Paper>
  );
};

