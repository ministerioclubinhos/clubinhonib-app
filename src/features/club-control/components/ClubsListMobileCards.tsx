import React from 'react';
import {
  Alert,
  AlertTitle,
  Badge,
  Box,
  Card,
  CardContent,
  Chip,
  Collapse,
  Divider,
  Grid2,
  IconButton,
  LinearProgress,
  List,
  Paper,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import {
  CheckCircle,
  ExpandLess,
  ExpandMore,
  PersonOff,
} from '@mui/icons-material';
import dayjs from 'dayjs';

import type { ClubCheckResult, WeekCheckResult } from '../types';
import {
  statusConfigOf,
  toAlertSeverity,
  weekdayNames,
} from './clubsListShared';

type Props = {
  clubs: ClubCheckResult[];
  data: WeekCheckResult | null;
  expandedClubs: Set<string>;
  onToggleExpanded: (clubId: string) => void;
};

/**
 * A listagem de clubinhos no celular.
 *
 * Um cartão por clubinho, com os detalhes atrás de um toque — a tabela não
 * cabe na largura do telefone.
 */
export default function ClubsListMobileCards({
  clubs,
  expandedClubs,
  onToggleExpanded,
}: Props) {
  const theme = useTheme();
  const getStatusConfig = (status: string) => statusConfigOf(status, theme);

  return (
        <Box sx={{ p: { xs: 1, sm: 2 } }}>
          {clubs.map((club) => {
            const statusConfig = getStatusConfig(club.status);
            const isExpanded = expandedClubs.has(club.clubId);
            const completeness =
              club.children.total > 0 ? (club.children.withPagela / club.children.total) * 100 : 0;

            return (
              <Card
                key={club.clubId}
                elevation={2}
                sx={{
                  mb: 2,
                  border: `2px solid ${statusConfig.borderColor}40`,
                  bgcolor: statusConfig.bgcolor,
                  borderRadius: 2,
                  overflow: 'hidden',
                }}
              >
                <CardContent
                  sx={{ p: { xs: 1.5, sm: 2 }, cursor: 'pointer' }}
                  onClick={() => onToggleExpanded(club.clubId)}
                >
                  <Stack spacing={1.5}>

                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ flex: 1 }}>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            bgcolor: statusConfig.color + '20',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold',
                            color: statusConfig.color,
                            fontSize: '1rem',
                          }}
                        >
                          {club.clubNumber}
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="subtitle1" fontWeight="bold" sx={{ fontSize: { xs: '0.95rem', sm: '1rem' } }}>
                            Clubinho #{club.clubNumber}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                            {club.week.expectedDate ? dayjs(club.week.expectedDate).format('DD/MM/YYYY') : 'Sem data'}
                          </Typography>
                        </Box>
                      </Stack>
                      <IconButton size="small" onClick={(e) => { e.stopPropagation(); onToggleExpanded(club.clubId); }} aria-label="Mostrar ou esconder os detalhes do clubinho">
                        {isExpanded ? <ExpandLess /> : <ExpandMore />}
                      </IconButton>
                    </Box>

                    <Grid2 container spacing={1.5}>
                      <Grid2 size={6}>
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                            Dia da Semana
                          </Typography>
                          <Box sx={{ mt: 0.5 }}>
                            {club.weekday ? (
                              <Chip
                                label={weekdayNames[club.weekday] || club.weekday}
                                size="small"
                                variant="outlined"
                                sx={{ fontWeight: 'bold', fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                              />
                            ) : (
                              <Chip
                                label="N/D"
                                size="small"
                                variant="outlined"
                                color="default"
                                sx={{ fontWeight: 'bold', opacity: 0.5, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                              />
                            )}
                          </Box>
                        </Box>
                      </Grid2>
                      <Grid2 size={6}>
                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                            Crianças
                          </Typography>
                          <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.5 }}>
                            <Typography variant="body2" fontWeight="bold" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                              {club.children.withPagela}/{club.children.total}
                            </Typography>
                            {club.children.missing > 0 && (
                              <Badge
                                badgeContent={club.children.missing}
                                color={club.status === 'pending' ? 'info' : 'error'}
                              >
                                <PersonOff
                                  fontSize="small"
                                  sx={{
                                    color: club.status === 'pending'
                                      ? theme.palette.info.main
                                      : theme.palette.error.main
                                  }}
                                />
                              </Badge>
                            )}
                          </Stack>
                        </Box>
                      </Grid2>
                    </Grid2>

                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                          Completude
                        </Typography>
                        <Typography variant="caption" fontWeight="bold" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                          {completeness.toFixed(0)}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={completeness}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          bgcolor: statusConfig.bgcolor,
                          '& .MuiLinearProgress-bar': {
                            bgcolor: statusConfig.color,
                            borderRadius: 3,
                          },
                        }}
                      />
                    </Box>

                    <Box>
                      <Chip
                        icon={statusConfig.icon}
                        label={statusConfig.label}
                        size="small"
                        sx={{
                          bgcolor: statusConfig.bgcolor,
                          color: statusConfig.color,
                          border: `2px solid ${statusConfig.borderColor}`,
                          fontWeight: 'bold',
                          fontSize: { xs: '0.7rem', sm: '0.75rem' },
                        }}
                      />
                    </Box>
                  </Stack>
                </CardContent>

                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                  <Box sx={{ p: { xs: 1.5, sm: 2 }, bgcolor: 'grey.50', borderTop: `1px solid ${theme.palette.divider}` }}>

                    {club.alerts && club.alerts.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        {club.alerts.map((alert, index) => (
                          <Alert key={index} severity={toAlertSeverity(alert.severity)} sx={{ mb: 1 }}>
                            <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                              {alert.message}
                            </Typography>
                          </Alert>
                        ))}
                      </Box>
                    )}

                    {club.indicators && club.indicators.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        {club.indicators.map((indicator, index) => (
                          <Alert
                            key={index}
                            severity={toAlertSeverity(indicator.severity)}
                            sx={{ mb: 1 }}
                          >
                            <Typography variant="body2" fontWeight="bold" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                              {indicator.message}
                            </Typography>
                            {indicator.type === 'children_not_attending' && indicator.details?.childrenList && indicator.details.childrenList.length > 0 && (
                              <Box sx={{ mt: 1.5 }}>
                                <Typography variant="caption" fontWeight="bold" display="block" gutterBottom sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                                  Crianças que não frequentam mais:
                                </Typography>
                                <List dense sx={{ pl: 0 }}>
                                  {indicator.details.childrenList.map((child) => (
                                    <Box
                                      key={child.childId}
                                      sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                        py: 0.5,
                                        px: 1,
                                        borderRadius: 1,
                                        bgcolor: 'rgba(0,0,0,0.03)',
                                        mb: 0.5
                                      }}
                                    >
                                      <PersonOff fontSize="small" color="disabled" />
                                      <Typography variant="caption" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                                        <strong>{child.childName}</strong>
                                        {child.reason && (
                                          <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1, fontSize: { xs: '0.65rem', sm: '0.7rem' } }}>
                                            ({child.reason})
                                          </Typography>
                                        )}
                                      </Typography>
                                    </Box>
                                  ))}
                                </List>
                              </Box>
                            )}
                            {indicator.type === 'club_inactive' && indicator.details?.note && (
                              <Typography variant="caption" display="block" sx={{ mt: 1, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                                {indicator.details.note}
                              </Typography>
                            )}
                            {indicator.details?.note && indicator.type !== 'club_inactive' && (
                              <Typography variant="caption" display="block" sx={{ mt: 1, fontStyle: 'italic', fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                                {indicator.details.note}
                              </Typography>
                            )}
                          </Alert>
                        ))}
                      </Box>
                    )}

                    {(club.children.activeCount !== undefined || club.children.inactiveCount !== undefined || club.children.note) && (
                      <Paper
                        elevation={0}
                        sx={{
                          p: 1.5,
                          mb: 2,
                          borderRadius: 2,
                          border: `2px solid ${theme.palette.info.main}30`,
                          bgcolor: theme.palette.info.main + '08'
                        }}
                      >
                        <Typography variant="subtitle2" fontWeight="bold" color="info.main" gutterBottom sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                          ℹ️ Informações sobre Crianças
                        </Typography>
                        <Divider sx={{ my: 1 }} />
                        <Stack spacing={1}>
                          {club.children.activeCount !== undefined && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <CheckCircle fontSize="small" color="success" />
                              <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                <strong>{club.children.activeCount}</strong> criança(s) ativa(s)
                              </Typography>
                            </Box>
                          )}
                          {club.children.inactiveCount !== undefined && club.children.inactiveCount > 0 && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <PersonOff fontSize="small" color="disabled" />
                              <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                <strong>{club.children.inactiveCount}</strong> criança(s) inativa(s)
                              </Typography>
                            </Box>
                          )}
                          {club.children.note && (
                            <Alert severity="info" sx={{ mt: 1 }}>
                              <Typography variant="caption" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                                {club.children.note}
                              </Typography>
                            </Alert>
                          )}
                        </Stack>
                      </Paper>
                    )}

                    {club.children.missing > 0 && club.children.missingList && (
                      <Paper elevation={0} sx={{ p: 1.5, borderRadius: 2, border: '2px solid #ff980050' }}>
                        <Typography variant="subtitle2" fontWeight="bold" color="error" gutterBottom sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                          ⚠️ Crianças Sem Pagela ({club.children.missing}):
                        </Typography>
                        <Divider sx={{ my: 1 }} />
                        <Stack spacing={0.75}>
                          {club.children.missingList.map((child) => (
                            <Box
                              key={child.childId}
                              sx={{
                                p: 1,
                                bgcolor: 'white',
                                borderRadius: 1,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                              }}
                            >
                              <PersonOff fontSize="small" color="error" />
                              <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                {child.childName}
                              </Typography>
                            </Box>
                          ))}
                        </Stack>
                      </Paper>
                    )}

                    {club.exception && (
                      <Alert severity="info" sx={{ mt: 2 }}>
                        <AlertTitle sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>ℹ️ Exceção Cadastrada</AlertTitle>
                        <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                          {club.exception.reason || 'Exceção registrada para esta data'}
                        </Typography>
                      </Alert>
                    )}
                  </Box>
                </Collapse>
              </Card>
            );
          })}
        </Box>
  );
}
