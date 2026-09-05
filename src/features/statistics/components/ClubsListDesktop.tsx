import React from 'react';
import {
  Box,
  Chip,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from '@mui/material';
import {
  EmojiEvents,
  Groups,
  School,
  TrendingUp,
} from '@mui/icons-material';

import { WEEKDAY_NAMES } from '../constants';
import type { ClubsStatsResponseDto } from '../types';
import { medalColor, performanceColor } from '../utils/ranking';

type Props = {
  data: ClubsStatsResponseDto;
};

/** O ranking de clubinhos no computador, em tabela. */
export default function ClubsListDesktop({ data }: Props) {
  const theme = useTheme();
  const getPerformanceColor = performanceColor;
  const getMedalColor = (rank: number) => medalColor(rank, theme);

  return (

            <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 2 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'primary.main' }}>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Rank</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Clubinho</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Dia/Horário</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Local</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Coordenador</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Crianças</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Professores</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Presença</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Performance</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Decisões</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.clubs.map((club) => (
                    <TableRow
                      key={club.clubId}
                      hover
                      sx={{ bgcolor: club.rank <= 3 ? `${getMedalColor(club.rank)}08` : 'transparent' }}
                    >
                      <TableCell>
                        {club.rank <= 3 ? (
                          <EmojiEvents sx={{ color: getMedalColor(club.rank), fontSize: 28 }} />
                        ) : (
                          <Typography fontWeight="bold" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>#{club.rank}</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="subtitle1" fontWeight="bold" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                          Clubinho #{club.clubNumber}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>{WEEKDAY_NAMES[club.weekday] || club.weekday}</Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>{club.time}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>{club.address.city}, {club.address.state}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>{club.address.district}</Typography>
                      </TableCell>
                      <TableCell sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                        {club.coordinator ? club.coordinator.name : '-'}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          icon={<Groups />}
                          label={`${club.children.total} (${club.children.active} ativos)`}
                          size="small"
                          variant="outlined"
                        />
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                          M: {club.children.byGender.M} | F: {club.children.byGender.F}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          icon={<School />}
                          label={club.teachers.total.toString()}
                          size="small"
                          color="info"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Box>
                          <Typography variant="body2" fontWeight="bold" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                            {club.performance.presenceRate.toFixed(1)}%
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={club.performance.presenceRate}
                            sx={{
                              mt: 0.5,
                              height: 4,
                              borderRadius: 2,
                              '& .MuiLinearProgress-bar': {
                                bgcolor: theme.palette.success.main,
                              },
                            }}
                          />
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          icon={<TrendingUp />}
                          label={club.performance.performanceScore.toFixed(1)}
                          size="small"
                          color={getPerformanceColor(club.performance.performanceScore)}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={club.performance.totalDecisions}
                          size="small"
                          color="success"
                          variant="outlined"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {data.clubs.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Nenhum clubinho encontrado</Typography>
                </Box>
              )}
            </TableContainer>
  );
}
