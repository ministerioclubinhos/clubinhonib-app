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
  useMediaQuery,
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
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { data, isLoading } = usePagelasChartData(filters);

  const topClubs = React.useMemo(() => {
    if (!data?.byClub || data.byClub.length === 0) return [];
    const sorted = [...data.byClub]
      .filter(club => {
        const rate = Number(club.presenceRate);
        return !isNaN(rate) && rate >= 0;
      })
      .sort((a, b) => b.presenceRate - a.presenceRate)
      .slice(0, 10)
      .map((club, index) => ({
        ...club,
        presenceRate: Number(club.presenceRate) || 0,
        clubNumber: Number(club.clubNumber) || 0,
      }));
    
    return sorted;
  }, [data?.byClub]);

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

  if (!data.byClub || data.byClub.length === 0) {
    return (
      <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
        <Typography color="text.secondary">Nenhum dado de clubinho disponível para o período selecionado</Typography>
      </Paper>
    );
  }

  const getPerformanceColor = (rate: number) => {
    if (rate >= 90) return theme.palette.success.main;
    if (rate >= 75) return theme.palette.info.main;
    if (rate >= 60) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  const getMedalColor = (position: number) => {
    switch (position) {
      case 0:
        return '#FFD700'; 
      case 1:
        return '#C0C0C0'; 
      case 2:
        return '#CD7F32'; 
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
        p: { xs: 2, sm: 3 },
        borderRadius: 3,
        background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.warning.main}03 100%)`,
        border: `2px solid ${theme.palette.divider}`,
        width: '98%',
        maxWidth: '98%',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ mb: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1, flexWrap: 'wrap' }}>
          <EmojiEvents sx={{ fontSize: { xs: 24, sm: 28 }, color: theme.palette.warning.main }} />
          <Typography variant="h5" fontWeight="bold" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
            🏆 Performance dos Clubinhos
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
          Ranking de clubinhos por taxa de presença e engajamento
        </Typography>
      </Box>

      {topClubs.length > 0 ? (
        <Box sx={{ width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
          <ResponsiveContainer width="100%" height={isMobile ? 300 : 400}>
            <BarChart 
              data={topClubs} 
              margin={{ top: 20, right: isMobile ? 10 : 30, left: isMobile ? 10 : 20, bottom: isMobile ? 80 : 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
              <XAxis 
                dataKey="clubNumber"
                tickFormatter={(value) => `#${value}`}
                stroke={theme.palette.text.secondary}
                angle={isMobile ? -90 : -45}
                textAnchor="end"
                height={isMobile ? 100 : 80}
                style={{ fontSize: isMobile ? 10 : 12 }}
              />
              <YAxis
                type="number"
                domain={[0, 100]}
                stroke={theme.palette.text.secondary}
                label={{ value: 'Taxa de Presença (%)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                dataKey="presenceRate" 
                name="Taxa de Presença (%)" 
                radius={[8, 8, 0, 0]}
                isAnimationActive={true}
              >
                {topClubs.map((entry, index) => (
                  <Cell key={`cell-${entry.clubId || index}`} fill={getPerformanceColor(entry.presenceRate)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
          <Typography color="text.secondary">Nenhum dado disponível para exibir no gráfico</Typography>
        </Box>
      )}

      <Box sx={{ mt: { xs: 2, sm: 3 } }}>
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
          Top 5 Clubinhos
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, sm: 2 } }}>
          {topClubs.slice(0, 5).map((club, index) => (
            <Paper
              key={club.clubId}
              elevation={0}
              sx={{
                p: { xs: 1.5, sm: 2 },
                borderRadius: 2,
                background: index < 3 ? `${getMedalColor(index)}08` : theme.palette.background.default,
                border: `1px solid ${theme.palette.divider}`,
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: isMobile ? 'none' : 'translateX(4px)',
                  boxShadow: 2,
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 } }}>
                
                <Avatar
                  sx={{
                    width: { xs: 36, sm: 40 },
                    height: { xs: 36, sm: 40 },
                    bgcolor: index < 3 ? getMedalColor(index) : theme.palette.grey[400],
                    fontWeight: 'bold',
                    fontSize: { xs: 14, sm: 16 },
                  }}
                >
                  {index < 3 ? <EmojiEvents sx={{ fontSize: { xs: 20, sm: 24 } }} /> : index + 1}
                </Avatar>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
                    <Typography variant="subtitle1" fontWeight="bold" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                      Clubinho #{club.clubNumber}
                    </Typography>
                    <Chip
                      icon={<Group sx={{ fontSize: { xs: 14, sm: 16 } }} />}
                      label={`${club.total} pagelas`}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' }, height: { xs: 20, sm: 24 } }}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 }, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
                    <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: 'auto' } }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                          Taxa de Presença
                        </Typography>
                        <Typography variant="caption" fontWeight="bold" color={getPerformanceColor(club.presenceRate)} sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                          {club.presenceRate.toFixed(1)}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={club.presenceRate}
                        sx={{
                          height: { xs: 4, sm: 6 },
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
                      icon={<TrendingUp sx={{ fontSize: { xs: 14, sm: 16 } }} />}
                      label={club.presenceRate >= 85 ? 'Excelente' : club.presenceRate >= 70 ? 'Bom' : 'Regular'}
                      size="small"
                      color={club.presenceRate >= 85 ? 'success' : club.presenceRate >= 70 ? 'info' : 'warning'}
                      sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' }, height: { xs: 20, sm: 24 } }}
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

