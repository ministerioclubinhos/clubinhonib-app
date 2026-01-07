import React from 'react';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  useTheme,
  Grid,
  Chip,
  LinearProgress,
  Alert,
  AlertTitle,
  TextField,
  MenuItem,
  Button,
  TablePagination,
  Collapse,
  IconButton,
  useMediaQuery,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Warning,
  Info,
  CalendarToday,
  TrendingUp,
  TrendingDown,
  ExpandMore,
  ExpandLess,
} from '@mui/icons-material';
import { useClubAttendance, useClubs } from '../hooks';
import dayjs from 'dayjs';

const weekdayNames: Record<string, string> = {
  MONDAY: 'Segunda-feira',
  TUESDAY: 'Terça-feira',
  WEDNESDAY: 'Quarta-feira',
  THURSDAY: 'Quinta-feira',
  FRIDAY: 'Sexta-feira',
  SATURDAY: 'Sábado',
  SUNDAY: 'Domingo',
  monday: 'Segunda-feira',
  tuesday: 'Terça-feira',
  wednesday: 'Quarta-feira',
  thursday: 'Quinta-feira',
  friday: 'Sexta-feira',
  saturday: 'Sábado',
  sunday: 'Domingo',
};

export const ClubAttendanceTimeline: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const currentYear = new Date().getFullYear();
  const [selectedClubId, setSelectedClubId] = React.useState<string>('');
  const [year, setYear] = React.useState(currentYear);
  // ⭐ Paginação v2.5.0
  const [timelinePage, setTimelinePage] = React.useState(1);
  const [timelineLimit, setTimelineLimit] = React.useState(20);
  const [missingWeeksPage, setMissingWeeksPage] = React.useState(1);
  // Estados para colapsar seções
  const [expandedTimeline, setExpandedTimeline] = React.useState(true);
  const [expandedMissingWeeks, setExpandedMissingWeeks] = React.useState(false);

  const { data: clubsData } = useClubs({ page: 1, limit: 100 });
  const { data, isLoading } = useClubAttendance(selectedClubId, {
    year,
    page: timelinePage,
    limit: timelineLimit,
  });

  // Selecionar primeiro clube automaticamente
  React.useEffect(() => {
    if (!selectedClubId && clubsData?.clubs && clubsData.clubs.length > 0) {
      setSelectedClubId(clubsData.clubs[0].clubId);
    }
  }, [clubsData, selectedClubId]);

  // ⭐ Reset página ao mudar clube/ano v2.5.0
  React.useEffect(() => {
    setTimelinePage(1);
    setMissingWeeksPage(1);
  }, [selectedClubId, year]);

  const getSeverityColor = (severity: 'info' | 'warning' | 'critical') => {
    switch (severity) {
      case 'critical':
        return theme.palette.error.main;
      case 'warning':
        return theme.palette.warning.main;
      default:
        return theme.palette.info.main;
    }
  };

  const getSeverityIcon = (severity: 'info' | 'warning' | 'critical') => {
    switch (severity) {
      case 'critical':
        return <Cancel />;
      case 'warning':
        return <Warning />;
      default:
        return <Info />;
    }
  };

  const getSeverityLabel = (severity: 'info' | 'warning' | 'critical') => {
    switch (severity) {
      case 'critical':
        return 'Crítico';
      case 'warning':
        return 'Atenção';
      case 'info':
        return 'Informação';
      default:
        return severity;
    }
  };

  const translateAlertType = (type: string) => {
    const translations: Record<string, string> = {
      missing_weeks: 'Semanas Faltantes',
      low_attendance: 'Baixa Frequência',
      no_pagela: 'Sem Pagela',
      incomplete_pagela: 'Pagela Incompleta',
      exception: 'Exceção',
      out_of_period: 'Fora do Período',
    };

    return (
      translations[type.toLowerCase()] ||
      type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
    );
  };

  if (isLoading) {
    return (
      <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      </Paper>
    );
  }

  return (
    <Box>
      {/* Seleção de Clubinho */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 1.5, sm: 2 },
          mb: { xs: 2, sm: 3 },
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Grid container spacing={{ xs: 1.5, sm: 2 }} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              select
              label="Selecione um Clubinho"
              value={selectedClubId}
              onChange={(e) => setSelectedClubId(e.target.value)}
              size="small"
            >
              {clubsData?.clubs && clubsData.clubs.length > 0 ? (
                clubsData.clubs.map((club) => (
                  <MenuItem key={club.clubId} value={club.clubId}>
                    Clubinho #{club.clubNumber} - {weekdayNames[club.weekday] || club.weekday} -{' '}
                    {club.address.city}
                  </MenuItem>
                ))
              ) : (
                <MenuItem value="" disabled>
                  Nenhum clubinho disponível
                </MenuItem>
              )}
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              select
              label="Ano"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              size="small"
            >
              {[currentYear, currentYear - 1, currentYear - 2].map((y) => (
                <MenuItem key={y} value={y}>
                  {y}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {!selectedClubId ? (
        <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
          <Typography color="text.secondary">
            Selecione um clubinho para ver a frequência
          </Typography>
        </Paper>
      ) : !data ? (
        <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        </Paper>
      ) : (
        <>
          {/* Cards de Resumo - Compactos */}
          <Grid container spacing={{ xs: 1, sm: 1.5 }} sx={{ mb: { xs: 2, sm: 3 } }}>
            <Grid item xs={6} sm={3}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 1.5, sm: 2 },
                  borderRadius: 2,
                  background: `linear-gradient(135deg, ${theme.palette.success.main}15 0%, ${theme.palette.success.main}05 100%)`,
                  border: `2px solid ${theme.palette.success.main}30`,
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                >
                  Taxa de Frequência
                </Typography>
                <Typography
                  variant="h5"
                  fontWeight="bold"
                  color="success.main"
                  sx={{ fontSize: { xs: '1.5rem', sm: '2rem' }, mb: 0.5 }}
                >
                  {data.attendance.attendanceRate.toFixed(1)}%
                </Typography>
                <Chip
                  icon={<CheckCircle />}
                  label={`${data.attendance.weeksWithPagela}/${data.attendance.weeksExpected}`}
                  size="small"
                  color="success"
                  sx={{
                    mt: { xs: 0.5, sm: 1 },
                    fontSize: { xs: '0.65rem', sm: '0.7rem' },
                    height: { xs: 20, sm: 24 },
                    '& .MuiChip-icon': { fontSize: { xs: 14, sm: 16 } },
                  }}
                />
              </Paper>
            </Grid>

            <Grid item xs={6} sm={3}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 1.5, sm: 2 },
                  borderRadius: 2,
                  background: `linear-gradient(135deg, ${theme.palette.warning.main}15 0%, ${theme.palette.warning.main}05 100%)`,
                  border: `2px solid ${theme.palette.warning.main}30`,
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                >
                  Semanas Faltantes
                </Typography>
                <Typography
                  variant="h5"
                  fontWeight="bold"
                  color="warning.main"
                  sx={{ fontSize: { xs: '1.5rem', sm: '2rem' }, mb: 0.5 }}
                >
                  {data.attendance.weeksMissing}
                </Typography>
                <Chip
                  icon={<Warning />}
                  label={data.attendance.weeksMissing === 0 ? 'Nenhuma' : 'Atenção!'}
                  size="small"
                  color={data.attendance.weeksMissing === 0 ? 'success' : 'warning'}
                  sx={{
                    mt: { xs: 0.5, sm: 1 },
                    fontSize: { xs: '0.65rem', sm: '0.7rem' },
                    height: { xs: 20, sm: 24 },
                    '& .MuiChip-icon': { fontSize: { xs: 14, sm: 16 } },
                  }}
                />
              </Paper>
            </Grid>

            <Grid item xs={6} sm={3}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 1.5, sm: 2 },
                  borderRadius: 2,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.primary.main}05 100%)`,
                  border: `2px solid ${theme.palette.primary.main}30`,
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                >
                  Sequência Atual
                </Typography>
                <Box
                  sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 }, mb: 0.5 }}
                >
                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    color="primary"
                    sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}
                  >
                    {data.attendance.consecutiveWeeksPresent}
                  </Typography>
                  <TrendingUp
                    sx={{ color: theme.palette.success.main, fontSize: { xs: 18, sm: 20 } }}
                  />
                </Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                >
                  semanas consecutivas
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={6} sm={3}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 1.5, sm: 2 },
                  borderRadius: 2,
                  background: `linear-gradient(135deg, ${theme.palette.info.main}15 0%, ${theme.palette.info.main}05 100%)`,
                  border: `2px solid ${theme.palette.info.main}30`,
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                >
                  Período
                </Typography>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  color="info.main"
                  sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' }, mb: 0.5 }}
                >
                  {data.period.activeWeeks} semanas
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                >
                  de {data.period.totalWeeks} do ano
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* ⭐ v2.7.0: Note informativo quando não há período letivo */}
          {data.note && (
            <Alert
              severity="warning"
              sx={{ mb: { xs: 2, sm: 3 }, fontSize: { xs: '0.875rem', sm: '1rem' } }}
            >
              <AlertTitle sx={{ fontWeight: 'bold', fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                ⚠️ Aviso
              </AlertTitle>
              {data.note}
            </Alert>
          )}

          {/* Alertas - Todos lado a lado */}
          {data.alerts && data.alerts.length > 0 && (
            <Box sx={{ mb: { xs: 2, sm: 3 } }}>
              <Grid container spacing={{ xs: 1, sm: 1.5 }}>
                {data.alerts.map((alert, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Alert
                      severity={alert.severity}
                      icon={getSeverityIcon(alert.severity)}
                      sx={{ fontSize: { xs: '0.875rem', sm: '1rem' }, height: '100%' }}
                    >
                      <AlertTitle
                        sx={{ fontWeight: 'bold', fontSize: { xs: '0.875rem', sm: '1rem' } }}
                      >
                        {translateAlertType(alert.type)}
                      </AlertTitle>
                      {alert.message}
                    </Alert>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Timeline Visual - Colapsável */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.primary.main}03 100%)`,
              border: `2px solid ${theme.palette.divider}`,
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                p: { xs: 1.5, sm: 2 },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                bgcolor: theme.palette.grey[50],
                borderBottom: expandedTimeline ? `1px solid ${theme.palette.divider}` : 'none',
              }}
              onClick={() => setExpandedTimeline(!expandedTimeline)}
            >
              <Box>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
                >
                  📅 Timeline Semanal - {year}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                >
                  {dayjs(data.period.startDate).format('DD/MM/YYYY')} até{' '}
                  {dayjs(data.period.endDate).format('DD/MM/YYYY')}
                </Typography>
              </Box>
              <IconButton size="small">
                {expandedTimeline ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            </Box>

            <Collapse in={expandedTimeline}>
              <Box sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
                {/* Grid de Semanas - Compacto */}
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: isMobile
                      ? 'repeat(auto-fill, minmax(45px, 1fr))'
                      : 'repeat(auto-fill, minmax(55px, 1fr))',
                    gap: { xs: 0.5, sm: 1 },
                  }}
                >
                  {data.timeline.map((week) => (
                    <Box
                      key={`${week.year}-${week.week}`}
                      sx={{
                        p: { xs: 0.5, sm: 1 },
                        borderRadius: 1,
                        textAlign: 'center',
                        bgcolor: week.hasPagela
                          ? `${theme.palette.success.main}20`
                          : `${theme.palette.error.main}20`,
                        border: `2px solid ${
                          week.hasPagela ? theme.palette.success.main : theme.palette.error.main
                        }`,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          transform: 'scale(1.05)',
                          boxShadow: 2,
                        },
                      }}
                    >
                      <Typography
                        variant="caption"
                        fontWeight="bold"
                        display="block"
                        sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                      >
                        S{week.week}
                      </Typography>
                      {week.hasPagela ? (
                        <CheckCircle
                          sx={{ fontSize: { xs: 16, sm: 20 }, color: theme.palette.success.main }}
                        />
                      ) : (
                        <Cancel
                          sx={{ fontSize: { xs: 16, sm: 20 }, color: theme.palette.error.main }}
                        />
                      )}
                      {week.hasPagela && week.totalPagelas && (
                        <Typography
                          variant="caption"
                          display="block"
                          color="text.secondary"
                          sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                        >
                          {week.totalPagelas}
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Box>

                {/* Legenda - Compacta */}
                <Box
                  sx={{
                    mt: { xs: 2, sm: 3 },
                    display: 'flex',
                    gap: { xs: 1.5, sm: 2 },
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <CheckCircle
                      sx={{ color: theme.palette.success.main, fontSize: { xs: 16, sm: 18 } }}
                    />
                    <Typography
                      variant="caption"
                      sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                    >
                      Com Pagela
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Cancel
                      sx={{ color: theme.palette.error.main, fontSize: { xs: 16, sm: 18 } }}
                    />
                    <Typography
                      variant="caption"
                      sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                    >
                      Sem Pagela
                    </Typography>
                  </Box>
                </Box>

                {/* ⭐ Paginação Timeline v2.5.0 */}
                {data.timelinePagination && (
                  <Box sx={{ mt: { xs: 1.5, sm: 2 }, px: { xs: 0, sm: 0 } }}>
                    <TablePagination
                      component="div"
                      count={data.timelinePagination.total}
                      page={data.timelinePagination.page - 1}
                      onPageChange={(event, newPage) => setTimelinePage(newPage + 1)}
                      rowsPerPage={data.timelinePagination.limit}
                      onRowsPerPageChange={(event) => {
                        setTimelineLimit(parseInt(event.target.value, 10));
                        setTimelinePage(1);
                      }}
                      rowsPerPageOptions={[10, 20, 50, 100]}
                      labelRowsPerPage="Semanas por página:"
                      labelDisplayedRows={({ from, to, count }) =>
                        `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`
                      }
                      sx={{
                        borderTop: 1,
                        borderColor: 'divider',
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
              </Box>
            </Collapse>
          </Paper>

          {/* ⭐ v2.7.0: missingWeeks pode estar vazio se não há período letivo - Colapsável */}
          {data.missingWeeks && data.missingWeeks.length > 0 ? (
            <Paper
              elevation={0}
              sx={{
                mt: { xs: 2, sm: 3 },
                borderRadius: 3,
                background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.warning.main}03 100%)`,
                border: `2px solid ${theme.palette.divider}`,
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  p: { xs: 1.5, sm: 2 },
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  bgcolor: theme.palette.grey[50],
                  borderBottom: expandedMissingWeeks
                    ? `1px solid ${theme.palette.divider}`
                    : 'none',
                }}
                onClick={() => setExpandedMissingWeeks(!expandedMissingWeeks)}
              >
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
                >
                  ⚠️ Semanas Faltantes (
                  {data.missingWeeksPagination?.total || data.missingWeeks.length})
                </Typography>
                <IconButton size="small">
                  {expandedMissingWeeks ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
              </Box>

              <Collapse in={expandedMissingWeeks}>
                <Box sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1, sm: 1.5 } }}>
                    {data.missingWeeks.map((week, index) => (
                      <Box
                        key={index}
                        sx={{
                          p: { xs: 1.5, sm: 2 },
                          borderRadius: 2,
                          bgcolor: `${getSeverityColor(week.severity)}10`,
                          border: `1px solid ${getSeverityColor(week.severity)}40`,
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: { xs: 'wrap', sm: 'nowrap' },
                            gap: 1,
                          }}
                        >
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography
                              variant="subtitle2"
                              fontWeight="bold"
                              sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                            >
                              Semana {week.week} - {dayjs(week.expectedDate).format('DD/MM/YYYY')}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                            >
                              {dayjs(week.weekRange.start).format('DD/MM')} até{' '}
                              {dayjs(week.weekRange.end).format('DD/MM/YYYY')}
                            </Typography>
                          </Box>
                          <Chip
                            icon={getSeverityIcon(week.severity)}
                            label={getSeverityLabel(week.severity)}
                            size="small"
                            sx={{
                              bgcolor: `${getSeverityColor(week.severity)}20`,
                              color: getSeverityColor(week.severity),
                              fontWeight: 600,
                              fontSize: { xs: '0.7rem', sm: '0.75rem' },
                              height: { xs: 24, sm: 28 },
                            }}
                          />
                        </Box>
                      </Box>
                    ))}
                  </Box>

                  {/* ⭐ Paginação Missing Weeks v2.5.0 */}
                  {data.missingWeeksPagination && data.missingWeeksPagination.totalPages > 1 && (
                    <Box sx={{ mt: { xs: 1.5, sm: 2 }, px: { xs: 0, sm: 0 } }}>
                      <TablePagination
                        component="div"
                        count={data.missingWeeksPagination.total}
                        page={data.missingWeeksPagination.page - 1}
                        onPageChange={(event, newPage) => setMissingWeeksPage(newPage + 1)}
                        rowsPerPage={data.missingWeeksPagination.limit}
                        rowsPerPageOptions={[]}
                        labelDisplayedRows={({ from, to, count }) =>
                          `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`
                        }
                        sx={{
                          borderTop: 1,
                          borderColor: 'divider',
                          '& .MuiTablePagination-toolbar': {
                            flexWrap: 'wrap',
                            gap: 1,
                            px: { xs: 0, sm: 2 },
                          },
                          '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows':
                            {
                              fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            },
                        }}
                      />
                    </Box>
                  )}
                </Box>
              </Collapse>
            </Paper>
          ) : (
            <Paper
              elevation={0}
              sx={{
                p: { xs: 1.5, sm: 2, md: 3 },
                mt: { xs: 2, sm: 3 },
                borderRadius: 3,
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: theme.palette.success.main + '08',
              }}
            >
              <Typography
                variant="h6"
                fontWeight="bold"
                color="success.main"
                gutterBottom
                sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
              >
                ✅ Nenhuma Semana Faltante
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
              >
                Este clubinho teve pagela em todas as semanas esperadas do período letivo.
              </Typography>
            </Paper>
          )}
        </>
      )}
    </Box>
  );
};
