import React from 'react';
import {
  Alert,
  AlertTitle,
  Box,
  Card,
  CardContent,
  Collapse,
  Divider,
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
        <Box data-testid="club-control-clubs-list-mobile-cards" sx={{ p: { xs: 1, sm: 2 } }}>
          {clubs.map((club) => {
            const statusConfig = getStatusConfig(club.status);
            const isExpanded = expandedClubs.has(club.clubId);
            const completeness =
              club.children.total > 0 ? (club.children.withPagela / club.children.total) * 100 : 0;

            return (
              <Card
                key={club.clubId}
                elevation={0}
                sx={{
                  mb: 1,
                  border: `1px solid ${statusConfig.borderColor}55`,
                  borderLeft: `5px solid ${statusConfig.borderColor}`,
                  bgcolor: statusConfig.bgcolor,
                  borderRadius: 2,
                  overflow: 'hidden',
                }}
              >
                <CardContent
                  data-testid="club-control-club-row"
                  data-status={club.status}
                  sx={{ p: 0, '&:last-child': { pb: 0 } }}
                >
                  <Box
                    role="button"
                    tabIndex={0}
                    aria-expanded={isExpanded}
                    aria-label={`Clubinho ${club.clubNumber}: ${statusConfig.label}. Mostrar ou esconder os detalhes`}
                    onClick={() => onToggleExpanded(club.clubId)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onToggleExpanded(club.clubId);
                      }
                    }}
                    sx={{ px: 1.25, py: 1, minHeight: 56, cursor: 'pointer' }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1.25}>
                      <Box
                        sx={{
                          minWidth: 44,
                          height: 36,
                          px: 0.5,
                          borderRadius: 2,
                          bgcolor: statusConfig.color,
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 900,
                          fontSize: '0.95rem',
                        }}
                      >
                        {club.clubNumber}
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack direction="row" alignItems="center" spacing={0.75} flexWrap="wrap" useFlexGap>
                          <Typography variant="body2" fontWeight={800}>
                            {club.weekday ? weekdayNames[club.weekday] || club.weekday : 'Sem dia'}
                            {club.week.expectedDate ? ` · ${dayjs(club.week.expectedDate).format('DD/MM')}` : ''}
                          </Typography>
                          <Typography variant="caption" sx={{ color: statusConfig.color, fontWeight: 800 }}>
                            {statusConfig.label}
                          </Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.5 }}>
                          <LinearProgress
                            variant="determinate"
                            value={completeness}
                            sx={{
                              flex: 1,
                              height: 6,
                              borderRadius: 3,
                              bgcolor: statusConfig.color + '25',
                              '& .MuiLinearProgress-bar': { bgcolor: statusConfig.color, borderRadius: 3 },
                            }}
                          />
                          <Typography variant="caption" fontWeight={800} sx={{ minWidth: 38, textAlign: 'right' }}>
                            {club.children.withPagela}/{club.children.total}
                          </Typography>
                        </Stack>
                      </Box>
                      <Box sx={{ display: 'flex', color: 'text.secondary' }}>
                        {isExpanded ? <ExpandLess /> : <ExpandMore />}
                      </Box>
                    </Stack>
                  </Box>
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
