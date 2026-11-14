import React from 'react';
import {
  Alert,
  AlertTitle,
  Badge,
  Box,
  Chip,
  Collapse,
  Divider,
  Grid2,
  IconButton,
  LinearProgress,
  List,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
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
 * A listagem de clubinhos no computador.
 *
 * Uma linha por clubinho, com os detalhes numa linha que expande.
 */
export default function ClubsListDesktopTable({
  clubs,
  expandedClubs,
  onToggleExpanded,
}: Props) {
  const theme = useTheme();
  const getStatusConfig = (status: string) => statusConfigOf(status, theme);

  return (

        <TableContainer data-testid="club-control-clubs-list-desktop-table"
          sx={{
            maxHeight: 800,
            overflowX: 'auto',
            '&::-webkit-scrollbar': {
              height: 8,
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: 'grey.100',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'grey.400',
              borderRadius: 4,
            },
          }}
        >
          <Table stickyHeader sx={{ minWidth: 600 }}>
            <TableHead>
              <TableRow>
                <TableCell width={50} sx={{ bgcolor: 'grey.50', fontWeight: 'bold', minWidth: 50 }}></TableCell>
                <TableCell sx={{ bgcolor: 'grey.50', fontWeight: 'bold', minWidth: 150 }}>Clube</TableCell>
                <TableCell sx={{ bgcolor: 'grey.50', fontWeight: 'bold', minWidth: 100 }}>Dia</TableCell>
                <TableCell sx={{ bgcolor: 'grey.50', fontWeight: 'bold', minWidth: 100 }}>Crianças</TableCell>
                <TableCell sx={{ bgcolor: 'grey.50', fontWeight: 'bold', minWidth: 120 }} align="center">
                  Completude
                </TableCell>
                <TableCell sx={{ bgcolor: 'grey.50', fontWeight: 'bold', minWidth: 100 }} align="center">
                  Status
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {clubs.map((club) => {
                const statusConfig = getStatusConfig(club.status);
                const isExpanded = expandedClubs.has(club.clubId);
                const completeness =
                  club.children.total > 0 ? (club.children.withPagela / club.children.total) * 100 : 0;

                return (
                  <React.Fragment key={club.clubId}>
                    <TableRow
                      hover
                      sx={{
                        cursor: 'pointer',
                        bgcolor: statusConfig.bgcolor,
                        '&:hover': { bgcolor: statusConfig.bgcolor + '!important' },
                      }}
                      onClick={() => onToggleExpanded(club.clubId)}
                    >
                      <TableCell>
                        <IconButton size="small" aria-label="Mostrar ou esconder os detalhes do clubinho">
                          {isExpanded ? <ExpandLess /> : <ExpandMore />}
                        </IconButton>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              bgcolor: statusConfig.color + '20',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 'bold',
                              color: statusConfig.color,
                            }}
                          >
                            {club.clubNumber}
                          </Box>
                          <Box>
                            <Typography variant="body2" fontWeight="bold">
                              Clubinho #{club.clubNumber}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {club.week.expectedDate ? dayjs(club.week.expectedDate).format('DD/MM/YYYY') : 'Sem data'}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        {club.weekday ? (
                          <Chip
                            label={weekdayNames[club.weekday] || club.weekday}
                            size="small"
                            variant="outlined"
                            sx={{ fontWeight: 'bold' }}
                          />
                        ) : (
                          <Chip
                            label="N/D"
                            size="small"
                            variant="outlined"
                            color="default"
                            sx={{ fontWeight: 'bold', opacity: 0.5 }}
                            title="Não disponível"
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="body2" fontWeight="bold">
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

                          {club.children.inactiveCount !== undefined && club.children.inactiveCount > 0 && (
                            <Tooltip title={`${club.children.inactiveCount} criança(s) inativa(s) não considerada(s)`}>
                              <Chip
                                label={`${club.children.inactiveCount} inativa(s)`}
                                size="small"
                                variant="outlined"
                                sx={{
                                  fontSize: '0.65rem',
                                  height: 20,
                                  bgcolor: 'grey.100',
                                  color: 'text.secondary'
                                }}
                              />
                            </Tooltip>
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell align="center">
                        <Box>
                          <Typography variant="body2" fontWeight="bold" color={statusConfig.color}>
                            {completeness.toFixed(0)}%
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={completeness}
                            sx={{
                              mt: 0.5,
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
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          icon={statusConfig.icon}
                          label={statusConfig.label}
                          size="small"
                          sx={{
                            bgcolor: statusConfig.bgcolor,
                            color: statusConfig.color,
                            border: `2px solid ${statusConfig.borderColor}`,
                            fontWeight: 'bold',
                          }}
                        />
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell colSpan={6} sx={{ p: 0, border: 'none' }}>
                        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                          <Box sx={{ p: 3, bgcolor: 'grey.50' }}>

                            {club.alerts && club.alerts.length > 0 && (
                              <Box sx={{ mb: 2 }}>
                                {club.alerts.map((alert, index) => (
                                  <Alert key={index} severity={toAlertSeverity(alert.severity)} sx={{ mb: 1 }}>
                                    {alert.message}
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
                                    <Typography variant="body2" fontWeight="bold">
                                      {indicator.message}
                                    </Typography>

                                    {indicator.type === 'children_not_attending' && indicator.details?.childrenList && indicator.details.childrenList.length > 0 && (
                                      <Box sx={{ mt: 1.5 }}>
                                        <Typography variant="caption" fontWeight="bold" display="block" gutterBottom>
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
                                              <Typography variant="caption">
                                                <strong>{child.childName}</strong>
                                                {child.reason && (
                                                  <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
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
                                      <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                                        {indicator.details.note}
                                      </Typography>
                                    )}

                                    {indicator.details?.note && indicator.type !== 'club_inactive' && (
                                      <Typography variant="caption" display="block" sx={{ mt: 1, fontStyle: 'italic' }}>
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
                                  p: 2,
                                  mb: 2,
                                  borderRadius: 2,
                                  border: `2px solid ${theme.palette.info.main}30`,
                                  bgcolor: theme.palette.info.main + '08'
                                }}
                              >
                                <Typography variant="subtitle2" fontWeight="bold" color="info.main" gutterBottom>
                                  ℹ️ Informações sobre Crianças
                                </Typography>
                                <Divider sx={{ my: 1 }} />
                                <Stack spacing={1}>
                                  {club.children.activeCount !== undefined && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <CheckCircle fontSize="small" color="success" />
                                      <Typography variant="body2">
                                        <strong>{club.children.activeCount}</strong> criança(s) ativa(s) considerada(s) nos cálculos
                                      </Typography>
                                    </Box>
                                  )}
                                  {club.children.inactiveCount !== undefined && club.children.inactiveCount > 0 && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <PersonOff fontSize="small" color="disabled" />
                                      <Typography variant="body2" color="text.secondary">
                                        <strong>{club.children.inactiveCount}</strong> criança(s) inativa(s) (não consideradas)
                                      </Typography>
                                    </Box>
                                  )}
                                  {club.children.note && (
                                    <Alert severity="info" sx={{ mt: 1 }}>
                                      <Typography variant="caption">
                                        {club.children.note}
                                      </Typography>
                                    </Alert>
                                  )}
                                </Stack>
                              </Paper>
                            )}

                            {club.children.missing > 0 && club.children.missingList && (
                              <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '2px solid #ff980050' }}>
                                <Typography variant="subtitle2" fontWeight="bold" color="error" gutterBottom>
                                  ⚠️ Crianças Sem Pagela ({club.children.missing}):
                                </Typography>
                                <Divider sx={{ my: 1 }} />
                                <Grid2 container spacing={1}>
                                  {club.children.missingList.map((child) => (
                                    <Grid2 size={{ xs: 12, sm: 6, md: 4 }} key={child.childId}>
                                      <Box
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
                                        <Typography variant="body2">{child.childName}</Typography>
                                      </Box>
                                    </Grid2>
                                  ))}
                                </Grid2>
                              </Paper>
                            )}

                            {club.exception && (
                              <Alert severity="info" sx={{ mt: 2 }}>
                                <AlertTitle>ℹ️ Exceção Cadastrada</AlertTitle>
                                {club.exception.reason || 'Exceção registrada para esta data'}
                              </Alert>
                            )}
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
  );
}
