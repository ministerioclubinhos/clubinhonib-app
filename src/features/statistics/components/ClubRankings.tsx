import React from 'react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  useTheme,
  Card,
  CardContent,
  useMediaQuery,
  Stack,
  Divider,
  Grid,
} from '@mui/material';
import { EmojiEvents, TrendingUp } from '@mui/icons-material';
import { useInsights } from '../hooks';
import { StatisticsFilters } from '../api';

interface ClubRankingsProps {
  filters?: StatisticsFilters;
}

export const ClubRankings: React.FC<ClubRankingsProps> = ({ filters }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { data, isLoading, error } = useInsights(filters);

  if (isLoading) {
    return (
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      </Paper>
    );
  }

  if (error || !data) {
    return (
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Typography color="error">Erro ao carregar rankings</Typography>
      </Paper>
    );
  }

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

  const getPerformanceColor = (score: number) => {
    if (score >= 85) return 'success';
    if (score >= 70) return 'info';
    if (score >= 50) return 'warning';
    return 'error';
  };

  return (
    <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: { xs: 2, sm: 3 } }}>
        <EmojiEvents sx={{ color: theme.palette.warning.main, fontSize: { xs: 24, sm: 28 } }} />
        <Typography variant="h6" fontWeight="bold" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
          🏆 Ranking de Clubinhos
        </Typography>
      </Box>

      {data.clubRankings.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
            Nenhum dado disponível
          </Typography>
        </Box>
      ) : isMobile ? (
        
        <Stack spacing={2}>
          {data.clubRankings.map((club, index) => (
            <Card
              key={club.clubId}
              elevation={2}
              sx={{
                borderRadius: 2,
                border: index < 3 ? `2px solid ${getMedalColor(index)}40` : undefined,
                bgcolor: index < 3 ? `${getMedalColor(index)}10` : undefined,
              }}
            >
              <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                <Stack spacing={1.5}>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      {index < 3 ? (
                        <EmojiEvents sx={{ color: getMedalColor(index), fontSize: { xs: 20, sm: 24 } }} />
                      ) : (
                        <Typography fontWeight="bold" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                          {index + 1}
                        </Typography>
                      )}
                      <Typography fontWeight="bold" sx={{ fontSize: { xs: '0.95rem', sm: '1.125rem' } }}>
                        Clubinho #{club.clubNumber}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider />

                  <Grid container spacing={1.5}>
                    <Grid item xs={6}>
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                          Crianças
                        </Typography>
                        <Typography variant="body2" fontWeight="bold" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                          {club.totalChildren}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                          Presença
                        </Typography>
                        <Typography variant="body2" fontWeight="bold" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                          {club.avgPresenceRate.toFixed(1)}%
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                          Decisões
                        </Typography>
                        <Typography variant="body2" fontWeight="bold" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                          {club.totalDecisions}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                          Performance
                        </Typography>
                        <Chip
                          label={`${club.performanceScore.toFixed(1)}%`}
                          color={getPerformanceColor(club.performanceScore)}
                          size="small"
                          icon={<TrendingUp />}
                          sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                        />
                      </Box>
                    </Grid>
                  </Grid>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      ) : (
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell width={60}><strong>Pos.</strong></TableCell>
                <TableCell><strong>Clubinho</strong></TableCell>
                <TableCell align="right"><strong>Crianças</strong></TableCell>
                <TableCell align="right"><strong>Presença %</strong></TableCell>
                <TableCell align="right"><strong>Decisões</strong></TableCell>
                <TableCell align="right"><strong>Performance</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.clubRankings.map((club, index) => (
                <TableRow
                  key={club.clubId}
                  hover
                  sx={{
                    backgroundColor: index < 3 ? `${getMedalColor(index)}10` : 'transparent',
                  }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {index < 3 ? (
                        <EmojiEvents sx={{ color: getMedalColor(index), fontSize: 24 }} />
                      ) : (
                        <Typography fontWeight="bold" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>{index + 1}</Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight="bold" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Clubinho #{club.clubNumber}</Typography>
                  </TableCell>
                  <TableCell align="right" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>{club.totalChildren}</TableCell>
                  <TableCell align="right" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>{club.avgPresenceRate.toFixed(1)}%</TableCell>
                  <TableCell align="right" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>{club.totalDecisions}</TableCell>
                  <TableCell align="right">
                    <Chip
                      label={`${club.performanceScore.toFixed(1)}%`}
                      color={getPerformanceColor(club.performanceScore)}
                      size="small"
                      icon={<TrendingUp />}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
};

