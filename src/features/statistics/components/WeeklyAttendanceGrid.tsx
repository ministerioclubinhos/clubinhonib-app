import React from 'react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  useTheme,
  Grid2,
  Chip,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  IconButton,
  TablePagination,
  Card,
  CardContent,
  useMediaQuery,
  Stack,
  Divider,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  BeachAccess,
  Block,
  HourglassEmpty,
  EventBusy,
  HelpOutline,
  Timelapse,
  NavigateBefore,
  NavigateNext,
  CalendarToday,
} from '@mui/icons-material';
import { useWeeklyAttendance, useCurrentWeek, useAcademicYears } from '../hooks';
import dayjs from 'dayjs';
import { ChartError } from './ui';
import { WeeklyClubStatus } from '../types';
import {
  ATTENDANCE_EMPTY_MESSAGES,
  NO_DATA_PLACEHOLDER,
  WEEKLY_CLUB_STATUS_LABELS,
} from '../constants';

export const WeeklyAttendanceGrid: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { data: currentWeekInfo } = useCurrentWeek();
  // Os anos que têm período letivo cadastrado, e não os três últimos anos de
  // calendário: escolher um ano sem período devolvia um painel vazio sem dizer
  // por quê, e um período mais antigo era inalcançável.
  const { data: academicYears = [] } = useAcademicYears();

  const [academicYear, setAcademicYear] = React.useState<number | null>(
    currentWeekInfo?.academicYear || null
  );
  const [academicWeek, setAcademicWeek] = React.useState<number | null>(
    currentWeekInfo?.academicWeek || null
  );
  const [page, setPage] = React.useState(1);

  const mobileLimit = 5;
  const desktopLimit = 20;
  const [limit, setLimit] = React.useState(isMobile ? mobileLimit : desktopLimit);

  React.useEffect(() => {
    const newLimit = isMobile ? mobileLimit : desktopLimit;
    if (limit !== newLimit) {
      setLimit(newLimit);
      setPage(1);
    }
  }, [isMobile, limit]);

  const { data, isLoading, error, refetch } = useWeeklyAttendance({
    year: academicYear || new Date().getFullYear(),
    week: academicWeek || 1,
    page,
    limit
  });

  React.useEffect(() => {
    if (currentWeekInfo?.academicYear && currentWeekInfo?.academicWeek) {
      if (academicYear === null || academicWeek === null) {
        setAcademicYear(currentWeekInfo.academicYear);
        setAcademicWeek(currentWeekInfo.academicWeek);
      }
    }
  }, [currentWeekInfo, academicYear, academicWeek]);

  const getStatusConfig = (status: WeeklyClubStatus) => {
    // Ícone e cor de cada situação; o rótulo vem de `constants.ts`. Cores:
    // parcial é o alerta (âmbar); férias/exceção e "aguardando" não são
    // problema, então saem do âmbar e do vermelho.
    switch (status) {
      case WeeklyClubStatus.Ok:
        return {
          icon: <CheckCircle />,
          color: theme.palette.success.main,
          label: WEEKLY_CLUB_STATUS_LABELS[status],
          bgcolor: `${theme.palette.success.main}20`,
        };
      case WeeklyClubStatus.Partial:
        return {
          icon: <Timelapse />,
          color: theme.palette.warning.dark,
          label: WEEKLY_CLUB_STATUS_LABELS[status],
          bgcolor: `${theme.palette.warning.main}20`,
        };
      case WeeklyClubStatus.Missing:
        return {
          icon: <Cancel />,
          color: theme.palette.error.main,
          label: WEEKLY_CLUB_STATUS_LABELS[status],
          bgcolor: `${theme.palette.error.main}20`,
        };
      case WeeklyClubStatus.Pending:
        return {
          icon: <HourglassEmpty />,
          color: theme.palette.info.dark,
          label: WEEKLY_CLUB_STATUS_LABELS[status],
          bgcolor: `${theme.palette.info.main}14`,
        };
      case WeeklyClubStatus.Vacation:
        return {
          icon: <BeachAccess />,
          color: theme.palette.secondary.dark,
          label: WEEKLY_CLUB_STATUS_LABELS[status],
          bgcolor: `${theme.palette.secondary.main}14`,
        };
      case WeeklyClubStatus.OutOfPeriod:
        return {
          icon: <EventBusy />,
          color: theme.palette.text.secondary,
          label: WEEKLY_CLUB_STATUS_LABELS[status],
          bgcolor: theme.palette.action.hover,
        };
      case WeeklyClubStatus.Inactive:
        return {
          icon: <Block />,
          color: theme.palette.grey[500],
          label: WEEKLY_CLUB_STATUS_LABELS[status],
          bgcolor: theme.palette.grey[200],
        };
      default:
        // Um estado que o back passe a mandar antes de a tela conhecê-lo.
        return {
          icon: <HelpOutline />,
          color: theme.palette.grey[600],
          label: 'Desconhecido',
          bgcolor: theme.palette.grey[200],
        };
    }
  };

  const weekdayNames: Record<string, string> = {
    MONDAY: 'Segunda',
    TUESDAY: 'Terça',
    WEDNESDAY: 'Quarta',
    THURSDAY: 'Quinta',
    FRIDAY: 'Sexta',
    SATURDAY: 'Sábado',
    SUNDAY: 'Domingo',
    monday: 'Segunda',
    tuesday: 'Terça',
    wednesday: 'Quarta',
    thursday: 'Quinta',
    friday: 'Sexta',
    saturday: 'Sábado',
    sunday: 'Domingo',
  };

  const handlePrevWeek = () => {
    if (academicWeek !== null && academicWeek > 1) {
      setAcademicWeek(academicWeek - 1);
    } else if (academicWeek === 1 && academicYear !== null) {
      setAcademicYear(academicYear - 1);
      setAcademicWeek(50);
    }
    setPage(1);
  };

  const handleNextWeek = () => {
    if (academicWeek !== null) {
      setAcademicWeek(academicWeek + 1);
    }
    setPage(1);
  };

  React.useEffect(() => {
    setPage(1);
  }, [academicYear, academicWeek]);

  if (isLoading) {
    return (
      <Paper data-testid="statistics-weekly-attendance-grid" elevation={3} sx={{ p: 3, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      </Paper>
    );
  }

  if (!data) {
    return (
      <Paper data-testid="statistics-weekly-attendance-grid" elevation={3} sx={{ p: 3, borderRadius: 3 }}>
        <ChartError
          subject="os dados semanais"
          error={error}
          onRetry={() => void refetch()}
        />
      </Paper>
    );
  }

  const hasClubs = data.clubs && data.clubs.length > 0;
  // Nenhum clubinho era esperado ainda (todos aguardando, em exceção ou sem
  // crianças): a taxa não existe, e "0%" seria lido como semana ruim.
  const hasExpectedClubs = data.summary.clubsActive > 0;
  const isCurrentWeek = academicYear === currentWeekInfo?.academicYear &&
    academicWeek === currentWeekInfo?.academicWeek;

  return (
    <Box data-testid="statistics-weekly-attendance-grid">
      <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CalendarToday sx={{ color: theme.palette.primary.main }} />
            <Box>
              <Typography variant="h6" fontWeight="bold">
                Semana {academicWeek || data.week} do Ano Letivo {academicYear || data.year}
                {isCurrentWeek && (
                  <Chip label="ATUAL" size="small" color="primary" sx={{ ml: 1, fontWeight: 'bold' }} />
                )}
              </Typography>
              {data.weekRange.start && data.weekRange.end && (
                <Typography variant="caption" color="text.secondary">
                  {dayjs(data.weekRange.start).format('DD/MM')} - {dayjs(data.weekRange.end).format('DD/MM/YYYY')}
                </Typography>
              )}
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: { xs: '100%', sm: 'auto' }, mt: { xs: 2, sm: 0 } }}>
            <IconButton size="small" onClick={handlePrevWeek} disabled={academicWeek === null || academicWeek <= 1} aria-label="Semana anterior">
              <NavigateBefore />
            </IconButton>
            <TextField
              select
              value={academicWeek || 1}
              onChange={(e) => setAcademicWeek(Number(e.target.value))}
              size="small"
              sx={{ width: { xs: '100%', sm: 120 }, flex: { xs: 1, sm: 'none' } }}
              label="Semana"
            >
              {Array.from({ length: 50 }, (_, i) => i + 1).map((w) => (
                <MenuItem key={w} value={w}>
                  Semana {w}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              value={academicYear || new Date().getFullYear()}
              onChange={(e) => setAcademicYear(Number(e.target.value))}
              size="small"
              sx={{ width: { xs: '100%', sm: 100 }, flex: { xs: 1, sm: 'none' } }}
              label="Ano"
            >
              {academicYears.map((y) => (
                <MenuItem key={y} value={y}>
                  {y}
                </MenuItem>
              ))}
            </TextField>
            <IconButton size="small" onClick={handleNextWeek} aria-label="Próxima semana">
              <NavigateNext />
            </IconButton>
          </Box>
        </Box>
      </Paper>

      {!hasClubs && data.note && (
        <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2, border: `2px solid ${theme.palette.warning.main}`, bgcolor: theme.palette.warning.main + '08' }}>
          <Typography variant="h6" fontWeight="bold" color="warning.main" gutterBottom>
            ⚠️ {data.note}
          </Typography>
          {data.period && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Período letivo: {dayjs(data.period.startDate).format('DD/MM/YYYY')} até {dayjs(data.period.endDate).format('DD/MM/YYYY')}
            </Typography>
          )}
        </Paper>
      )}

      {!hasClubs && !data.note && (
        <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
          <Typography color="text.secondary">Nenhum clubinho encontrado para esta semana.</Typography>
        </Paper>
      )}

      {hasClubs && (
        <>

          <Grid2 container spacing={2} sx={{ mb: 3 }}>
            <Grid2 size={{ xs: 12, sm: 6, md: 2.4 }}>
              <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: `2px solid ${theme.palette.divider}` }}>
                <Typography variant="caption" color="text.secondary">
                  Total de Clubinhos
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="primary">
                  {data.summary.totalClubs}
                </Typography>
              </Paper>
            </Grid2>

            <Grid2 size={{ xs: 12, sm: 6, md: 2.4 }}>
              <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: `2px solid ${theme.palette.divider}` }}>
                <Typography variant="caption" color="text.secondary">
                  Com Pagela
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="success.main">
                  {data.summary.clubsWithPagela}
                </Typography>
              </Paper>
            </Grid2>

            <Grid2 size={{ xs: 12, sm: 6, md: 2.4 }}>
              <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: `2px solid ${theme.palette.divider}` }}>
                <Typography variant="caption" color="text.secondary">
                  Faltaram
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="error.main">
                  {data.summary.clubsMissing}
                </Typography>
              </Paper>
            </Grid2>

            <Grid2 size={{ xs: 12, sm: 6, md: 2.4 }}>
              <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: `2px solid ${theme.palette.divider}` }}>
                <Typography variant="caption" color="text.secondary">
                  Taxa de Frequência
                </Typography>
                {hasExpectedClubs ? (
                  <Typography
                    data-testid="statistics-weekly-attendance-rate"
                    variant="h5"
                    fontWeight="bold"
                    color={data.summary.attendanceRate >= 80 ? 'success.main' : 'warning.main'}
                  >
                    {data.summary.attendanceRate.toFixed(1)}%
                  </Typography>
                ) : (
                  <Typography
                    data-testid="statistics-weekly-attendance-rate"
                    variant="h5"
                    fontWeight="bold"
                    color="text.secondary"
                  >
                    {NO_DATA_PLACEHOLDER}
                  </Typography>
                )}
              </Paper>
            </Grid2>

            <Grid2 size={{ xs: 12, sm: 6, md: 2.4 }}>
              <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: `2px solid ${theme.palette.divider}` }}>
                <Typography variant="caption" color="text.secondary">
                  Clubinhos Ativos
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="info.main">
                  {data.summary.clubsActive}
                </Typography>
              </Paper>
            </Grid2>
          </Grid2>

          <Paper
            elevation={0}
            sx={{
              p: 2,
              mb: 3,
              borderRadius: 2,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}08 0%, ${theme.palette.success.main}08 100%)`,
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', columnGap: 1, mb: 1 }}>
              <Typography variant="body2" fontWeight={600}>
                Frequência Geral da Semana
              </Typography>
              <Typography variant="body2" fontWeight="bold" color="primary">
                {data.summary.clubsWithPagela} de {data.summary.clubsActive} clubinhos
              </Typography>
            </Box>
            {hasExpectedClubs ? (
              <LinearProgress
                variant="determinate"
                value={Math.min(100, Math.max(0, data.summary.attendanceRate))}
                aria-label="Frequência geral da semana"
                sx={{
                  height: 12,
                  borderRadius: 6,
                  bgcolor: `${theme.palette.error.main}20`,
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 6,
                    background: `linear-gradient(90deg, ${theme.palette.success.main} 0%, ${theme.palette.primary.main} 100%)`,
                  },
                }}
              />
            ) : (
              <Typography
                data-testid="statistics-weekly-attendance-empty"
                variant="body2"
                color="text.secondary"
              >
                {ATTENDANCE_EMPTY_MESSAGES.noExpectedClubs}
              </Typography>
            )}
          </Paper>

          {isMobile ? (
            <Stack spacing={1.5}>
              {data.clubs.map((club) => {
                const statusConfig = getStatusConfig(club.status);
                return (
                  <Card
                    key={club.clubId}
                    elevation={1}
                    sx={{
                      borderRadius: 1.5,
                      border: `1.5px solid ${statusConfig.color}40`,
                      bgcolor: statusConfig.bgcolor,
                    }}
                  >
                    <CardContent sx={{ p: { xs: 1, sm: 2 }, '&:last-child': { pb: { xs: 1, sm: 2 } } }}>
                      <Stack spacing={1}>

                        <Box>
                          <Typography fontWeight="bold" sx={{ fontSize: { xs: '0.85rem', sm: '1.125rem' } }}>
                            Clubinho #{club.clubNumber}
                          </Typography>
                        </Box>

                        <Divider sx={{ my: 0.5 }} />

                        <Grid2 container spacing={1}>
                          <Grid2 size={6}>
                            <Box>
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                                Dia da Semana
                              </Typography>
                              <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '1rem' } }}>
                                {weekdayNames[club.weekday] || club.weekday}
                              </Typography>
                            </Box>
                          </Grid2>
                          <Grid2 size={6}>
                            <Box>
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                                Data Esperada
                              </Typography>
                              <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '1rem' } }}>
                                {dayjs(club.expectedDate).format('DD/MM/YYYY')}
                              </Typography>
                            </Box>
                          </Grid2>
                        </Grid2>

                        <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', mt: 0.5 }}>
                          <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                              Pagelas
                            </Typography>
                            <Box sx={{ mt: 0.25 }}>
                              {club.hasPagela ? (
                                <Chip
                                  label={club.totalPagelas || 0}
                                  size="small"
                                  color="success"
                                  sx={{
                                    fontSize: { xs: '0.65rem', sm: '0.75rem' },
                                    height: { xs: 20, sm: 24 },
                                    '& .MuiChip-label': { px: { xs: 0.75, sm: 1 } }
                                  }}
                                />
                              ) : (
                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', sm: '1rem' } }}>
                                  -
                                </Typography>
                              )}
                            </Box>
                          </Box>
                          <Box>
                            <Chip
                              data-testid="statistics-weekly-attendance-status"
                              data-status={club.status}
                              icon={statusConfig.icon}
                              label={statusConfig.label}
                              size="small"
                              sx={{
                                maxWidth: '100%',
                                bgcolor: statusConfig.bgcolor,
                                color: statusConfig.color,
                                border: `1px solid ${statusConfig.color}`,
                                fontWeight: 600,
                                fontSize: '0.75rem',
                                height: 24,
                                '& .MuiChip-icon': { fontSize: 16, color: 'inherit' },
                                '& .MuiChip-label': { px: 1 }
                              }}
                            />
                          </Box>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                );
              })}
            </Stack>
          ) : (

            <TableContainer
              component={Paper}
              elevation={0}
              sx={{ borderRadius: 2, border: `2px solid ${theme.palette.divider}` }}
            >
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'primary.main' }}>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Clubinho</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Dia da Semana</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Data Esperada</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">
                      Pagelas
                    </TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">
                      Status
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.clubs.map((club) => {
                    const statusConfig = getStatusConfig(club.status);
                    return (
                      <TableRow
                        key={club.clubId}
                        hover
                        sx={{
                          bgcolor: statusConfig.bgcolor,
                        }}
                      >
                        <TableCell>
                          <Typography fontWeight="bold" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Clubinho #{club.clubNumber}</Typography>
                        </TableCell>
                        <TableCell sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>{weekdayNames[club.weekday] || club.weekday}</TableCell>
                        <TableCell sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>{dayjs(club.expectedDate).format('DD/MM/YYYY')}</TableCell>
                        <TableCell align="center">
                          {club.hasPagela ? (
                            <Chip label={club.totalPagelas || 0} size="small" color="success" />
                          ) : (
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                              -
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            data-testid="statistics-weekly-attendance-status"
                            data-status={club.status}
                            icon={statusConfig.icon}
                            label={statusConfig.label}
                            size="small"
                            sx={{
                              bgcolor: statusConfig.bgcolor,
                              color: statusConfig.color,
                              border: `1px solid ${statusConfig.color}`,
                              fontWeight: 600,
                              '& .MuiChip-icon': { color: 'inherit' },
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {data.pagination && (
            <Box sx={{ px: { xs: 1, sm: 0 }, mt: 2 }}>
              <TablePagination
                component="div"
                count={data.pagination.total}
                page={data.pagination.page - 1}
                onPageChange={(event, newPage) => setPage(newPage + 1)}
                rowsPerPage={data.pagination.limit}
                onRowsPerPageChange={(event) => {
                  setLimit(parseInt(event.target.value, 10));
                  setPage(1);
                }}
                rowsPerPageOptions={isMobile ? [5, 10, 20] : [10, 20, 50, 100]}
                labelRowsPerPage="Clubinhos por página:"
                labelDisplayedRows={({ from, to, count }) =>
                  `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`
                }
                sx={{
                  '& .MuiTablePagination-toolbar': {
                    flexWrap: 'wrap',
                    gap: 1,
                    px: { xs: 0, sm: 2 },
                  },
                  '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  },
                }}
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

