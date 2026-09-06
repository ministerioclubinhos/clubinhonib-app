import React from 'react';
import {
  Avatar,
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
  CheckCircle,
  Star,
} from '@mui/icons-material';

import type { ChildrenStatsResponseDto } from '../types';
import { engagementColor, nameInitials } from '../utils/ranking';

type Props = {
  data: ChildrenStatsResponseDto;
};

/** A lista de crianças no computador, em tabela. */
export default function ChildrenListDesktop({ data }: Props) {
  const theme = useTheme();
  const getEngagementColor = engagementColor;

  return (

            <TableContainer data-testid="statistics-children-list-desktop" component={Paper} elevation={3} sx={{ borderRadius: 2 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'primary.main' }}>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Ranking</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Criança</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Idade</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Clubinho</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Cidade</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Tempo</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Pagelas</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Presença</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Engajamento</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.children.map((child) => (
                    <TableRow key={child.childId} hover>
                      <TableCell>
                        <Typography fontWeight="bold" color="primary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>#{child.rank}</Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar
                            sx={{
                              width: 36,
                              height: 36,
                              bgcolor: child.gender === 'F' ? theme.palette.secondary.main : theme.palette.info.main,
                              fontSize: 14,
                            }}
                          >
                            {nameInitials(child.name)}
                          </Avatar>
                          <Box>
                            <Typography fontWeight="medium" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>{child.name}</Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                              {child.gender === 'M' ? 'Masculino' : 'Feminino'}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>{child.age} anos</TableCell>
                      <TableCell sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                        {child.club ? `#${child.club.number}` : '-'}
                      </TableCell>
                      <TableCell sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                        {child.address ? `${child.address.city}, ${child.address.state}` : '-'}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={`${child.monthsParticipating}m`}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>{child.stats.totalPagelas}</TableCell>
                      <TableCell align="right">
                        <Box>
                          <Typography variant="body2" fontWeight="bold" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                            {child.stats.presenceRate.toFixed(1)}%
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={child.stats.presenceRate}
                            sx={{
                              mt: 0.5,
                              height: 4,
                              borderRadius: 2,
                              bgcolor: `${theme.palette.success.main}15`,
                              '& .MuiLinearProgress-bar': {
                                bgcolor: theme.palette.success.main,
                              },
                            }}
                          />
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          icon={<Star />}
                          label={child.stats.engagementScore.toFixed(0)}
                          size="small"
                          color={getEngagementColor(child.stats.engagementScore)}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          {child.isActive && (
                            <Chip label="Ativo" size="small" color="success" variant="outlined" />
                          )}
                          {child.decisions.hasDecision && (
                            <Chip
                              icon={<CheckCircle />}
                              label={child.decisions.decisionType}
                              size="small"
                              color="success"
                            />
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {data.children.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                    Nenhuma criança encontrada com os filtros selecionados
                  </Typography>
                </Box>
              )}
            </TableContainer>
  );
}
