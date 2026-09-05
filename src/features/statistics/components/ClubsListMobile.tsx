import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid2,
  LinearProgress,
  Paper,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import {
  EmojiEvents,
  TrendingUp,
} from '@mui/icons-material';

import { WEEKDAY_NAMES } from '../constants';
import type { ClubsStatsResponseDto } from '../types';
import { medalColor, performanceColor } from '../utils/ranking';

type Props = {
  data: ClubsStatsResponseDto;
};

/**
 * O ranking de clubinhos no celular.
 *
 * Um cartão por clubinho: a tabela do computador não cabe na largura do
 * telefone sem rolagem lateral.
 */
export default function ClubsListMobile({ data }: Props) {
  const theme = useTheme();
  const getPerformanceColor = performanceColor;
  const getMedalColor = (rank: number) => medalColor(rank, theme);

  return (
            <Stack spacing={1.5} sx={{ width: '100%', maxWidth: '100%' }}>
              {data.clubs.length === 0 ? (
                <Paper elevation={3} sx={{ p: { xs: 1.5, sm: 3 }, borderRadius: 2, textAlign: 'center' }}>
                  <Typography color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                    Nenhum clubinho encontrado
                  </Typography>
                </Paper>
              ) : (
                data.clubs.map((club) => (
                  <Card
                    key={club.clubId}
                    elevation={1}
                    sx={{
                      borderRadius: 1.5,
                      border: club.rank <= 3 ? `2px solid ${getMedalColor(club.rank)}40` : undefined,
                      bgcolor: club.rank <= 3 ? `${getMedalColor(club.rank)}08` : undefined,
                      borderLeft: `4px solid ${club.rank <= 3 ? getMedalColor(club.rank) : theme.palette.primary.main}`,
                      width: '100%',
                      maxWidth: '100%',
                      overflow: 'hidden',
                      position: 'relative',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '3px',
                        background: `linear-gradient(90deg, ${club.rank <= 3 ? getMedalColor(club.rank) : theme.palette.primary.main} 0%, ${club.rank <= 3 ? getMedalColor(club.rank) : theme.palette.primary.light} 100%)`,
                      },
                    }}
                  >
                    <CardContent sx={{
                      p: { xs: 1, sm: 2 },
                      '&:last-child': { pb: { xs: 1, sm: 2 } },
                      width: '100%',
                      maxWidth: '100%',
                    }}>
                      <Stack spacing={1}>
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            {club.rank <= 3 ? (
                              <EmojiEvents sx={{ color: getMedalColor(club.rank), fontSize: { xs: 20, sm: 28 } }} />
                            ) : (
                              <Typography fontWeight="bold" sx={{ fontSize: { xs: '0.75rem', sm: '1rem' } }}>
                                #{club.rank}
                              </Typography>
                            )}
                            <Typography variant="subtitle1" fontWeight="bold" sx={{ fontSize: { xs: '0.85rem', sm: '1.125rem' } }}>
                              Clubinho #{club.clubNumber}
                            </Typography>
                          </Box>
                        </Box>

                        <Divider sx={{ my: 0.5 }} />

                        <Grid2 container spacing={1}>
                          <Grid2 size={6}>
                            <Box>
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' }, display: 'block', mb: 0.25 }}>
                                Dia
                              </Typography>
                              <Typography variant="caption" fontWeight="bold" sx={{ fontSize: { xs: '0.7rem', sm: '1rem' }, wordBreak: 'break-word' }}>
                                {WEEKDAY_NAMES[club.weekday] || club.weekday}
                              </Typography>
                            </Box>
                          </Grid2>
                          {club.time && (
                            <Grid2 size={6}>
                              <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' }, display: 'block', mb: 0.25 }}>
                                  Horário
                                </Typography>
                                <Typography variant="caption" fontWeight="bold" sx={{ fontSize: { xs: '0.7rem', sm: '1rem' }, wordBreak: 'break-word' }}>
                                  {club.time}
                                </Typography>
                              </Box>
                            </Grid2>
                          )}
                          <Grid2 size={6}>
                            <Box>
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' }, display: 'block', mb: 0.25 }}>
                                Cidade
                              </Typography>
                              <Typography variant="caption" fontWeight="bold" sx={{ fontSize: { xs: '0.7rem', sm: '1rem' }, wordBreak: 'break-word' }}>
                                {club.address.city}, {club.address.state}
                              </Typography>
                            </Box>
                          </Grid2>
                          {club.coordinator && (
                            <Grid2 size={6}>
                              <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' }, display: 'block', mb: 0.25 }}>
                                  Coordenador
                                </Typography>
                                <Typography variant="caption" fontWeight="bold" sx={{ fontSize: { xs: '0.7rem', sm: '1rem' }, wordBreak: 'break-word' }}>
                                  {club.coordinator.name}
                                </Typography>
                              </Box>
                            </Grid2>
                          )}
                          <Grid2 size={6}>
                            <Box>
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' }, display: 'block', mb: 0.25 }}>
                                Crianças
                              </Typography>
                              <Typography variant="caption" fontWeight="bold" sx={{ fontSize: { xs: '0.7rem', sm: '1rem' } }}>
                                {club.children.total} ({club.children.active} ativos)
                              </Typography>
                            </Box>
                          </Grid2>
                          <Grid2 size={6}>
                            <Box>
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' }, display: 'block', mb: 0.25 }}>
                                Professores
                              </Typography>
                              <Typography variant="caption" fontWeight="bold" sx={{ fontSize: { xs: '0.7rem', sm: '1rem' } }}>
                                {club.teachers.total}
                              </Typography>
                            </Box>
                          </Grid2>
                          <Grid2 size={12}>
                            <Box>
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' }, display: 'block', mb: 0.25 }}>
                                Gênero
                              </Typography>
                              <Typography variant="caption" fontWeight="bold" sx={{ fontSize: { xs: '0.7rem', sm: '1rem' } }}>
                                M: {club.children.byGender.M} | F: {club.children.byGender.F}
                              </Typography>
                            </Box>
                          </Grid2>
                        </Grid2>

                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.25 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                              Presença
                            </Typography>
                            <Typography variant="caption" fontWeight="bold" sx={{ fontSize: { xs: '0.7rem', sm: '1rem' } }}>
                              {club.performance.presenceRate.toFixed(0)}%
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={club.performance.presenceRate}
                            sx={{
                              height: { xs: 4, sm: 6 },
                              borderRadius: 2,
                              '& .MuiLinearProgress-bar': {
                                bgcolor: theme.palette.success.main,
                                borderRadius: 2,
                              },
                            }}
                          />
                        </Box>

                        <Box>
                          <Chip
                            icon={<TrendingUp sx={{ fontSize: { xs: 12, sm: 16 } }} />}
                            label={`${club.performance.performanceScore.toFixed(0)}`}
                            size="small"
                            color={getPerformanceColor(club.performance.performanceScore)}
                            sx={{
                              fontSize: { xs: '0.65rem', sm: '0.75rem' },
                              height: { xs: 20, sm: 24 },
                              width: '100%',
                              '& .MuiChip-label': { px: { xs: 0.5, sm: 1 } }
                            }}
                          />
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                ))
              )}
            </Stack>
  );
}
