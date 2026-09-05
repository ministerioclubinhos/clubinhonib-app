import React from 'react';
import {
  Avatar,
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
  CheckCircle,
  Star,
} from '@mui/icons-material';

import type { ChildrenStatsResponseDto } from '../types';
import { engagementColor, nameInitials } from '../utils/ranking';

type Props = {
  data: ChildrenStatsResponseDto;
};

/**
 * A lista de crianças no celular.
 *
 * Um cartão por criança: a tabela não cabe na largura do telefone.
 */
export default function ChildrenListMobile({ data }: Props) {
  const theme = useTheme();
  const getEngagementColor = engagementColor;

  return (
            <Stack spacing={1.5} sx={{ width: '100%', maxWidth: '100%' }}>
              {data.children.length === 0 ? (
                <Paper elevation={3} sx={{ p: { xs: 1.5, sm: 3 }, borderRadius: 2, textAlign: 'center' }}>
                  <Typography color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                    Nenhuma criança encontrada com os filtros selecionados
                  </Typography>
                </Paper>
              ) : (
                data.children.map((child) => (
                  <Card key={child.childId} elevation={1} sx={{
                    borderRadius: 1.5,
                    width: '100%',
                    maxWidth: '100%',
                    overflow: 'hidden',
                    borderLeft: `4px solid ${child.gender === 'F' ? theme.palette.secondary.main : theme.palette.info.main}`,
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '3px',
                      background: `linear-gradient(90deg, ${child.gender === 'F' ? theme.palette.secondary.main : theme.palette.info.main} 0%, ${child.gender === 'F' ? theme.palette.secondary.light : theme.palette.info.light} 100%)`,
                    },
                  }}>
                    <CardContent sx={{
                      p: { xs: 1, sm: 2 },
                      '&:last-child': { pb: { xs: 1, sm: 2 } },
                      width: '100%',
                      maxWidth: '100%',
                    }}>
                      <Stack spacing={1}>

                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                            <Typography fontWeight="bold" color="primary" sx={{ fontSize: { xs: '0.75rem', sm: '1rem' } }}>
                              #{child.rank}
                            </Typography>
                            <Avatar
                              sx={{
                                width: { xs: 28, sm: 36 },
                                height: { xs: 28, sm: 36 },
                                bgcolor: child.gender === 'F' ? theme.palette.secondary.main : theme.palette.info.main,
                                fontSize: { xs: 11, sm: 14 },
                              }}
                            >
                              {nameInitials(child.name)}
                            </Avatar>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography fontWeight="medium" sx={{ fontSize: { xs: '0.8rem', sm: '1rem' }, wordBreak: 'break-word' }}>
                                {child.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' }, wordBreak: 'break-word' }}>
                                {child.gender === 'M' ? 'Masculino' : 'Feminino'} • {child.age} anos
                              </Typography>
                            </Box>
                          </Box>
                        </Box>

                        <Divider sx={{ my: 0.5 }} />

                        <Grid2 container spacing={1}>
                          <Grid2 size={6}>
                            <Box>
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                                Clubinho
                              </Typography>
                              <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '1rem' }, wordBreak: 'break-word' }}>
                                {child.club ? `#${child.club.number}` : '-'}
                              </Typography>
                            </Box>
                          </Grid2>
                          <Grid2 size={6}>
                            <Box>
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                                Cidade
                              </Typography>
                              <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '1rem' }, wordBreak: 'break-word' }}>
                                {child.address ? `${child.address.city}, ${child.address.state}` : '-'}
                              </Typography>
                            </Box>
                          </Grid2>
                          <Grid2 size={6}>
                            <Box>
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                                Tempo
                              </Typography>
                              <Chip
                                label={`${child.monthsParticipating}m`}
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' }, height: { xs: 20, sm: 24 } }}
                              />
                            </Box>
                          </Grid2>
                          <Grid2 size={6}>
                            <Box>
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                                Pagelas
                              </Typography>
                              <Typography variant="body2" fontWeight="bold" sx={{ fontSize: { xs: '0.8rem', sm: '1rem' } }}>
                                {child.stats.totalPagelas}
                              </Typography>
                            </Box>
                          </Grid2>
                        </Grid2>

                        <Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                              Presença
                            </Typography>
                            <Typography variant="body2" fontWeight="bold" sx={{ fontSize: { xs: '0.8rem', sm: '1rem' } }}>
                              {child.stats.presenceRate.toFixed(1)}%
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={child.stats.presenceRate}
                            sx={{
                              height: { xs: 4, sm: 6 },
                              borderRadius: 2,
                              bgcolor: `${theme.palette.success.main}15`,
                              '& .MuiLinearProgress-bar': {
                                bgcolor: theme.palette.success.main,
                                borderRadius: 2,
                              },
                            }}
                          />
                        </Box>

                        <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', alignItems: 'center' }}>
                          <Chip
                            icon={<Star sx={{ fontSize: { xs: 12, sm: 16 } }} />}
                            label={`${child.stats.engagementScore.toFixed(0)}`}
                            size="small"
                            color={getEngagementColor(child.stats.engagementScore)}
                            sx={{
                              fontSize: { xs: '0.65rem', sm: '0.75rem' },
                              height: { xs: 20, sm: 24 },
                              '& .MuiChip-label': { px: { xs: 0.5, sm: 1 } }
                            }}
                          />
                          {child.isActive && (
                            <Chip label="Ativo" size="small" color="success" variant="outlined" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' }, height: { xs: 20, sm: 24 } }} />
                          )}
                          {child.decisions.hasDecision && (
                            <Chip
                              icon={<CheckCircle sx={{ fontSize: { xs: 12, sm: 16 } }} />}
                              label={child.decisions.decisionType}
                              size="small"
                              color="success"
                              sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' }, height: { xs: 20, sm: 24 } }}
                            />
                          )}
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                ))
              )}
            </Stack>
  );
}
